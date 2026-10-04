<?php

use App\Models\Teacher;

it('cria aluno com múltiplos dias e promoção', function () {
    $teacher = Teacher::factory()->create();
    $promo = $teacher->promotions()->create(['name' => 'Irmãos', 'discount_percent' => '15']);
    $this->actingAs($teacher)->postJson('/api/students', [
        'name' => 'Ana', 'phone' => '31 99999-8888', 'due_day' => 10,
        'promotion_id' => $promo->id, 'weekdays' => [1, 3],
    ])->assertCreated()->assertJsonPath('weekdays', [1, 3]);
});

it('atualiza os dias do aluno substituindo os antigos', function () {
    $teacher = Teacher::factory()->create();
    $student = $teacher->students()->create(['name' => 'Bia', 'phone' => '31999998888', 'due_day' => 5]);
    $student->weekdays()->createMany([['weekday' => 1], ['weekday' => 3]]);
    $this->actingAs($teacher)->putJson("/api/students/{$student->id}", ['weekdays' => [2]])
        ->assertOk()->assertJsonPath('weekdays', [2]);
});

it('não acessa aluno de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $student = $owner->students()->create(['name' => 'X', 'phone' => '31999998888', 'due_day' => 5]);
    $this->actingAs($other)->getJson("/api/students/{$student->id}")->assertNotFound();
});
