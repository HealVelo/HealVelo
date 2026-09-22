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
        // Sanitasi dasar: pembersihan whitespace berlebih dan tag berbahaya
        $this->merge([
            'name' => strip_tags(trim($this->name)),
            'no_rm' => strip_tags(trim($this->no_rm)),
            'occupation' => strip_tags(trim($this->occupation)),
            'medical_diagnosis' => strip_tags(trim($this->medical_diagnosis)),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:150'],
            'no_rm'             => ['nullable', 'string', 'max:50', 'unique:patients,no_rm'],
            'age'               => ['required', 'string', 'max:50'],
            'gender'            => ['required', 'in:Laki-Laki,Perempuan'],
            'religion'          => ['nullable', 'string', 'max:50'],
            'occupation'        => ['nullable', 'string', 'max:100'],
            'address'           => ['nullable', 'string', 'max:500'],
            'medical_diagnosis' => ['nullable', 'string', 'max:255'],
            'clinical_notes'    => ['nullable', 'string', 'max:1000'],
            'general_treatment' => ['nullable', 'string', 'max:500'],
            'doctor_referral'   => ['nullable', 'string', 'max:255'],
        ];
    }
}