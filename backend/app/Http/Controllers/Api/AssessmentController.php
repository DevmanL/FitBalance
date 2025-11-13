<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Recommendation;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    /**
     * Calculate BMI (Índice de Masa Corporal)
     */
    private function calculateBMI($weight, $height)
    {
        // height is in cm, convert to meters
        $heightInMeters = $height / 100;
        return round($weight / ($heightInMeters * $heightInMeters), 2);
    }

    /**
     * Calculate GEB (Gasto Energético Basal) using Harris-Benedict equation
     */
    private function calculateGEB($weight, $height, $age, $gender)
    {
        if ($gender === 'male') {
            // Men: GEB = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
            $geb = 88.362 + (13.397 * $weight) + (4.799 * $height) - (5.677 * $age);
        } else {
            // Women: GEB = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
            $geb = 447.593 + (9.247 * $weight) + (3.098 * $height) - (4.330 * $age);
        }
        return round($geb, 2);
    }

    /**
     * Calculate GET (Gasto Energético Total) using activity level multipliers
     */
    private function calculateGET($geb, $activityLevel)
    {
        $multipliers = [
            'sedentary' => 1.2,      // Poco o ningún ejercicio
            'light' => 1.375,        // Ejercicio ligero (1-3 días/semana)
            'moderate' => 1.55,      // Ejercicio moderado (3-5 días/semana)
            'active' => 1.725,       // Ejercicio fuerte (6-7 días/semana)
            'very_active' => 1.9,    // Ejercicio muy fuerte (2 veces al día)
        ];

        $multiplier = $multipliers[$activityLevel] ?? 1.2;
        return round($geb * $multiplier, 2);
    }

    /**
     * Calculate caloric balance (assuming a standard caloric intake for maintenance)
     */
    private function calculateCaloricBalance($get, $dailyIntake = null)
    {
        // If no daily intake provided, assume maintenance (balance = 0)
        if ($dailyIntake === null) {
            return 0;
        }
        return round($dailyIntake - $get, 2);
    }

    /**
     * Generate recommendations based on assessment
     */
    private function generateRecommendations($assessment)
    {
        $recommendations = [];
        $bmi = $assessment->bmi;
        $geb = $assessment->geb;
        $get = $assessment->get;
        $caloricBalance = $assessment->caloric_balance;
        $gender = $assessment->gender;

        // BMI-based recommendations
        if ($bmi < 18.5) {
            $recommendations[] = [
                'type' => 'nutrition',
                'content' => 'Tu IMC indica bajo peso. Se recomienda aumentar la ingesta calórica con alimentos nutritivos y ricos en proteínas. Consulta con un nutricionista para un plan personalizado.',
            ];
            $recommendations[] = [
                'type' => 'exercise',
                'content' => 'Combina ejercicios de fuerza con ejercicios cardiovasculares moderados para ganar masa muscular de forma saludable.',
            ];
        } elseif ($bmi >= 18.5 && $bmi < 25) {
            $recommendations[] = [
                'type' => 'nutrition',
                'content' => 'Tu IMC está en el rango normal. Mantén una dieta equilibrada con todos los grupos alimenticios. Tu gasto energético total (GET) es de ' . $get . ' kcal/día.',
            ];
            $recommendations[] = [
                'type' => 'exercise',
                'content' => 'Mantén un estilo de vida activo. Realiza al menos 150 minutos de actividad física moderada por semana.',
            ];
        } elseif ($bmi >= 25 && $bmi < 30) {
            $recommendations[] = [
                'type' => 'nutrition',
                'content' => 'Tu IMC indica sobrepeso. Se recomienda un déficit calórico moderado de 300-500 kcal/día. Tu GET es de ' . $get . ' kcal/día, por lo que deberías consumir aproximadamente ' . ($get - 400) . ' kcal/día para perder peso de forma saludable.',
            ];
            $recommendations[] = [
                'type' => 'exercise',
                'content' => 'Aumenta tu actividad física. Combina ejercicios cardiovasculares (caminar, correr, nadar) con entrenamiento de fuerza 3-4 veces por semana.',
            ];
        } else {
            $recommendations[] = [
                'type' => 'nutrition',
                'content' => 'Tu IMC indica obesidad. Se recomienda un déficit calórico controlado de 500-750 kcal/día bajo supervisión médica. Tu GET es de ' . $get . ' kcal/día.',
            ];
            $recommendations[] = [
                'type' => 'exercise',
                'content' => 'Comienza con ejercicios de bajo impacto (caminar, natación, ciclismo) y aumenta gradualmente la intensidad. Consulta con un profesional antes de comenzar.',
            ];
        }

        // Activity level recommendations
        if ($assessment->activity_level === 'sedentary') {
            $recommendations[] = [
                'type' => 'exercise',
                'content' => 'Tu nivel de actividad es bajo. Comienza con 10-15 minutos de caminata diaria y aumenta gradualmente.',
            ];
        }

        // Save recommendations
        foreach ($recommendations as $rec) {
            Recommendation::create([
                'assessment_id' => $assessment->id,
                'type' => $rec['type'],
                'content' => $rec['content'],
            ]);
        }

        return $recommendations;
    }

    /**
     * Store a new assessment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'weight' => 'required|numeric|min:30|max:300',
            'height' => 'required|numeric|min:100|max:250',
            'age' => 'required|integer|min:10|max:120',
            'gender' => 'required|in:male,female',
            'activity_level' => 'required|in:sedentary,light,moderate,active,very_active',
            'daily_intake' => 'nullable|numeric|min:0|max:10000',
        ]);

        // Calculate metrics
        $bmi = $this->calculateBMI($validated['weight'], $validated['height']);
        $geb = $this->calculateGEB($validated['weight'], $validated['height'], $validated['age'], $validated['gender']);
        $get = $this->calculateGET($geb, $validated['activity_level']);
        $caloricBalance = $this->calculateCaloricBalance($get, $validated['daily_intake'] ?? null);

        // Create assessment
        $assessment = Assessment::create([
            'user_id' => $request->user()->id,
            'weight' => $validated['weight'],
            'height' => $validated['height'],
            'age' => $validated['age'],
            'gender' => $validated['gender'],
            'activity_level' => $validated['activity_level'],
            'bmi' => $bmi,
            'geb' => $geb,
            'get' => $get,
            'caloric_balance' => $caloricBalance,
        ]);

        // Generate recommendations
        $recommendations = $this->generateRecommendations($assessment);

        // Load relationships
        $assessment->load('recommendations');

        return response()->json([
            'assessment' => $assessment,
            'recommendations' => $recommendations,
        ], 201);
    }

    /**
     * Get all assessments for the authenticated user
     */
    public function index(Request $request)
    {
        $assessments = Assessment::where('user_id', $request->user()->id)
            ->with('recommendations')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($assessments);
    }

    /**
     * Get a specific assessment
     */
    public function show(Request $request, $id)
    {
        $assessment = Assessment::where('user_id', $request->user()->id)
            ->with('recommendations')
            ->findOrFail($id);

        return response()->json($assessment);
    }
}
