<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\PhysioAssessment;
use App\Models\IcfReport;
use App\Models\ProgressEvaluation;

class FahrezaCaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Data Pasien
        $patient = Patient::create([
            'no_rm'              => '10871',
            'name'               => 'An. Fahreza',
            'age'                => '4 tahun 7 bulan',
            'gender'             => 'Laki-Laki',
            'religion'           => 'Islam',
            'occupation'         => '-',
            'address'            => 'Karangtengah 02/06 Kartasura, Sukoharjo',
            'medical_diagnosis'  => 'Cerebral Palsy Hemiplegi Spastik Sinistra',
            'clinical_notes'     => 'MSCT Kepala (8 Juli 2025): Calcified mass bulbus oculi dextra retinoblastoma, disgenesis corpus callosum',
            'general_treatment'  => 'Fisioterapi rutin 2x seminggu',
            'doctor_referral'    => 'Inisiatif orang tua',
        ]);

        // 2. Data Assessment Physio Kit
        $assessment = PhysioAssessment::create([
            'patient_id'                => $patient->id,
            'selected_regio'            => 'pediatric_full_body',
            'keluhan_utama'             => 'Pola jalan abnormal pada tungkai kiri, tangan dan kaki kiri kaku, belum bisa berlari dan melompat.',
            'riwayat_penyakit_sekarang' => 'Postnatal: Mata tidak bisa terbuka 3 hari (tumor), riwayat kejang saat usia 1 tahun.',
            'riwayat_penyakit_penyerta' => 'Retinoblastoma',
            'riwayat_pribadi_keluarga'  => 'Sepupu mengalami Cerebral Palsy Quadriplegi',
            'anamnesis_sistem'          => [
                'muskuloskeletal' => 'Keterbatasan LGS dan penurunan kekuatan otot pada AGA & AGB sinistra.',
                'nervorum'        => 'Gangguan keseimbangan dan koordinasi gerak sisi kiri.'
            ],
            'vital_sign'                => [
                'lingkar_kepala' => '46 cm',
                'tb'             => '100 cm',
                'bb'             => '15 kg',
            ],
            'inspeksi_statis'           => 'Bahu kiri lebih tinggi, trunk condong ke kanan, tangan kiri sedikit menekuk, ankle plantar fleksi.',
            'inspeksi_dinamis'          => 'Keseimbangan dan koordinasi berjalan kurang maksimal.',
            'palpasi'                   => 'Hipertonus AGA & AGB sinistra, spasme m. gastrocnemius dan fleksor carpi sinistra.',
            'perkusi'                   => 'Hiperrefleksia (Skor 3) pada Biceps, Triceps, Patella, Achilles sinistra.',
            'pain_nrs'                  => ['diam' => 0, 'tekan' => 0, 'gerak' => 0],
            'mmt_data'                  => [
                'cervical' => ['fleksi' => 5, 'ekstensi' => 5],
                'shoulder_sinistra' => ['fleksor' => 4, 'ekstensor' => 4, 'abduktor' => 5],
                'elbow_sinistra'    => ['fleksor' => 4, 'ekstensor' => 4],
                'hip_sinistra'      => ['fleksor' => 4, 'ekstensor' => 4],
                'ankle_sinistra'    => ['dorsifleksor' => 4, 'plantarfleksor' => 4],
            ],
            'special_tests'             => [
                'asworth_sinistra' => 'Skor 2 pada fleksor bahu, siku, panggul, lutut, dan pergelangan kaki',
                'gmfc_level'       => 'Level II',
                'gmfm_initial'     => '61.6%',
            ]
        ]);

        // 3. Diagnosis ICF Terverifikasi
        IcfReport::create([
            'patient_id'               => $patient->id,
            'assessment_id'            => $assessment->id,
            'body_structure'           => [
                ['code' => 's110.1', 'name' => 'Structure of brain', 'desc' => 'Gangguan struktur otak'],
                ['code' => 's730.1', 'name' => 'Upper extremity', 'desc' => 'Gangguan otot lengan kiri & wrist'],
                ['code' => 's750.1', 'name' => 'Lower extremity', 'desc' => 'Pola gait kaki kiri tidak normal']
            ],
            'body_function'            => [
                ['code' => 'b760.1', 'name' => 'Control of voluntary movement', 'desc' => 'Gangguan kontrol gerak volunter kiri'],
                ['code' => 'b710.1', 'name' => 'Mobility of joint', 'desc' => 'Gerak aktif terbatas karena hipertonus'],
                ['code' => 'b770.2', 'name' => 'Gait pattern functions', 'desc' => 'Gangguan pola jalan']
            ],
            'activities_participation' => [
                ['code' => 'd410.2', 'name' => 'Changing body position', 'desc' => 'Transisi duduk ke berdiri terganggu'],
                ['code' => 'd450.2', 'name' => 'Walking', 'desc' => 'Pola jalan tidak normal karena spastisitas'],
                ['code' => 'd440.2', 'name' => 'Fine hand use', 'desc' => 'Penggunaan tangan kiri terbatas']
            ],
            'environmental_factors'    => [
                ['code' => 'e110', 'name' => 'Products for consumption'],
                ['code' => 'e355', 'name' => 'Health professionals'],
                ['code' => 'e5800', 'name' => 'Health services']
            ],
            'short_term_goals'         => [
                'Meningkatkan tonus postural',
                'Menurunkan spastisitas pada AGA dan AGB sinistra',
                'Melatih keseimbangan dinamis saat berjalan'
            ],
            'long_term_goals'          => [
                'Meningkatkan kemandirian ADL (makan, berpakaian, toileting)',
                'Mempersiapkan kestabilan pola jalan fungsional'
            ],
            'interventions_fitt'       => [
                ['type' => 'NDT (Neuro Developmental Treatment)', 'frequency' => '2-3x/minggu', 'time' => '40 menit'],
                ['type' => 'Static Passive Stretching', 'frequency' => '3x/minggu', 'time' => '8 menit/sesi'],
                ['type' => 'Balance & Gait Training', 'frequency' => '2-3x/minggu', 'time' => '25 menit']
            ],
            'education'                => 'Latihan carry-over di rumah: stimulasi tangan kiri untuk memegang benda, peregangan kaki rutin.'
        ]);

        // 4. Progress Evaluation Tracking
        ProgressEvaluation::create([
            'patient_id'      => $patient->id,
            'session_name'    => 'T1',
            'evaluation_date' => '2025-08-05',
            'clinical_notes'  => 'GMFM 61.6%, Asworth skala 2 pada sisi kiri.',
        ]);

        ProgressEvaluation::create([
            'patient_id'      => $patient->id,
            'session_name'    => 'T3',
            'evaluation_date' => '2025-08-20',
            'clinical_notes'  => 'GMFM meningkat ke 70.4%, Asworth turun menjadi skala 1/1+.',
        ]);
    }
}