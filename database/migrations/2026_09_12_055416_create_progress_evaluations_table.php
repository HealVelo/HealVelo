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
            $table->string('session_name', 20); // T1, T2, T3
            $table->date('evaluation_date');

            // Parameter Evaluasi Berkala
            $table->jsonb('pain_nrs')->nullable();
            $table->jsonb('mmt_records')->nullable();
            $table->jsonb('lgs_records')->nullable();
            $table->decimal('gmfm_score', 5, 2)->nullable();
            $table->string('ashworth_score')->nullable();
            $table->text('clinical_notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_evaluations');
    }
};