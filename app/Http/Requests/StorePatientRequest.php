<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $cleanString = fn ($val) => $val !== null && trim((string) $val) !== ''
            ? strip_tags(trim((string) $val))
            : null;

        $this->merge([
            'name'              => strip_tags(trim((string) $this->name)),
            'no_rm'             => $cleanString($this->no_rm),
            'occupation'        => strip_tags(trim((string) $this->occupation)),
            'religion'          => $cleanString($this->religion),
            'address'           => $cleanString($this->address),
            'medical_diagnosis' => $cleanString($this->medical_diagnosis),
            'clinical_notes'    => $cleanString($this->clinical_notes),
            'general_treatment' => $cleanString($this->general_treatment),
            'doctor_referral'   => $cleanString($this->doctor_referral),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'min:3', 'max:100', 'regex:/^[a-zA-Z\s.,\'-]+$/'],
            'no_rm'               => ['nullable', 'string', 'max:50', 'unique:patients,no_rm'],
            'age'                 => ['required', 'integer', 'min:0', 'max:120'],
            'gender'              => ['required', 'in:Laki-Laki,Perempuan'],
            'religion'            => ['nullable', 'string', 'max:100'],
            'occupation'          => ['required', 'string', 'max:255'],
            'address'             => ['nullable', 'string', 'max:500'],
            'medical_diagnosis'   => ['nullable', 'string', 'max:255'],
            'clinical_notes'      => ['nullable', 'string', 'max:1000'],
            'general_treatment'   => ['nullable', 'string', 'max:500'],
            'doctor_referral'     => ['nullable', 'string', 'max:255'],
            'clinical_attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.regex'   => 'Nama lengkap hanya boleh berisi huruf dan tanda baca nama.',
            'name.min'     => 'Nama lengkap minimal harus 3 karakter.',
            'no_rm.unique' => 'Nomor Rekam Medis (No RM) ini sudah terdaftar pada pasien lain.',
            'age.min'      => 'Umur tidak boleh bernilai negatif.',
            'age.max'      => 'Umur tidak boleh melebihi 120 tahun.',
        ];
    }
}