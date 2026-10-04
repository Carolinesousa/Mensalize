<?php

namespace Database\Factories;

use App\Models\Promotion;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        return [
            'teacher_id' => Teacher::factory(),
            'name' => 'Indicação',
            'discount_percent' => '10.00',
        ];
    }
}
