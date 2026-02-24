<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\NutritionistNote;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function index(Request $request)
    {
        // Total users
        $totalUsers = User::count();
        $activeUsers = User::whereHas('assessments', function ($query) {
            $query->where('created_at', '>=', now()->subDays(30));
        })->count();
        $newUsersToday = User::whereDate('created_at', today())->count();
        $newUsersThisWeek = User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Total assessments
        $totalAssessments = Assessment::count();
        $assessmentsToday = Assessment::whereDate('created_at', today())->count();
        $assessmentsThisWeek = Assessment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $assessmentsThisMonth = Assessment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // BMI distribution
        $bmiDistribution = Assessment::select(
            DB::raw('CASE 
                WHEN bmi < 18.5 THEN "Bajo peso"
                WHEN bmi >= 18.5 AND bmi < 25 THEN "Normal"
                WHEN bmi >= 25 AND bmi < 30 THEN "Sobrepeso"
                ELSE "Obesidad"
            END as category'),
            DB::raw('COUNT(*) as count')
        )
        ->whereNotNull('bmi')
        ->groupBy('category')
        ->get();

        // Average metrics
        $avgBMI = Assessment::whereNotNull('bmi')->avg('bmi');
        $avgGEB = Assessment::whereNotNull('geb')->avg('geb');
        $avgGET = Assessment::whereNotNull('get')->avg('get');

        // Recent activity (last 7 days)
        $recentAssessments = Assessment::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // User growth (last 30 days)
        $userGrowth = User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        // Assessment growth (last 30 days)
        $assessmentGrowth = Assessment::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(30))
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

        $payload = [
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_today' => $newUsersToday,
                'new_this_week' => $newUsersThisWeek,
                'new_this_month' => $newUsersThisMonth,
            ],
            'assessments' => [
                'total' => $totalAssessments,
                'today' => $assessmentsToday,
                'this_week' => $assessmentsThisWeek,
                'this_month' => $assessmentsThisMonth,
            ],
            'bmi_distribution' => $bmiDistribution,
            'averages' => [
                'bmi' => round($avgBMI, 2),
                'geb' => round($avgGEB, 2),
                'get' => round($avgGET, 2),
            ],
            'recent_assessments' => $recentAssessments,
            'growth' => [
                'users' => $userGrowth,
                'assessments' => $assessmentGrowth,
            ],
        ];

        // Super admin: estadísticas por nutricionista (clientes, anotaciones, recomendaciones, engagement)
        if ($request->user()->hasRole('super_admin')) {
            $nutritionists = User::role('nutritionist')->get(['id', 'name', 'email']);
            $nutritionistStats = $nutritionists->map(function ($nut) {
                $clientIds = User::where('assigned_nutritionist_id', $nut->id)->pluck('id');
                $assessmentsOfClients = Assessment::whereIn('user_id', $clientIds)->pluck('id');
                $notesCount = NutritionistNote::where('nutritionist_id', $nut->id)->count();
                $recommendationsCount = \App\Models\Recommendation::whereIn('assessment_id', $assessmentsOfClients)->count();
                return [
                    'id' => $nut->id,
                    'name' => $nut->name,
                    'email' => $nut->email,
                    'clients_count' => $clientIds->count(),
                    'notes_count' => $notesCount,
                    'recommendations_count' => $recommendationsCount,
                    'engagement_score' => $notesCount + $recommendationsCount, // para ordenar por "quién más se relaciona"
                ];
            });
            $nutritionistStats = $nutritionistStats->sortByDesc('engagement_score')->values()->all();
            $payload['nutritionist_stats'] = $nutritionistStats;
        }

        return response()->json($payload);
    }

    /**
     * Get dashboard statistics for nutritionists
     * (Limited view with analytics.view permission)
     */
    public function nutritionist(Request $request)
    {
        $nutritionistId = $request->user()->id;
        $clientIds = User::where('assigned_nutritionist_id', $nutritionistId)->pluck('id');

        $totalUsers = $clientIds->count();
        $totalAssessments = Assessment::whereIn('user_id', $clientIds)->count();
        $assessmentsThisMonth = Assessment::whereIn('user_id', $clientIds)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $recentAssessments = Assessment::with('user:id,name,email')
            ->whereIn('user_id', $clientIds)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'users' => [
                'total' => $totalUsers,
            ],
            'assessments' => [
                'total' => $totalAssessments,
                'this_month' => $assessmentsThisMonth,
            ],
            'recent_assessments' => $recentAssessments,
        ]);
    }
}
