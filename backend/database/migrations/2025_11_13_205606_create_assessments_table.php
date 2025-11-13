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
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('weight', 5, 2); // peso en kg
            $table->decimal('height', 5, 2); // estatura en cm
            $table->integer('age');
            $table->enum('gender', ['male', 'female']); // género
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'active', 'very_active']); // nivel de actividad
            $table->decimal('bmi', 5, 2)->nullable(); // Índice de Masa Corporal
            $table->decimal('geb', 8, 2)->nullable(); // Gasto Energético Basal (kcal)
            $table->decimal('get', 8, 2)->nullable(); // Gasto Energético Total (kcal)
            $table->decimal('caloric_balance', 8, 2)->nullable(); // Balance calórico
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
