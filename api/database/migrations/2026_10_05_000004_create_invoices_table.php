<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->char('reference_month', 7); // YYYY-MM
            $table->unsignedInteger('base_lesson_count');
            $table->decimal('base_amount', 10, 2);
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'reference_month']);
            $table->index(['teacher_id', 'reference_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
