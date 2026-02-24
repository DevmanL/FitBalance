<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'birth_date',
        'photo',
        'preferences',
        'allergies',
        'goal',
        'goal_description',
        'target_weight',
        'target_bmi',
        'activity_goal_minutes',
        'experience_level',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'preferences' => 'array',
        'allergies' => 'array',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
