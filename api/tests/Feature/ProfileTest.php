<?php

use App\Models\Teacher;

it('retorna o perfil da professora autenticada', function () {
    $teacher = Teacher::factory()->create([
        'name' => 'Carol',
        'email' => 'carol@example.com',
        'hourly_rate' => '25.00',
        'message_template' => 'Oi {aluno}, deu {valor}.',
    ]);

    $this->actingAs($teacher)->getJson('/api/profile')
        ->assertOk()
        ->assertJsonPath('name', 'Carol')
        ->assertJsonPath('email', 'carol@example.com')
        ->assertJsonPath('hourly_rate', '25.00')
        ->assertJsonPath('message_template', 'Oi {aluno}, deu {valor}.');
});

it('atualiza hora-aula e modelo de mensagem válidos e persiste', function () {
    $teacher = Teacher::factory()->create(['hourly_rate' => '20.00', 'message_template' => null]);

    $this->actingAs($teacher)->putJson('/api/profile', [
        'hourly_rate' => '30.00',
        'message_template' => 'Oi {aluno}, a competência {competencia} ficou {valor}.',
    ])->assertOk()->assertJsonPath('hourly_rate', '30.00');

    $this->assertDatabaseHas('teachers', [
        'id' => $teacher->id,
        'hourly_rate' => '30.00',
        'message_template' => 'Oi {aluno}, a competência {competencia} ficou {valor}.',
    ]);
});

it('rejeita placeholder desconhecido no modelo de mensagem', function () {
    $teacher = Teacher::factory()->create();

    $this->actingAs($teacher)->putJson('/api/profile', [
        'message_template' => 'Oi {foo}, deu {valor}.',
    ])->assertStatus(422)->assertJsonValidationErrors('message_template');
});
