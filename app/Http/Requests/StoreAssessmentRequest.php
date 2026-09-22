<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Bersihkan input teks bebas dari karakter dan tag berbahaya
        $this->merge([
            'keluhan_utama'             => strip_tags(trim($this->keluhan_utama)),
            'riwayat_penyakit_sekarang' => strip_tags(trim($this->riwayat_penyakit_sekarang ?? '')),
            'riwayat_penyakit_dahulu'   => strip_tags(trim($this->riwayat_penyakit_dahulu ?? '')),
            'riwayat_penyakit_penyerta' => strip_tags(trim($this->riwayat_penyakit_penyerta ?? '')),
            'riwayat_pribadi_keluarga'  => strip_tags(trim($this->riwayat_pribadi_keluarga ?? '')),
            'riwayat_prenatal'          => strip_tags(trim($this->riwayat_prenatal ?? '')),
            'riwayat_natal'             => strip_tags(trim($this->riwayat_natal ?? '')),
            'riwayat_postnatal'         => strip_tags(trim($this->riwayat_postnatal ?? '')),
            'inspeksi_statis'           => strip_tags(trim($this->inspeksi_statis ?? '')),
            'inspeksi_dinamis'          => strip_tags(trim($this->inspeksi_dinamis ?? '')),
            'palpasi'                   => strip_tags(trim($this->palpasi ?? '')),
            'perkusi'                   => strip_tags(trim($this->perkusi ?? '')),
            'gmfcs_level'               => strip_tags(trim($this->gmfcs_level ?? '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'patient_id'                => ['required', 'exists:patients,id'],
            'selected_regio'            => ['required', 'string'],
            
            // Subjektif Umum & Pediatrik
            'keluhan_utama'             => ['required', 'string', 'max:1000'],
            'riwayat_penyakit_sekarang' => ['nullable', 'string', 'max:2000'],
            'riwayat_penyakit_dahulu'   => ['nullable', 'string', 'max:1000'],
            'riwayat_penyakit_penyerta' => ['nullable', 'string', 'max:1000'],
            'riwayat_pribadi_keluarga'  => ['nullable', 'string', 'max:1000'],
            'riwayat_prenatal'          => ['nullable', 'string', 'max:1000'],
            'riwayat_natal'             => ['nullable', 'string', 'max:1000'],
            'riwayat_postnatal'         => ['nullable', 'string', 'max:1000'],
            'anamnesis_sistem'          => ['nullable', 'array'],

            // Objektif & Tanda Vital
            'vital_sign'                => ['nullable', 'array'],
            'vital_sign.td'             => ['nullable', 'string', 'max:20'],
            'vital_sign.hr'             => ['nullable', 'numeric'],
            'vital_sign.rr'             => ['nullable', 'numeric'],
            'vital_sign.temp'           => ['nullable', 'numeric'],
            'vital_sign.tb'             => ['nullable', 'numeric'],
            'vital_sign.bb'             => ['nullable', 'numeric'],

            'inspeksi_statis'           => ['nullable', 'string', 'max:1000'],
            'inspeksi_dinamis'          => ['nullable', 'string', 'max:1000'],
            'palpasi'                   => ['nullable', 'string', 'max:1000'],
            'perkusi'                   => ['nullable', 'string', 'max:1000'],

            // Gerakan Dasar & Pengukuran Terstandar
            'gerak_aktif'               => ['nullable', 'array'],
            'gerak_pasif'               => ['nullable', 'array'],
            'gerak_isometrik'           => ['nullable', 'array'],
            'pain_nrs'                  => ['nullable', 'array'],
            'mmt_rows'                  => ['nullable', 'array'],
            'lgs_data'                  => ['nullable', 'array'],
            'sensibilitas_records'      => ['nullable', 'array'],
            'gmfcs_level'               => ['nullable', 'string', 'max:50'],
            'gmfm_total'                => ['nullable', 'numeric', 'min:0', 'max:100'],
            'special_tests'             => ['nullable', 'array'],
        ];
    }
}