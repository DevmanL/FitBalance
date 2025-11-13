<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Recommendation;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    /**
     * Get recommendations for a specific assessment
     */
    public function index(Request $request, $assessmentId)
    {
        $assessment = Assessment::where('user_id', $request->user()->id)
            ->findOrFail($assessmentId);

        $recommendations = Recommendation::where('assessment_id', $assessmentId)
            ->get();

        return response()->json($recommendations);
    }

    /**
     * Get recommendations by type
     */
    public function byType(Request $request, $assessmentId, $type)
    {
        $assessment = Assessment::where('user_id', $request->user()->id)
            ->findOrFail($assessmentId);

        $recommendations = Recommendation::where('assessment_id', $assessmentId)
            ->where('type', $type)
            ->get();

        return response()->json($recommendations);
    }
}
