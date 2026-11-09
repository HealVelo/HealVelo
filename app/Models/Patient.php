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

        if ($user->role === 'admin') {
            return $query;
        }

        // Supervisor dapat melihat pasien yang didata dirinya dan mahasiswa bimbingannya
        if ($user->role === 'supervisor') {
            $studentIds = $user->students()->pluck('id')->push($user->id)->all();

            return $query->whereIn('user_id', $studentIds);
        }

        // Mahasiswa HANYA dapat melihat pasien yang dia data sendiri
        return $query->where('user_id', $user->id);
    }

    public function canBeAccessedBy(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->role === 'admin' || (int) $this->user_id === (int) $user->id) {
            return true;
        }

        if ($user->role === 'supervisor') {
            return $user->students()->where('id', $this->user_id)->exists();
        }

        return false;
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