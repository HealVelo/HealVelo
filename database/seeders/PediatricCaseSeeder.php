<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Patient;
use App\Models\PhysioAssessment;
use App\Models\IcfReport;
use App\Models\ProgressEvaluation;

class PediatricCaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Clinical Educator / Supervisor
        $supervisor = User::updateOrCreate(
            ['email' => 'supervisor@ums.ac.id'],
            [
                'name'              => 'Umi Budi Rahayu, S.Fis., Ftr., M.Kes',
                'password'          => Hash::make('password123'),
                'identifier_number' => '197108252005012001',
                'role'              => 'supervisor',
            ]
        );

        // 2. Akun Mahasiswa Praktikan Fisioterapi
        $student = User::updateOrCreate(
            ['email' => 'mahasiswa@student.ums.ac.id'],
            [
                'name'              => 'Samiyem',
                'password'          => Hash::make('password123'),
                'identifier_number' => 'J120229241',
                'role'              => 'mahasiswa',
                'supervisor_id'     => $supervisor->id,
            ]
        );

        // 3. Data Pasien Anak (An. Fahreza - Usia 4 Tahun Murni Angka)
        $patient = Patient::updateOrCreate(
            ['no_rm' => '10871'],
            [
                'name'              => 'An. Fahreza',
                'age'               => 4,
                'gender'            => 'Laki-Laki',
                'occupation'        => 'Belum Bekerja',
                'religion'          => 'Islam',
                'address'           => 'Karangtengah 02/06 Kartasura, Sukoharjo',
                'medical_diagnosis' => 'Cerebral Palsy Hemiplegi Spastik Sinistra',
                'clinical_notes'    => 'Rujukan rehabilitasi medik: Spastisitas anggota gerak kiri, keterlambatan motorik kasar.',
                'general_treatment' => 'Program terapi rutin rawat jalan fisioterapi pediatrik.',
                'doctor_referral'   => 'dr. Sp.A (K) Rehabilitasi Medik',
            ]
        );

        // 4. Data Asesmen Lengkap (Kasus Pediatrik)
        $assessment = PhysioAssessment::updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'selected_regio'            => 'pediatric_full_body',
                'keluhan_utama'             => 'Pola jalan abnormal pada tungkai kiri, tangan dan kaki kiri kaku, belum bisa berlari dan melompat.',
                'riwayat_penyakit_sekarang' => 'Ibu pasien mengeluhkan tungkai kiri anak menyeret saat melangkah, siku dan pergelangan tangan kiri cenderung menekuk ke dalam (fleksi), serta sulit mempertahankan keseimbangan saat berdiri tegak.',
                'riwayat_penyakit_dahulu'   => 'Usia kehamilan ibu 24 tahun saat mengandung anak, tidak ada komplikasi mayor selama prenatal.',
                'riwayat_penyakit_penyerta' => 'Persalinan berlangsung secara sectio caesarea karena tidak ada kontraksi alami, anak lahir melewati HPL dan langsung menangis.',
                'riwayat_pribadi_keluarga'  => 'Mata kiri tidak dapat membuka selama 3 hari awal kelahiran (retinoblastoma), riwayat kejang demam saat usia 1 tahun, serta sepupu memiliki riwayat CP quadriplegi.',
                
                // Khusus Pediatrik Form
                'riwayat_prenatal'          => 'Ibu hamil usia 24 tahun, gerakan janin kurang terasa aktif pada trimester ketiga.',
                'riwayat_natal'             => 'Lahir secara SC di RSUD karena riwayat postmatur (lewat HPL), asfiksia ringan.',
                'riwayat_postnatal'         => 'Riwayat kejang saat usia 1 tahun, perkembangan motorik duduk mandiri terlambat (usia 14 bulan).',
                
                'anamnesis_sistem' => [
                    'kepala_leher'        => 'Bentuk simetris, tonus leher cukup',
                    'kardiovaskuler'      => 'Tidak dikeluhkan, dalam batas normal',
                    'respirasi'           => 'Dalam batas normal, tidak ada sesak',
                    'gastrointestinalis'  => 'Pola makan baik, refleks menelan normal',
                    'urogenital'          => 'Toileting belum mandiri penuh',
                    'muskuloskeletal'     => 'Spastisitas otot fleksor lengan dan plantar fleksor tungkai kiri',
                    'nervorum'            => 'Gangguan kontrol gerak volunter ekstremitas kiri',
                ],

                // 1.1 Tanda Vital
                'vital_sign' => [
                    'td'   => '100/65',
                    'hr'   => '92',
                    'rr'   => '22',
                    'temp' => '36.6',
                    'tb'   => '100',
                    'bb'   => '15',
                ],

                // 1.2 - 1.4 Pemeriksaan Fisik
                'inspeksi_statis'  => 'Bahu kiri lebih tinggi, trunk condong ke kanan, lengan kiri fleksi dan pronasi, ankle kiri posisi plantar fleksi (equinus).',
                'inspeksi_dinamis' => 'Pola jalan circumduction pada tungkai kiri, langkah asimetris, koordinasi dan keseimbangan berjalan belum stabil.',
                'palpasi'          => 'Hipertonus pada grup fleksor lengan kiri dan gastrocnemius sinistra, spasme otot erector spinae lateral kanan.',
                'perkusi'          => 'Hiperrefleksia (Skor 3) pada tendon Biceps, Triceps, Patella, dan Achilles sinistra; sisi dextra normal (Skor 2).',

                // 1.6 Gerakan Dasar
                'gerak_aktif' => [
                    ['gerakan' => 'Fleksi Shoulder',  'rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-'],
                    ['gerakan' => 'Ekstensi Shoulder','rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-'],
                    ['gerakan' => 'Abduksi Shoulder', 'rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-'],
                    ['gerakan' => 'Fleksi Elbow',     'rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Full',     'nyeri_sin' => '-'],
                    ['gerakan' => 'Fleksi Hip',       'rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-'],
                    ['gerakan' => 'Dorsifleksi Ankle','rom_dex' => 'Full', 'nyeri_dex' => '-', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-'],
                ],
                'gerak_pasif' => [
                    ['gerakan' => 'Fleksi Shoulder',  'rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-', 'endfeel_sin' => 'Spastic catch'],
                    ['gerakan' => 'Ekstensi Shoulder','rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-', 'endfeel_sin' => 'Spastic catch'],
                    ['gerakan' => 'Abduksi Shoulder', 'rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-', 'endfeel_sin' => 'Spastic catch'],
                    ['gerakan' => 'Fleksi Elbow',     'rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Full',     'nyeri_sin' => '-', 'endfeel_sin' => 'Elastic'],
                    ['gerakan' => 'Fleksi Hip',       'rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-', 'endfeel_sin' => 'Firm'],
                    ['gerakan' => 'Dorsifleksi Ankle','rom_dex' => 'Full', 'nyeri_dex' => '-', 'endfeel_dex' => 'Normal', 'rom_sin' => 'Terbatas', 'nyeri_sin' => '-', 'endfeel_sin' => 'Springy block'],
                ],
                'gerak_isometrik' => [
                    ['gerakan' => 'Fleksi Shoulder',  'nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Lemah'],
                    ['gerakan' => 'Ekstensi Shoulder','nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Lemah'],
                    ['gerakan' => 'Abduksi Shoulder', 'nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Lemah'],
                    ['gerakan' => 'Fleksi Elbow',     'nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Mampu'],
                    ['gerakan' => 'Fleksi Hip',       'nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Lemah'],
                    ['gerakan' => 'Dorsifleksi Ankle','nyeri_dex' => '-', 'tahanan_dex' => 'Mampu', 'nyeri_sin' => '-', 'tahanan_sin' => 'Lemah'],
                ],

                // Nyeri NRS
                'pain_nrs' => [
                    'diam'  => ['dex_val' => '0', 'dex_ket' => 'Tidak nyeri', 'sin_val' => '0', 'sin_ket' => 'Tidak nyeri'],
                    'tekan' => ['dex_val' => '0', 'dex_ket' => 'Tidak nyeri', 'sin_val' => '1', 'sin_ket' => 'Rasa tidak nyaman pada betis'],
                    'gerak' => ['dex_val' => '0', 'dex_ket' => 'Bebas gerak', 'sin_val' => '2', 'sin_ket' => 'Tegang saat peregangan pasif'],
                ],

                // MMT Motorik Awal
                'mmt_rows' => [
                    ['gerakan' => 'Fleksor Shoulder',    'dex_skor' => '5', 'sin_skor' => '4'],
                    ['gerakan' => 'Ekstensor Shoulder',  'dex_skor' => '5', 'sin_skor' => '4'],
                    ['gerakan' => 'Fleksor Elbow',        'dex_skor' => '5', 'sin_skor' => '4'],
                    ['gerakan' => 'Ekstensor Elbow',      'dex_skor' => '5', 'sin_skor' => '4'],
                    ['gerakan' => 'Fleksor Wrist',        'dex_skor' => '5', 'sin_skor' => '4'],
                    ['gerakan' => 'Dorsifleksor Ankle',   'dex_skor' => '5', 'sin_skor' => '3'],
                ],

                // LGS ROM
                'lgs_data' => [
                    'dextra'  => ['ekstensi_fleksi' => '0-0-140', 'abduksi_adduksi' => '180-0-45', 'eksorotasi_endorotasi' => '90-0-80'],
                    'sinistra'=> ['ekstensi_fleksi' => '0-15-110', 'abduksi_adduksi' => '135-0-30', 'eksorotasi_endorotasi' => '70-0-60'],
                    'normal'  => ['ekstensi_fleksi' => 'S: 0-0-140', 'abduksi_adduksi' => 'F: 180-0-45', 'eksorotasi_endorotasi' => 'R: 90-0-80'],
                ],

                // Sensibilitas & Pengukuran Pediatrik
                'sensibilitas_records' => [
                    'Visual'         => 'Normal',
                    'Auditory'       => 'Normal',
                    'Vestibular'     => '1 (Gangguan Keseimbangan Ringan)',
                    'Tactile'        => 'Normal',
                    'Proprioceptive' => '1 (Penurunan Persepsi Posisi Sendi Sinistra)',
                ],
                'gmfcs_level' => 'Level II',
                'gmfm_total'  => '61.6',

                'special_tests' => [
                    ['name' => 'Modified Ashworth Scale', 'result' => 'Positif'],
                    ['name' => 'Clonus Test',              'result' => 'Positif'],
                    ['name' => 'Babinski Reflex',          'result' => 'Positif'],
                ],
            ]
        );

        // 5. Laporan Status Klinik ICF Resmi
        $report = IcfReport::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'patient_id'    => $patient->id,
                'body_structure' => [
                    ['code' => 's110.1', 'name' => 'Structure of brain', 'desc' => 'Gangguan pada struktur hemisfer otak dekstra'],
                    ['code' => 's730.1', 'name' => 'Structure of upper extremity', 'desc' => 'Gangguan fungsional otot lengan dan pergelangan tangan kiri'],
                    ['code' => 's750.2', 'name' => 'Structure of lower extremity', 'desc' => 'Kaki kiri menunjukkan pola gait spastik ekwinus'],
                ],
                'body_function' => [
                    ['code' => 'b760.1', 'name' => 'Control of voluntary movement function', 'desc' => 'Gangguan kontrol gerak volunter sisi kiri'],
                    ['code' => 'b710.1', 'name' => 'Mobility of joint function', 'desc' => 'Rentang gerak aktif terbatas akibat hipertonus spastik'],
                    ['code' => 'b770.2', 'name' => 'Gait pattern functions', 'desc' => 'Asimetri langkah dan gangguan pola berjalan fungsional'],
                ],
                'activities_participation' => [
                    ['code' => 'd410.2', 'name' => 'Changing basic body position', 'desc' => 'Hambatan transisi mandiri dari duduk ke berdiri tegak'],
                    ['code' => 'd450.2', 'name' => 'Walking', 'desc' => 'Pola jalan belum mandiri penuh dan rentan kehilangan keseimbangan'],
                    ['code' => 'd440.2', 'name' => 'Fine hand use', 'desc' => 'Keterbatasan penggunaan tangan kiri untuk menggenggam dan melepas benda'],
                    ['code' => 'd820.2', 'name' => 'School education', 'desc' => 'Hambatan mengikuti aktivitas bermain dan pembelajaran fisik di sekolah PAUD'],
                ],
                'environmental_factors' => [
                    'e110: Dukungan produk alat bantu dan fasilitas latihan mandiri di rumah',
                    'e355: Pendampingan rutin oleh tenaga profesional fisioterapi anak',
                    'e5800: Akses ke layanan kesehatan dan pusat terapi tumbuh kembang terpadu',
                ],
                'personal_factors' => [
                    'Usia 4 tahun, anak sangat aktif, kooperatif, dan memiliki motivasi bermain yang tinggi',
                    'Dukungan dan komitmen orang tua sangat baik dalam mendampingi terapi',
                ],
                'short_term_goals' => [
                    'Meningkatkan tonus postural dan stabilitas trunk dalam posisi duduk tegak',
                    'Menurunkan spastisitas otot fleksor lengan dan triceps surae sinistra minimal 1 grade Ashworth',
                    'Meningkatkan LGS dorsifleksi ankle kiri minimal 10 derajat bebas hambatan',
                    'Melatih koordinasi keseimbangan statis dan dinamis saat berjalan di permukaan datar',
                ],
                'long_term_goals' => [
                    'Meningkatkan kemandirian aktivitas fungsional harian (ADL) seperti makan dan berpakaian',
                    'Mencapai pola jalan fungsional tanpa menyeret (foot clearance optimal)',
                    'Mencegah terjadinya kontraktur jaringan lunak dan deformitas sendi struktural sekunder',
                ],
                'interventions_fitt' => [
                    [
                        'modalitas' => 'Neuro Developmental Treatment (NDT)',
                        'frequency' => '2-3x / minggu',
                        'intensity' => 'Ringan, disesuaikan dengan toleransi dan kelelahan anak',
                        'time'      => '40 menit',
                        'type'      => 'Inhibisi spastisitas, fasilitasi reaksi tegak & keseimbangan',
                    ],
                    [
                        'modalitas' => 'Balance & Gait Training',
                        'frequency' => '2-3x / minggu',
                        'intensity' => 'Ringan-sedang dengan bantuan minimal terapis',
                        'time'      => '25 menit',
                        'type'      => 'Latihan transfer bobot tubuh, obstacle walking, dan step training',
                    ],
                    [
                        'modalitas' => 'Static Passive Stretching',
                        'frequency' => '1x / hari, 3x / minggu',
                        'intensity' => 'Ditahan 20-30 detik tiap grup otot, 3 repetisi',
                        'time'      => '10 menit / sesi',
                        'type'      => 'Peregangan pasif m. gastrocnemius, hamstring, dan fleksor carpi',
                    ],
                    [
                        'modalitas' => 'Latihan Motorik Halus (Fine Motor Training)',
                        'frequency' => '3x / minggu',
                        'intensity' => '8-10 repetisi tugas manipulasi tanpa memicu spasme',
                        'time'      => '15 menit',
                        'type'      => 'Latihan meraih (reaching), menggenggam (grasping), dan melepas objek',
                    ],
                ],
                'education' => 'Edukasi positioning saat tidur dan bermain, anjuran pemakaian AFO (Ankle Foot Orthosis) saat beraktivitas siang hari, serta latihan peregangan mandiri bersama orang tua di rumah.',
            ]
        );

        // 6. Data Sesi Evaluasi Berkala (T1, T2, T3)
        $sessions = [
            [
                'session_name'    => 'T1',
                'evaluation_date' => '2026-08-07',
                'gmfm_score'      => 61.6,
                'ashworth_score'  => 'Grade 2',
                'pain_nrs'        => ['diam' => 0, 'tekan' => 1, 'gerak' => 4],
                'mmt_records'     => [
                    ['gerakan' => 'Fleksor Shoulder',  'dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Ekstensor Shoulder','dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Fleksor Elbow',     'dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Dorsifleksor Ankle','dex' => '5', 'sin' => '3'],
                ],
                'clinical_notes'  => 'Sesi evaluasi awal T1: Spastisitas menonjol pada pergelangan kaki dan siku kiri, pola jalan hemiplegik equinus.',
            ],
            [
                'session_name'    => 'T2',
                'evaluation_date' => '2026-08-14',
                'gmfm_score'      => 61.6,
                'ashworth_score'  => 'Grade 2',
                'pain_nrs'        => ['diam' => 0, 'tekan' => 1, 'gerak' => 3],
                'mmt_records'     => [
                    ['gerakan' => 'Fleksor Shoulder',  'dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Ekstensor Shoulder','dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Fleksor Elbow',     'dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Dorsifleksor Ankle','dex' => '5', 'sin' => '3'],
                ],
                'clinical_notes'  => 'Sesi evaluasi T2: Toleransi latihan meningkat, respon kontrol postural mulai adaptif saat latihan duduk tegak.',
            ],
            [
                'session_name'    => 'T3',
                'evaluation_date' => '2026-08-21',
                'gmfm_score'      => 70.4,
                'ashworth_score'  => 'Grade 1+',
                'pain_nrs'        => ['diam' => 0, 'tekan' => 0, 'gerak' => 1],
                'mmt_records'     => [
                    ['gerakan' => 'Fleksor Shoulder',  'dex' => '5', 'sin' => '5'],
                    ['gerakan' => 'Ekstensor Shoulder','dex' => '5', 'sin' => '4'],
                    ['gerakan' => 'Fleksor Elbow',     'dex' => '5', 'sin' => '5'],
                    ['gerakan' => 'Dorsifleksor Ankle','dex' => '5', 'sin' => '4'],
                ],
                'clinical_notes'  => 'Sesi evaluasi T3: Penurunan tonus spastisitas menjadi Grade 1+, skor GMFM meningkat menjadi 70.4%, anak mampu melangkah dengan jejak kaki lebih datar.',
            ],
        ];

        foreach ($sessions as $s) {
            ProgressEvaluation::updateOrCreate(
                [
                    'patient_id'   => $patient->id,
                    'session_name' => $s['session_name'],
                ],
                [
                    'evaluation_date' => $s['evaluation_date'],
                    'gmfm_score'      => $s['gmfm_score'],
                    'ashworth_score'  => $s['ashworth_score'],
                    'pain_nrs'        => $s['pain_nrs'],
                    'mmt_records'     => $s['mmt_records'],
                    'clinical_notes'  => $s['clinical_notes'],
                ]
            );
        }
    }
}