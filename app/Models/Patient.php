<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

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