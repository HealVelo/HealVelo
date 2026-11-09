<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => fn () => [
                'user' => auth()->user() ? [
                    'id'                => auth()->id(),
                    'name'              => auth()->user()->name,
                    'email'             => auth()->user()->email,
                    'role'              => auth()->user()->role ?? 'mahasiswa',
                    'identifier_number' => auth()->user()->identifier_number ?? '',
                ] : null,
            ],
            'flash' => fn () => [
                'success' => session('success'),
                'warning' => session('warning'),
                'error'   => session('error'),
            ],
        ]);
    }
}
