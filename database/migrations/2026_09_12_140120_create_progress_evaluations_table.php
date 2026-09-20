<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('progress_evaluations')) {
            Schema::create('progress_evaluations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
                $table->string('session_code');
                $table->date('evaluation_date');
                $table->json('pain_nrs');
                $table->json('mmt_records');
                $table->json('lgs_records')->nullable();
                $table->decimal('gmfm_score', 5, 2)->nullable();
                $table->string('ashworth_score')->nullable();
                $table->text('clinical_notes')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_evaluations');
    }
};