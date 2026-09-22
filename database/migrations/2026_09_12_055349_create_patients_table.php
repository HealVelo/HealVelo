<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('no_rm')->unique()->nullable();
            $table->string('name');
            $table->string('age');
            $table->enum('gender', ['Laki-Laki', 'Perempuan'])->nullable();
            $table->string('religion')->nullable();
            $table->string('occupation')->nullable();
            $table->text('address')->nullable();
            
            // Data Medis RS
            $table->string('medical_diagnosis')->nullable();
            $table->text('clinical_notes')->nullable(); // Rontgen, MRI, CT-Scan, dll
            $table->text('general_treatment')->nullable();
            $table->text('doctor_referral')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};