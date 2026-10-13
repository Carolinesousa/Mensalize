<?php

use App\Models\Teacher;

it('cria mensalidades lazy com snapshot, vencimento e status', function () {
    $teacher = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $promo = $teacher->promotions()->create(['name' => 'Irmãos', 'discount_percent' => '10']);
    $student = $teacher->students()->create(['name' => 'Ana', 'phone' => '5531999998888', 'due_day' => 10, 'promotion_id' => $promo->id]);
    $student->weekdays()->createMany([['weekday' => 1], ['weekday' => 3]]);

    $this->actingAs($teacher)->getJson('/api/invoices?month=2026-09')->assertOk()->assertJsonCount(1)
        ->assertJsonPath('0.base_lesson_count', 9)
        ->assertJsonPath('0.base_amount', '162.00')
        ->assertJsonPath('0.due_date', '2026-10-10')
        ->assertJsonPath('0.status', 'pending');

    // chamar de novo não duplica
    $this->actingAs($teacher)->getJson('/api/invoices?month=2026-09')->assertJsonCount(1);
    expect($teacher->invoices()->count())->toBe(1);
});

it('não acessa mensalidade de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $s = $owner->students()->create(['name' => 'X', 'phone' => '1', 'due_day' => 5]);
    $inv = $owner->invoices()->create(['student_id' => $s->id, 'reference_month' => '2026-09',
        'base_lesson_count' => 0, 'base_amount' => '0.00', 'due_date' => '2026-10-05', 'status' => 'pending']);
    $this->actingAs($other)->getJson("/api/invoices/{$inv->id}")->assertNotFound();
});
