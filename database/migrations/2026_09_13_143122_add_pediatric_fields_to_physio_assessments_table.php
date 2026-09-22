<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('physio_assessments', function (Blueprint $table) {
            $table->text('riwayat_prenatal')->nullable()->after('riwayat_pribadi_keluarga');
            $table->text('riwayat_natal')->nullable()->after('riwayat_prenatal');
            $table->text('riwayat_postnatal')->nullable()->after('riwayat_natal');
            $table->json('sensibilitas_records')->nullable()->after('lgs_data');
            $table->string('gmfcs_level', 50)->nullable()->after('sensibilitas_records');
            $table->decimal('gmfm_total', 5, 2)->nullable()->after('gmfcs_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('physio_assessments', function (Blueprint $table) {
            $table->dropColumn([
                'riwayat_prenatal',
                'riwayat_natal',
                'riwayat_postnatal',
                'sensibilitas_records',
                'gmfcs_level',
                'gmfm_total',
            ]);
        });
    }
};