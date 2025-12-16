<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutritionistNote extends Model
{
    protected $fillable = [
        'assessment_id',
        'nutritionist_id',
        'note',
    ];

    /**
     * Get the assessment that owns the note.
     */
    public function assessment(): BelongsTo
    {
        return $this->belongsTo(Assessment::class);
    }

    /**
     * Get the nutritionist (user) that created the note.
     */
    public function nutritionist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nutritionist_id');
    }
}
