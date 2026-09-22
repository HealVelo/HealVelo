<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\PhysioAssessment;
use App\Models\IcfReport;
use App\Models\ProgressEvaluation;

class AfrizalClinicalSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Data Pasien: Afrizal Putra Pratama
        $patient = Patient::updateOrCreate(
            ['no_rm' => '10872'],
            [
                'name'               => 'Afrizal Putra Pratama',
                'age'                => 22,
                'gender'             => 'Laki-Laki',
                'occupation'         => 'Mahasiswa / Peneliti',
                'religion'           => 'Islam',
                'address'            => 'Jl. Garuda No. 15 Kartasura, Sukoharjo',
                'medical_diagnosis'  => 'Low Back Pain (LBP) Myogenik dengan Spasme Erector Spinae',
                'clinical_notes'     => 'Hasil X-Ray Lumbal AP/Lateral menunjukkan alignment lordosis berkurang, tidak tampak fraktur maupun spondylolisthesis.',
                'general_treatment'  => 'Paracetamol 500mg, Eperisone HCl 50mg (Muscle Relaxant)',
                'doctor_referral'    => 'Rujukan Sp.S/Sp.KFR RSUD Surakarta untuk program fisioterapi muskuloskeletal komprehensif.',
            ]
        );

        // 2. Data Asesmen Awal
        $assessment = PhysioAssessment::updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'selected_regio'              => 'lumbal_spine',
                'keluhan_utama'               => 'Pasien mengeluhkan nyeri tumpul dan rasa kaku pada pinggang bawah terutama setelah duduk lama saat bekerja di depan komputer.',
                'riwayat_penyakit_sekarang'   => 'Nyeri pinggang bawah dirasakan sejak 3 minggu lalu dan memberat 4 hari terakhir akibat posisi duduk membungkuk saat menyusun tugas akhir.',
                'riwayat_penyakit_dahulu'     => 'Tidak ada riwayat trauma pinggang atau cedera olahraga berat sebelumnya.',
                'riwayat_penyakit_penyerta'   => 'Tidak ada riwayat diabetes mellitus maupun hipertensi.',
                'vital_sign'                  => [
                    'td'   => '120/80',
                    'hr'   => '78',
                    'rr'   => '18',
                    'temp' => '36.6',
                    'tb'   => '172',
                    'bb'   => '65',
                ],
                'inspeksi_statis'             => 'Postur kifosis torakal ringan, penurunan kurva lordosis lumbal (flat back posture), bahu simetris.',
                'inspeksi_dinamis'            => 'Tampak menahan nyeri saat transisi duduk ke berdiri, fleksi trunk terbatas akibat nyeri.',
                'palpasi'                     => 'Spasme muskulus erector spinae bilateral setinggi L3-L5, spasme m. quadratus lumborum dextra, nyeri tekan lokal grade 2.',
                'pain_nrs'                    => [
                    'diam'  => ['dex_val' => 1, 'sin_val' => 1],
                    'tekan' => ['dex_val' => 5, 'sin_val' => 4],
                    'gerak' => ['dex_val' => 6, 'sin_val' => 5],
                ],
                'special_tests'               => [
                    ['name' => 'Straight Leg Raise (SLR)', 'result' => 'Negatif'],
                    ['name' => 'Laseque Test', 'result' => 'Negatif'],
                    ['name' => 'Schober Test', 'result' => 'Positif (ROM Fleksi Lumbal Terbatas)'],
                    ['name' => 'Slump Test', 'result' => 'Negatif'],
                ],
            ]
        );

        // 3. Sesi Evaluasi Berkala (Menggunakan session_name)
        ProgressEvaluation::updateOrCreate(
            ['patient_id' => $patient->id, 'session_name' => 'T1'],
            [
                'evaluation_date' => '2026-08-15',
                'pain_nrs'        => ['diam' => 1, 'tekan' => 5, 'gerak' => 6],
                'mmt_records'     => [
                    ['gerakan' => 'Ekstensor Trunk', 'dex' => 4, 'sin' => 4],
                    ['gerakan' => 'Fleksor Trunk (Abdominal)', 'dex' => 4, 'sin' => 4],
                ],
                'gmfm_score'      => 65.0,
                'ashworth_score'  => 'Grade 2 (Sedang)',
                'clinical_notes'  => 'Nyeri gerak saat fleksi lumbal masih dominan. Spasme erector spinae bilateral terasa tegang saat dipalpasi.',
            ]
        );

        ProgressEvaluation::updateOrCreate(
            ['patient_id' => $patient->id, 'session_name' => 'T2'],
            [
                'evaluation_date' => '2026-08-22',
                'pain_nrs'        => ['diam' => 0, 'tekan' => 3, 'gerak' => 4],
                'mmt_records'     => [
                    ['gerakan' => 'Ekstensor Trunk', 'dex' => 4, 'sin' => 4],
                    ['gerakan' => 'Fleksor Trunk (Abdominal)', 'dex' => 5, 'sin' => 4],
                ],
                'gmfm_score'      => 75.5,
                'ashworth_score'  => 'Grade 1 (Ringan)',
                'clinical_notes'  => 'Ketegangan otot berkurang signifikan pasca terapi microwave diathermy dan stretching lumbal terarah.',
            ]
        );

        ProgressEvaluation::updateOrCreate(
            ['patient_id' => $patient->id, 'session_name' => 'T3'],
            [
                'evaluation_date' => '2026-08-29',
                'pain_nrs'        => ['diam' => 0, 'tekan' => 1, 'gerak' => 2],
                'mmt_records'     => [
                    ['gerakan' => 'Ekstensor Trunk', 'dex' => 5, 'sin' => 5],
                    ['gerakan' => 'Fleksor Trunk (Abdominal)', 'dex' => 5, 'sin' => 5],
                ],
                'gmfm_score'      => 88.0,
                'ashworth_score'  => 'Grade 0 (Normal)',
                'clinical_notes'  => 'Nyeri tekan minimal. Pasien mampu duduk bekerja 2 jam tanpa keluhan nyeri pinggang dan core stability meningkat.',
            ]
        );

        // 4. Laporan Status Klinik ICF
        IcfReport::updateOrCreate(
            ['patient_id' => $patient->id, 'assessment_id' => $assessment->id],
            [
                'body_structure' => [
                    ['code' => 's7600.2', 'name' => 'Structure of lumbar spine', 'desc' => 'Ketegangan dan penurunan kurvatura lordosis fisiologis lumbal'],
                    ['code' => 's770.1', 'name' => 'Musculoskeletal structures related to movement', 'desc' => 'Spasme bilateral muskulus erector spinae dan quadratus lumborum'],
                ],
                'body_function' => [
                    ['code' => 'b28013.2', 'name' => 'Pain in back', 'desc' => 'Nyeri punggung bawah derajat sedang terutama saat fleksi lumbal aktif'],
                    ['code' => 'b7100.1', 'name' => 'Mobility of a single joint', 'desc' => 'Keterbatasan lingkup gerak sendi intervertebral lumbal'],
                    ['code' => 'b730.1', 'name' => 'Muscle power functions', 'desc' => 'Penurunan daya tahan otot penstabil postur (core muscle)'],
                ],
                'activities_participation' => [
                    ['code' => 'd4153.2', 'name' => 'Maintaining a sitting position', 'desc' => 'Kesulitan mempertahankan posisi duduk tegak lebih dari 45 menit'],
                    ['code' => 'd4100.1', 'name' => 'Lying down to sitting', 'desc' => 'Rasa kaku saat transisi bangun tidur atau bangkit dari kursi'],
                    ['code' => 'd850.1', 'name' => 'Remunerative employment', 'desc' => 'Hambatan produktivitas riset dan pemrograman akibat rasa nyeri berulang'],
                ],
                'short_term_goals' => [
                    'Menurunkan intensitas nyeri gerak dari NRS 6 menjadi kurang dari NRS 3',
                    'Mengurangi spasme otot erector spinae dan quadratus lumborum',
                    'Meningkatkan lingkup gerak sendi fleksi-ekstensi trunk lumbal',
                ],
                'long_term_goals' => [
                    'Mengembalikan kapasitas fungsional duduk mandiri selama 2-3 jam tanpa keluhan nyeri',
                    'Memperkuat stabilitas core muscle dan mencegah kekambuhan postur duduk statis',
                ],
                'interventions_fitt' => [
                    ['type' => 'Microwave Diathermy (MWD) & TENS', 'frequency' => '3x seminggu', 'intensity' => 'Sesuai toleransi termal pasien', 'time' => '20 menit'],
                    ['type' => 'Passive & Active Lumbar Stretching (Hamstring & Erector Spinae)', 'frequency' => '3x seminggu', 'intensity' => 'Hold 20-30 detik x 3 repetisi', 'time' => '15 menit'],
                    ['type' => 'Core Stability Exercise (Bridging & Bird Dog Exercise)', 'frequency' => '2-3x seminggu', 'intensity' => '8-10 repetisi x 3 set', 'time' => '20 menit'],
                ],
                'education' => 'Edukasi ergonomi kerja: menggunakan kursi ergonomis bersandaran tegak, hindari posisi membungkuk, dan lakukan micro-break peregangan setiap 45 menit duduk.',
            ]
        );
    }
}