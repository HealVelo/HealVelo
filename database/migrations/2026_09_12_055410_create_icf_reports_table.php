<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('icf_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('assessment_id')->nullable()->constrained('physio_assessments')->onDelete('set null');

            // 5 Pilar Klasifikasi ICF (WHO Code & Description)
            $table->jsonb('body_structure')->nullable(); // Array kode s...
            $table->jsonb('body_function')->nullable();  // Array kode b...
            $table->jsonb('activities_participation')->nullable(); // Array kode d...
            $table->jsonb('environmental_factors')->nullable();    // Array kode e...
            $table->jsonb('personal_factors')->nullable();

            // Program Perencanaan Fisioterapi
            $table->jsonb('short_term_goals')->nullable();
            $table->jsonb('long_term_goals')->nullable();
            $table->jsonb('interventions_fitt')->nullable(); // Frequency, Intensity, Time, Type
            $table->text('education')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('icf_reports');
    }
};