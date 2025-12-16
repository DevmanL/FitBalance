<?php

namespace App\Http\Controllers\Api\Nutritionist;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\NutritionistNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NoteController extends Controller
{
    /**
     * Get all notes for a specific assessment
     * Can be accessed by nutritionists (full access) or users (read-only for their own assessments)
     */
    public function index(Request $request, $assessmentId)
    {
        $assessment = Assessment::findOrFail($assessmentId);
        $user = $request->user();
        
        // If user is not a nutritionist, verify the assessment belongs to them
        if (!$user->hasRole('nutritionist')) {
            if ($assessment->user_id !== $user->id) {
                return response()->json([
                    'message' => 'You can only view notes for your own assessments.',
                ], 403);
            }
        }
        
        $notes = NutritionistNote::where('assessment_id', $assessmentId)
            ->with('nutritionist:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    /**
     * Get all notes for a specific user (all assessments)
     */
    public function byUser(Request $request, $userId)
    {
        $notes = NutritionistNote::whereHas('assessment', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['assessment:id,user_id,created_at', 'nutritionist:id,name,email'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($notes);
    }

    /**
     * Store a newly created note
     */
    public function store(Request $request, $assessmentId)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|string|min:10|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $assessment = Assessment::findOrFail($assessmentId);
        $nutritionist = $request->user();

        // Verify user has nutritionist role
        if (!$nutritionist->hasRole('nutritionist')) {
            return response()->json([
                'message' => 'Only nutritionists can create notes.',
            ], 403);
        }

        $note = NutritionistNote::create([
            'assessment_id' => $assessmentId,
            'nutritionist_id' => $nutritionist->id,
            'note' => $request->note,
        ]);

        $note->load('nutritionist:id,name,email');

        return response()->json([
            'message' => 'Note created successfully',
            'note' => $note,
        ], 201);
    }

    /**
     * Update a note
     */
    public function update(Request $request, $noteId)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|string|min:10|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $note = NutritionistNote::findOrFail($noteId);
        $nutritionist = $request->user();

        // Verify the note belongs to this nutritionist
        if ($note->nutritionist_id !== $nutritionist->id) {
            return response()->json([
                'message' => 'You can only edit your own notes.',
            ], 403);
        }

        $note->update([
            'note' => $request->note,
        ]);

        $note->load('nutritionist:id,name,email');

        return response()->json([
            'message' => 'Note updated successfully',
            'note' => $note,
        ]);
    }

    /**
     * Delete a note
     */
    public function destroy(Request $request, $noteId)
    {
        $note = NutritionistNote::findOrFail($noteId);
        $nutritionist = $request->user();

        // Verify the note belongs to this nutritionist
        if ($note->nutritionist_id !== $nutritionist->id) {
            return response()->json([
                'message' => 'You can only delete your own notes.',
            ], 403);
        }

        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully',
        ]);
    }
}
