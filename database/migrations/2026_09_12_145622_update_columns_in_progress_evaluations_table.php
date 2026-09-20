<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('progress_evaluations', function (Blueprint $table) {
            if (!Schema::hasColumn('progress_evaluations', 'session_name')) {
                $table->string('session_name')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'evaluation_date')) {
                $table->date('evaluation_date')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'pain_nrs')) {
                $table->json('pain_nrs')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'mmt_records')) {
                $table->json('mmt_records')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'lgs_records')) {
                $table->json('lgs_records')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'gmfm_score')) {
                $table->decimal('gmfm_score', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'ashworth_score')) {
                $table->string('ashworth_score')->nullable();
            }
            if (!Schema::hasColumn('progress_evaluations', 'clinical_notes')) {
                $table->text('clinical_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('progress_evaluations', function (Blueprint $table) {
            // Biarkan kosong untuk rollback aman
        });
    }
};