<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'teacher_id' => Teacher::factory(),
            'student_id' => Student::factory(),
            'reference_month' => '2026-09',
            'base_lesson_count' => 4,
            'base_amount' => '80.00',
            'due_date' => '2026-10-10',
            'status' => 'pending',
        ];
    }
}
