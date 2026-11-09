<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'age' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeAccessibleBy(Builder $query, ?User $user): Builder
    {
        if (! $user) {
            return $query->whereRaw('1 = 0');
        }

        // Baik mahasiswa maupun supervisor memiliki hak akses yang sama di dalam sistem klinis
        return $query;
    }

    public function canBeAccessedBy(?User $user): bool
    {
        return $user !== null;
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(PhysioAssessment::class);
    }

    public function latestAssessment(): HasOne
    {
        return $this->hasOne(PhysioAssessment::class)->latestOfMany();
    }

    public function icfReports(): HasMany
    {
        return $this->hasMany(IcfReport::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(ProgressEvaluation::class)->orderBy('evaluation_date', 'asc');
    }
}