<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('physio_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->string('selected_regio')->nullable(); // cervical, shoulder, knee, spine, dll

            // Data Subjektif (Anamnesis)
            $table->text('keluhan_utama')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_penyakit_penyerta')->nullable();
            $table->text('riwayat_pribadi_keluarga')->nullable();
            $table->jsonb('anamnesis_sistem')->nullable(); // Kepala/leher, respirasi, muskuloskeletal, nervorum, dll

            // Data Objektif (Pemeriksaan Fisik)
            $table->jsonb('vital_sign')->nullable(); // TD, HR, RR, Temp, TB, BB
            $table->text('inspeksi_statis')->nullable();
            $table->text('inspeksi_dinamis')->nullable();
            $table->text('palpasi')->nullable();
            $table->text('perkusi')->nullable();

            // Gerakan Dasar & Pemeriksaan
            $table->jsonb('gerak_dasar')->nullable(); // Aktif, Pasif, Isometrik
            $table->jsonb('pain_nrs')->nullable(); // Diam, Tekan, Gerak (Dextra & Sinistra)
            $table->jsonb('mmt_data')->nullable(); // Nilai kekuatan otot
            $table->jsonb('lgs_rom_data')->nullable(); // Notasi SFTR ROM
            $table->jsonb('antropometri')->nullable();
            $table->jsonb('special_tests')->nullable(); // Hasil tes spesifik yang positif/negatif

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physio_assessments');
    }
};