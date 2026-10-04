<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentWeekday;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentWeekday>
 */
class StudentWeekdayFactory extends Factory
{
    protected $model = StudentWeekday::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'weekday' => 1,
        ];
    }
}
