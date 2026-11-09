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

            // Data Subjektif (Anamnesis Umum & Pediatrik)
            $table->text('keluhan_utama')->nullable();
            $table->text('riwayat_penyakit_sekarang')->nullable();
            $table->text('riwayat_penyakit_dahulu')->nullable();
            $table->text('riwayat_penyakit_penyerta')->nullable();
            $table->text('riwayat_pribadi_keluarga')->nullable();
            $table->text('riwayat_prenatal')->nullable();
            $table->text('riwayat_natal')->nullable();
            $table->text('riwayat_postnatal')->nullable();
            $table->jsonb('anamnesis_sistem')->nullable();

            // Data Objektif (Pemeriksaan Fisik)
            $table->jsonb('vital_sign')->nullable(); // TD, HR, RR, Temp, TB, BB
            $table->text('inspeksi_statis')->nullable();
            $table->text('inspeksi_dinamis')->nullable();
            $table->text('palpasi')->nullable();
            $table->text('perkusi')->nullable();

            // Gerakan Dasar & Pengukuran Terstandar
            $table->jsonb('gerak_aktif')->nullable();
            $table->jsonb('gerak_pasif')->nullable();
            $table->jsonb('gerak_isometrik')->nullable();
            $table->jsonb('pain_nrs')->nullable();
            $table->jsonb('mmt_rows')->nullable();
            $table->jsonb('lgs_data')->nullable();
            $table->jsonb('sensibilitas_records')->nullable();
            $table->string('gmfcs_level', 50)->nullable();
            $table->decimal('gmfm_total', 5, 2)->nullable();
            $table->jsonb('special_tests')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physio_assessments');
    }
};