<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'string', 'email:rfc,dns'],
            'password' => ['required', 'string'],
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        // Proteksi Brute Force: Maksimal 5 percobaan gagal per IP/Email
        $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan masuk. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        $credentials = [
            'email'    => Str::lower(trim($request->input('email'))),
            'password' => $request->input('password'),
        ];

        // Parameter boolean 'remember' mengaktifkan cookie sesi permanen Laravel
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        RateLimiter::hit($throttleKey, 300); // Kunci selama 5 menit jika gagal berturut-turut

        throw ValidationException::withMessages([
            'email' => 'Kombinasi email atau kata sandi tidak cocok dengan data kami.',
        ]);
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        $supervisors = User::where('role', 'supervisor')
            ->select('id', 'name', 'identifier_number')
            ->orderBy('name')
            ->get();

        return Inertia::render('Auth/Register', [
            'supervisors' => $supervisors,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'              => ['required', 'string', 'min:3', 'max:100', 'regex:/^[a-zA-Z\s.,\'-]+$/'],
            'email'             => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'role'              => ['required', 'in:mahasiswa,supervisor'],
            'identifier_number' => ['required', 'string', 'max:30', 'regex:/^[0-9a-zA-Z\/-]+$/'],
            'supervisor_id'     => ['nullable', 'exists:users,id'],
            'password'          => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
            ],
        ], [
            'name.regex'                 => 'Nama hanya boleh menggunakan huruf dan tanda baca gelar.',
            'email.unique'               => 'Alamat email ini sudah terdaftar di sistem.',
            'identifier_number.required' => 'Nomor induk (NIM/NIK) wajib diisi.',
            'identifier_number.regex'    => 'Format nomor induk hanya boleh berupa angka dan huruf.',
            'password.min'               => 'Kata sandi minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka.',
            'password.confirmed'         => 'Konfirmasi kata sandi tidak sesuai.',
        ]);

        if ($validated['role'] === 'mahasiswa' && empty($validated['supervisor_id'])) {
            throw ValidationException::withMessages([
                'supervisor_id' => 'Mahasiswa praktikan wajib memilih dosen pembimbing klinis.',
            ]);
        }

        $user = User::create([
            'name'              => strip_tags(trim($validated['name'])),
            'email'             => Str::lower(trim($validated['email'])),
            'role'              => $validated['role'],
            'identifier_number' => trim($validated['identifier_number']),
            'supervisor_id'     => $validated['role'] === 'mahasiswa' ? $validated['supervisor_id'] : null,
            'password'          => Hash::make($validated['password']),
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}