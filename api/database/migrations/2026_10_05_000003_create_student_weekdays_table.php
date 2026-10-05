<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_weekdays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 1=seg ... 7=dom
            $table->timestamps();
            $table->unique(['student_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_weekdays');
    }
};
