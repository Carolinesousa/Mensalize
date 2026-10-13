<?php

use App\Models\Teacher;

it('registra uma professora', function () {
    $this->postJson('/api/register', [
        'name' => 'Carol', 'email' => 'carol@example.com',
        'password' => 'secret123', 'password_confirmation' => 'secret123', 'hourly_rate' => '25.00',
    ])->assertCreated()->assertJsonPath('email', 'carol@example.com');

    expect(Teacher::where('email', 'carol@example.com')->exists())->toBeTrue();
});

it('faz login e retorna o professor autenticado', function () {
    $teacher = Teacher::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);
    $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'secret123'])->assertNoContent();
    $this->getJson('/api/me')->assertOk()->assertJsonPath('email', 'a@b.com');
});

it('rejeita login inválido', function () {
    Teacher::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);
    $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'errada'])
        ->assertStatus(422);
});
