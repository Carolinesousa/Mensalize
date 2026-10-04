<?php

use App\Models\{Teacher, Invoice};

function makeInvoice(Teacher $t, string $base = '100.00'): Invoice {
    $s = $t->students()->create(['name' => 'Ana', 'phone' => '1', 'due_day' => 5]);
    return $t->invoices()->create(['student_id' => $s->id, 'reference_month' => '2026-09',
        'base_lesson_count' => 5, 'base_amount' => $base, 'due_date' => '2026-10-05', 'status' => 'pending']);
}

it('adiciona aula extra e ajuste negativo, refletindo no total', function () {
    $t = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $inv = makeInvoice($t);

    $this->actingAs($t)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'Aula extra', 'amount' => '20.00'])
        ->assertCreated();
    $this->actingAs($t)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'Falta', 'amount' => '-20.00'])
        ->assertCreated();

    $this->actingAs($t)->getJson("/api/invoices/{$inv->id}")->assertJsonPath('total_amount', '100.00');
});

it('não adiciona ajuste em mensalidade de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $inv = makeInvoice($owner);
    $this->actingAs($other)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'x', 'amount' => '1'])
        ->assertNotFound();
});
