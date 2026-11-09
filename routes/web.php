<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Patient;
use App\Models\PhysioAssessment;
use App\Models\IcfReport;
use App\Models\ProgressEvaluation;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\StoreAssessmentRequest;
use App\Http\Requests\StorePatientRequest;
use App\Services\AiPhysioService;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes - HealVelo PhysioKit & Clinical EHR
|--------------------------------------------------------------------------
*/

// Redirect root ke dashboard (jika login) atau login (jika guest)
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// ==========================================
// 1. GUEST ROUTES (AUTENTIKASI AKUN)
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');

    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

// ==========================================
// 2. AUTHENTICATED ROUTES (PORTAL KLINIS)
// ==========================================
Route::middleware(['auth', 'throttle:60,1'])->group(function () {

    // Action Logout Resmi
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ------------------------------------------
    // DASHBOARD OVERVIEW
    // ------------------------------------------
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'userName' => auth()->user()->name ?? 'Physio Pro',
            'userRole' => auth()->user()->role ?? 'mahasiswa',
            'stats'    => [
                'totalPatients'    => Patient::count(),
                'assessments'      => PhysioAssessment::count(),
                'exercisePrograms' => IcfReport::count(),
                'generatedReports' => IcfReport::count(),
            ],
        ]);
    })->name('dashboard');

    // ------------------------------------------
    // PATIENTS MODULE
    // ------------------------------------------
    // Generator Nomor Rekam Medis Otomatis
    Route::get('/api/patients/generate-rm', function () {
        $maxRm = Patient::whereNotNull('no_rm')
            ->pluck('no_rm')
            ->filter(fn ($rm) => ctype_digit((string) $rm))
            ->map(fn ($rm) => (int) $rm)
            ->max();

        $nextNumber = $maxRm ? ($maxRm + 1) : 10001;
        return response()->json(['no_rm' => (string) $nextNumber]);
    })->name('patients.generate-rm');

    // Direktori Pasien Terdaftar
    Route::get('/patients', function (Request $request) {
        $search = trim((string) $request->query('search', ''));

        $paginated = Patient::accessibleBy($request->user())
            ->with('latestAssessment')
            ->when($search !== '', function ($query) use ($search) {
                $like = '%' . strtolower($search) . '%';
                $query->where(function ($q) use ($like) {
                    $q->whereRaw('LOWER(name) LIKE ?', [$like])
                      ->orWhereRaw("LOWER(COALESCE(no_rm, '')) LIKE ?", [$like])
                      ->orWhereRaw("LOWER(COALESCE(medical_diagnosis, '')) LIKE ?", [$like])
                      ->orWhereHas('latestAssessment', function ($aq) use ($like) {
                          $aq->whereRaw("LOWER(COALESCE(keluhan_utama, '')) LIKE ?", [$like]);
                      });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $patientsData = collect($paginated->items())->map(function ($p) {
            $words = explode(' ', trim($p->name));
            $initials = count($words) >= 2 
                ? strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1)) 
                : strtoupper(substr($p->name, 0, 2));

            return [
                'id'         => $p->id,
                'initials'   => $initials,
                'name'       => $p->name,
                'no_rm'      => $p->no_rm ?? '-',
                'age'        => $p->age,
                'gender'     => $p->gender,
                'complaint'  => $p->medical_diagnosis ?? $p->latestAssessment?->keluhan_utama ?? 'Pemeriksaan Klinis',
                'created_at' => $p->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('Patients/Index', [
            'patients'      => $patientsData,
            'currentPage'   => $paginated->currentPage(),
            'totalPages'    => $paginated->lastPage(),
            'totalPatients' => $paginated->total(),
            'search'        => $search,
        ]);
    })->name('patients');

    // Simpan Pendaftaran Pasien Baru
    Route::post('/patients', function (StorePatientRequest $request) {
        $validated = $request->validated();

        if ($request->hasFile('clinical_attachment')) {
            $path = $request->file('clinical_attachment')->store('clinical_attachments', 'local');
            $validated['clinical_attachment_path'] = $path;
        }
        unset($validated['clinical_attachment']);

        $validated['user_id'] = $request->user()?->id;

        Patient::create($validated);

        return redirect()->route('patients')->with('success', 'Pasien baru berhasil didaftarkan.');
    })->name('patients.store');

    // Detail Profil & Riwayat Pasien
    Route::get('/patients/{patient}', function (Request $request, Patient $patient) {
        abort_unless($patient->canBeAccessedBy($request->user()), 403, 'Anda tidak memiliki akses ke rekam medis pasien ini.');

        $patient->load([
            'assessments' => fn($q) => $q->latest(),
            'icfReports'  => fn($q) => $q->latest(),
            'evaluations' => fn($q) => $q->latest()
        ]);
        return Inertia::render('Patients/Show', ['patient' => $patient]);
    })->name('patients.show');

    // Streaming Berkas Penunjang Radiologi (Bebas 403 Forbidden bagi pemilik/pembimbing)
    Route::get('/patients/{patient}/attachment', function (Request $request, Patient $patient) {
        abort_unless($patient->canBeAccessedBy($request->user()), 403, 'Anda tidak memiliki akses ke berkas lampiran pasien ini.');

        if (!$patient->clinical_attachment_path) {
            abort(404, 'Berkas lampiran klinis tidak ditemukan di penyimpanan server.');
        }

        if (Storage::disk('local')->exists($patient->clinical_attachment_path)) {
            return Storage::disk('local')->response($patient->clinical_attachment_path);
        }

        if (Storage::disk('public')->exists($patient->clinical_attachment_path)) {
            return Storage::disk('public')->response($patient->clinical_attachment_path);
        }

        abort(404, 'Berkas lampiran klinis tidak ditemukan di penyimpanan server.');
    })->name('patients.attachment');

    // ------------------------------------------
    // PHYSIO KIT & CLINICAL ASSESSMENT MODULE
    // ------------------------------------------
    Route::get('/physio-kit', fn () => Inertia::render('PhysioKit/Index'))->name('physio-kit');

    // Form Pemeriksaan Fisik Terstandar (Menyertakan atribut age untuk deteksi cerdas)
    Route::get('/physio-kit/assessment', function (Request $request) {
        $patients = Patient::accessibleBy($request->user())
            ->select('id', 'name', 'no_rm', 'age')
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('PhysioKit/Assessment', [
            'area'       => $request->query('area', 'pediatric_full_body'),
            'patient_id' => $request->query('patient_id', ''),
            'patients'   => $patients,
        ]);
    })->name('physio-kit.assessment');

    // Simpan Asesmen & Analisis AI (ICF)
    Route::post('/physio-kit/assessment', function (StoreAssessmentRequest $request, AiPhysioService $aiService) {
        $assessment = PhysioAssessment::create($request->validated());

        try {
            $aiOutput = $aiService->generateIcfAnalysis($assessment);

            $icfReport = IcfReport::create([
                'patient_id'               => $assessment->patient_id,
                'assessment_id'            => $assessment->id,
                'body_structure'           => $aiOutput['body_structure'] ?? [],
                'body_function'            => $aiOutput['body_function'] ?? [],
                'activities_participation' => $aiOutput['activities_participation'] ?? [],
                'environmental_factors'    => $aiOutput['environmental_factors'] ?? [],
                'personal_factors'         => $aiOutput['personal_factors'] ?? [],
                'short_term_goals'         => $aiOutput['short_term_goals'] ?? [],
                'long_term_goals'          => $aiOutput['long_term_goals'] ?? [],
                'interventions_fitt'       => $aiOutput['interventions_fitt'] ?? [],
                'education'                => $aiOutput['education'] ?? null,
            ]);

            return redirect()->route('physio-kit.treatment-plan', ['report' => $icfReport->id])
                             ->with('success', 'Evaluasi klinis berhasil dianalisis oleh AI.');
        } catch (\Exception $e) {
            return redirect()->route('patients.show', $assessment->patient_id)
                             ->with('warning', 'Assessment tersimpan, namun pemrosesan AI gagal: ' . $e->getMessage());
        }
    })->name('physio-kit.assessment.store');

    // Lembar Cetak & Pratinjau Laporan ICF Dinamis
    Route::get('/physio-kit/treatment-plan', function (Request $request) {
        $report = IcfReport::with(['patient.evaluations', 'assessment'])->findOrFail($request->query('report'));
        abort_unless($report->patient && $report->patient->canBeAccessedBy($request->user()), 403, 'Anda tidak memiliki akses ke laporan klinik ini.');

        $user = auth()->user() ? auth()->user()->load('supervisor') : null;

        $practitioners = User::select('id', 'name', 'identifier_number', 'role')
            ->orderBy('name')
            ->limit(100)
            ->get();
        $supervisorsList = $practitioners->where('role', 'supervisor')->values();
        $studentsList = $practitioners->where('role', 'mahasiswa')->values();

        return Inertia::render('PhysioKit/TreatmentPlan', [
            'report'      => $report,
            'currentUser' => $user ? [
                'id'                => $user->id,
                'name'              => $user->name,
                'nim'               => $user->identifier_number ?? '',
                'role'              => $user->role ?? 'mahasiswa',
                'supervisor'        => [
                    'id'   => $user->supervisor?->id ?? null,
                    'name' => $user->supervisor?->name ?? '',
                    'nik'  => $user->supervisor?->identifier_number ?? '',
                ],
            ] : null,
            'availableSupervisors' => $supervisorsList,
            'availableStudents'    => $studentsList,
            'currentDate'          => now()->translatedFormat('d F Y'),
        ]);
    })->name('physio-kit.treatment-plan');

    // ------------------------------------------
    // PROGRESS TRACKING (EVALUATION) MODULE
    // ------------------------------------------
    Route::get('/progress-tracking', function (Request $request) {
        $patientId = $request->query('patient_id');
        $patients = Patient::accessibleBy($request->user())
            ->select('id', 'name', 'no_rm')
            ->latest()
            ->limit(100)
            ->get();

        $selectedPatient = null;
        $evaluations = [];

        if ($patientId) {
            $selectedPatient = Patient::accessibleBy($request->user())->with('evaluations')->findOrFail($patientId);
            $evaluations = $selectedPatient->evaluations;
        } elseif ($patients->isNotEmpty()) {
            $selectedPatient = Patient::accessibleBy($request->user())->with('evaluations')->find($patients->first()->id);
            $evaluations = $selectedPatient ? $selectedPatient->evaluations : [];
        }

        return Inertia::render('ProgressTracking/Index', [
            'patients'        => $patients,
            'selectedPatient' => $selectedPatient,
            'evaluations'     => $evaluations,
        ]);
    })->name('progress-tracking');

    Route::post('/progress-tracking', function (Request $request) {
        $validated = $request->validate([
            'patient_id'      => ['required', 'exists:patients,id'],
            'session_code'    => ['nullable', 'string', 'max:20'],
            'session_name'    => ['nullable', 'string', 'max:20'],
            'evaluation_date' => ['nullable', 'date', 'max:50'],
            'pain_nrs'        => ['required', 'array', 'max:20'],
            'mmt_records'     => ['nullable', 'array', 'max:100'],
            'lgs_records'     => ['nullable', 'array', 'max:100'],
            'gmfm_score'      => ['nullable', 'numeric', 'min:0', 'max:100'],
            'ashworth_score'  => ['nullable', 'string', 'max:50'],
            'clinical_notes'  => ['nullable', 'string', 'max:2000'],
        ]);

        $patient = Patient::findOrFail($validated['patient_id']);
        abort_unless($patient->canBeAccessedBy($request->user()), 403, 'Anda tidak memiliki akses untuk mengevaluasi pasien ini.');

        $sessionVal = $validated['session_name'] ?? $validated['session_code'] ?? 'T1';
        $validated['session_name'] = $sessionVal;
        unset($validated['session_code']);

        $rawDate = $request->input('evaluation_date');
        $validated['evaluation_date'] = !empty($rawDate) ? $rawDate : now()->format('Y-m-d');

        ProgressEvaluation::create($validated);

        return redirect()->route('progress-tracking', ['patient_id' => $validated['patient_id']])
                        ->with('success', 'Sesi evaluasi berhasil disimpan.');
    })->name('progress-tracking.store');

    // ------------------------------------------
    // UTILITY ROUTES
    // ------------------------------------------
    Route::get('/profile', fn () => Inertia::render('Profile'))->name('profile');
    Route::get('/settings', fn () => Inertia::render('Settings'))->name('settings');
    Route::get('/help-center', fn () => Inertia::render('HelpCenter'))->name('help-center');
});