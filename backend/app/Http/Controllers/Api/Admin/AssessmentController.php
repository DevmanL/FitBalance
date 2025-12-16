<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    /**
     * Display a listing of all assessments
     */
    public function index(Request $request)
    {
        $query = Assessment::with('user:id,name,email');

        // Search by user name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by BMI range
        if ($request->has('bmi_min')) {
            $query->where('bmi', '>=', $request->bmi_min);
        }
        if ($request->has('bmi_max')) {
            $query->where('bmi', '<=', $request->bmi_max);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $assessments = $query->paginate($perPage);

        return response()->json($assessments);
    }

    /**
     * Display the specified assessment
     */
    public function show(string $id)
    {
        $assessment = Assessment::with(['user', 'recommendations'])->findOrFail($id);

        return response()->json($assessment);
    }

    /**
     * Update the specified assessment
     */
    public function update(Request $request, string $id)
    {
        $assessment = Assessment::findOrFail($id);

        $validated = $request->validate([
            'weight' => 'sometimes|numeric|min:0|max:500',
            'height' => 'sometimes|numeric|min:0|max:300',
            'age' => 'sometimes|integer|min:1|max:150',
            'gender' => 'sometimes|in:male,female',
            'activity_level' => 'sometimes|in:sedentary,light,moderate,active,very_active',
        ]);

        $assessment->update($validated);

        // Recalculate if needed
        if ($request->has('recalculate') && $request->recalculate) {
            // You can add recalculation logic here if needed
        }

        return response()->json([
            'message' => 'Assessment updated successfully',
            'assessment' => $assessment->load('user', 'recommendations'),
        ]);
    }

    /**
     * Remove the specified assessment
     */
    public function destroy(string $id)
    {
        $assessment = Assessment::findOrFail($id);
        $assessment->delete();

        return response()->json([
            'message' => 'Assessment deleted successfully',
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics()
    {
        $total = Assessment::count();
        $today = Assessment::whereDate('created_at', today())->count();
        $thisWeek = Assessment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $thisMonth = Assessment::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $avgBMI = Assessment::whereNotNull('bmi')->avg('bmi');
        $avgGEB = Assessment::whereNotNull('geb')->avg('geb');
        $avgGET = Assessment::whereNotNull('get')->avg('get');

        return response()->json([
            'total' => $total,
            'today' => $today,
            'this_week' => $thisWeek,
            'this_month' => $thisMonth,
            'averages' => [
                'bmi' => round($avgBMI, 2),
                'geb' => round($avgGEB, 2),
                'get' => round($avgGET, 2),
            ],
        ]);
    }
}
