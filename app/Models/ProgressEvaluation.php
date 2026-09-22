<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgressEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'session_name',
        'evaluation_date', // Wajib ada agar tidak dibuang oleh Eloquent create()
        'pain_nrs',
        'mmt_records',
        'lgs_records',
        'gmfm_score',
        'ashworth_score',
        'clinical_notes',
    ];

    protected $casts = [
        'pain_nrs'        => 'array',
        'mmt_records'     => 'array',
        'lgs_records'     => 'array',
        'evaluation_date' => 'date',
        'gmfm_score'      => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}