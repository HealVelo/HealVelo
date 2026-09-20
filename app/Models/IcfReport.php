<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IcfReport extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'body_structure'           => 'array',
        'body_function'            => 'array',
        'activities_participation' => 'array',
        'environmental_factors'    => 'array',
        'personal_factors'         => 'array',
        'short_term_goals'         => 'array',
        'long_term_goals'          => 'array',
        'interventions_fitt'       => 'array',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function assessment(): BelongsTo
    {
        return $this->belongsTo(PhysioAssessment::class, 'assessment_id');
    }
}