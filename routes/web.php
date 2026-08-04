<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// NOTE: middleware 'auth' sengaja belum dipasang karena Laravel Breeze/auth
// scaffolding belum diinstall (route 'login' belum ada). Begitu kamu install
// Breeze (lihat instruksi di chat), bungkus grup ini dengan
// Route::middleware(['auth'])->group(function () { ... }); lagi.
Route::group([], function () {

    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'userName' => auth()->user()->name ?? 'Physio Pro',

            // TODO: ganti dengan data asli dari model/DB
            'stats' => [
                'totalPatients' => 2847,
                'assessments' => 1234,
                'exercisePrograms' => 856,
                'generatedReports' => 643,
            ],
        ]);
    })->name('dashboard');

    // Patients
    Route::get('/patients', function () {
        // TODO: ganti dengan Patient::paginate(6) dari database
        return Inertia::render('Patients', [
            'patients' => [
                ['initials' => 'SJ', 'name' => 'Sarah Johnson', 'phone' => '+1 (555) 123-4567', 'age' => 32, 'complaint' => 'Cervical Neck Pain', 'assessment' => '2024-06-25', 'status' => 'Active'],
                ['initials' => 'MC', 'name' => 'Michael Chen', 'phone' => '+1 (555) 234-5678', 'age' => 45, 'complaint' => 'Knee Ligament Injury', 'assessment' => '2024-06-24', 'status' => 'Recovered'],
                ['initials' => 'EW', 'name' => 'Emma Williams', 'phone' => '+1 (555) 345-6789', 'age' => 28, 'complaint' => 'Lower Back Pain', 'assessment' => '2024-06-23', 'status' => 'Active'],
                ['initials' => 'JB', 'name' => 'James Brown', 'phone' => '+1 (555) 456-7890', 'age' => 51, 'complaint' => 'Shoulder Rotator Cuff', 'assessment' => '2024-06-22', 'status' => 'In Treatment'],
                ['initials' => 'OD', 'name' => 'Olivia Davis', 'phone' => '+1 (555) 567-8901', 'age' => 37, 'complaint' => 'Hip Flexor Strain', 'assessment' => '2024-06-21', 'status' => 'Active'],
                ['initials' => 'WM', 'name' => 'William Martinez', 'phone' => '+1 (555) 678-9012', 'age' => 42, 'complaint' => 'Ankle Sprain', 'assessment' => '2024-06-20', 'status' => 'Recovered'],
            ],
            'currentPage' => (int) request('page', 1),
            'totalPages' => 3,
            'totalPatients' => 48,
        ]);
    })->name('patients');

    Route::get('/patients/create', function () {
        return Inertia::render('Patients/Create');
    })->name('patients.create');

    Route::get('/patients/{patient}', function ($patient) {
        return Inertia::render('Patients/Show', ['id' => $patient]);
    })->name('patients.show');

    Route::get('/patients/{patient}/edit', function ($patient) {
        return Inertia::render('Patients/Edit', ['id' => $patient]);
    })->name('patients.edit');

    // Physio Kit
    Route::get('/physio-kit', function () {
        return Inertia::render('PhysioKit');
    })->name('physio-kit');

    Route::get('/physio-kit/assessment', function () {
        return Inertia::render('PhysioKit/Assessment', [
            'area' => request('area'),
        ]);
    })->name('physio-kit.assessment');

    Route::get('/physio-kit/treatment-plan', function () {
        return Inertia::render('PhysioKit/TreatmentPlan', [
            'area' => request('area'),
        ]);
    })->name('physio-kit.treatment-plan');

    // Profile & Settings (dipakai Navbar)
    Route::get('/profile', function () {
        return Inertia::render('Profile');
    })->name('profile');

    Route::get('/settings', function () {
        return Inertia::render('Settings');
    })->name('settings');

    Route::get('/help-center', function () {
        return Inertia::render('HelpCenter');
    })->name('help-center');

    Route::post('/logout', function () {
        if (auth()->check()) {
            auth()->logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }

        return redirect('/dashboard');
    })->name('logout');
});