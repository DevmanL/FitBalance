<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    /**
     * Get the authenticated user's profile (creates if not exists).
     */
    public function show(Request $request)
    {
        $user = $request->user();

        $profile = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            []
        );

        return response()->json($profile);
    }

    /**
     * Update the authenticated user's profile (including goals).
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'target_weight' => 'nullable|numeric|min:30|max:300',
            'target_bmi' => 'nullable|numeric|min:10|max:60',
            'activity_goal_minutes' => 'nullable|integer|min:0|max:10000',
            'phone' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'photo' => 'nullable|string|max:2048',
            'preferences' => 'nullable|array',
            'allergies' => 'nullable|array',
            'goal' => 'nullable|in:lose_weight,gain_weight,maintain,gain_muscle',
            'goal_description' => 'nullable|string|max:255',
            'experience_level' => 'nullable|in:beginner,intermediate,advanced',
            'notes' => 'nullable|string|max:5000',
        ]);

        $profile = UserProfile::firstOrCreate(
            ['user_id' => $user->id],
            []
        );

        $profile->fill($data);
        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile,
        ]);
    }
}

