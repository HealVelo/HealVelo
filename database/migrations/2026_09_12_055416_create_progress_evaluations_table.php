<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progress_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->string('session_name'); // T0, T1, T2, T3
            $table->date('evaluation_date');

            // Track Record Tiga Parameter Utama
            $table->jsonb('pain_scores')->nullable(); // Skor NRS evaluasi
            $table->jsonb('mmt_scores')->nullable();  // Skor MMT evaluasi
            $table->jsonb('lgs_scores')->nullable();  // LGS ROM evaluasi
            $table->text('clinical_notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_evaluations');
    }
};