<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('physio_assessments', function (Blueprint $table) {
            if (!Schema::hasColumn('physio_assessments', 'gerak_aktif')) {
                $table->json('gerak_aktif')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'gerak_pasif')) {
                $table->json('gerak_pasif')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'gerak_isometrik')) {
                $table->json('gerak_isometrik')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'pain_nrs')) {
                $table->json('pain_nrs')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'mmt_rows')) {
                $table->json('mmt_rows')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'lgs_data')) {
                $table->json('lgs_data')->nullable();
            }
            if (!Schema::hasColumn('physio_assessments', 'special_tests')) {
                $table->json('special_tests')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('physio_assessments', function (Blueprint $table) {
            $table->dropColumn([
                'gerak_aktif',
                'gerak_pasif',
                'gerak_isometrik',
                'pain_nrs',
                'mmt_rows',
                'lgs_data',
                'special_tests',
            ]);
        });
    }
};