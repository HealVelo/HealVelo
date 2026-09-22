<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhysioAssessment extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'anamnesis_sistem'      => 'array',
        'vital_sign'            => 'array',
        'gerak_aktif'           => 'array',
        'gerak_pasif'           => 'array',
        'gerak_isometrik'       => 'array',
        'pain_nrs'              => 'array',
        'mmt_rows'              => 'array',
        'lgs_data'              => 'array',
        'special_tests'         => 'array',
        'sensibilitas_records'  => 'array',
        'gmfm_total'            => 'float',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function icfReport()
    {
        return $this->hasOne(IcfReport::class, 'assessment_id');
    }
}