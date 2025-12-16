<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    protected $fillable = [
        'user_id',
        'weight',
        'height',
        'age',
        'gender',
        'activity_level',
        'bmi',
        'geb',
        'get',
        'caloric_balance',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'bmi' => 'decimal:2',
        'geb' => 'decimal:2',
        'get' => 'decimal:2',
        'caloric_balance' => 'decimal:2',
    ];

    /**
     * Get the user that owns the assessment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the recommendations for the assessment.
     */
    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }

    /**
     * Get the nutritionist notes for the assessment.
     */
    public function nutritionistNotes(): HasMany
    {
        return $this->hasMany(NutritionistNote::class);
    }
}
