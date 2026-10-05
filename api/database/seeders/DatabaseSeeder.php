<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Teacher::factory(10)->create();

        Teacher::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
