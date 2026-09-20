<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'identifier_number')) {
                $table->string('identifier_number', 50)->nullable()->comment('NIM Mahasiswa atau NIK Pembimbing');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['mahasiswa', 'supervisor', 'admin'])->default('mahasiswa');
            }
            if (!Schema::hasColumn('users', 'supervisor_id')) {
                $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropColumn(['identifier_number', 'role', 'supervisor_id']);
        });
    }
};