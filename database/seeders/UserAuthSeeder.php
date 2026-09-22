<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserAuthSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Pembimbing / Clinical Educator
        $supervisor = User::updateOrCreate(
            ['email' => 'supervisor@ums.ac.id'],
            [
                'name'              => 'Umi Budi Rahayu, S.Fis., Ftr., M.Kes',
                'identifier_number' => '197108252005012001',
                'role'              => 'supervisor',
                'password'          => Hash::make('password123'),
            ]
        );

        // 2. Akun Mahasiswa Praktikan
        User::updateOrCreate(
            ['email' => 'afrizal@student.ums.ac.id'],
            [
                'name'              => 'Afrizal Putra Pratama',
                'identifier_number' => 'J120220001',
                'role'              => 'mahasiswa',
                'supervisor_id'     => $supervisor->id,
                'password'          => Hash::make('password123'),
            ]
        );
    }
}