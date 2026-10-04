<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'teacher_id' => Teacher::factory(),
            'name' => fake()->firstName(),
            'phone' => '5531999998888',
            'due_day' => 10,
            'promotion_id' => null,
        ];
    }
}
