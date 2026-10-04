<?php

use App\Models\Promotion;
use App\Models\Teacher;

it('cria e lista promoções do professor', function () {
    $teacher = Teacher::factory()->create();
    $this->actingAs($teacher)->postJson('/api/promotions', ['name' => 'Irmãos', 'discount_percent' => '15'])
        ->assertCreated()->assertJsonPath('name', 'Irmãos');
    $this->actingAs($teacher)->getJson('/api/promotions')->assertOk()->assertJsonCount(1);
});

it('não acessa promoção de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $promo = Promotion::factory()->for($owner)->create();
    $this->actingAs($other)->getJson("/api/promotions/{$promo->id}")->assertNotFound();
});
