<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'general_treatment')) {
                $table->string('general_treatment')->nullable();
            }
            if (!Schema::hasColumn('patients', 'doctor_referral')) {
                $table->text('doctor_referral')->nullable();
            }
            if (!Schema::hasColumn('patients', 'clinical_attachment_path')) {
                $table->string('clinical_attachment_path')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'clinical_attachment_path')) {
                $table->dropColumn('clinical_attachment_path');
            }
            if (Schema::hasColumn('patients', 'doctor_referral')) {
                $table->dropColumn('doctor_referral');
            }
            if (Schema::hasColumn('patients', 'general_treatment')) {
                $table->dropColumn('general_treatment');
            }
        });
    }
};