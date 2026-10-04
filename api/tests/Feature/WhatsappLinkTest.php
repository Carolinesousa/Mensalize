<?php
use App\Models\Teacher;

it('gera o link do WhatsApp da mensalidade', function () {
    $t = Teacher::factory()->create(['hourly_rate' => '20.00', 'name' => 'Carol']);
    $s = $t->students()->create(['name' => 'Ana', 'phone' => '31999998888', 'due_day' => 10]);
    $s->weekdays()->create(['weekday' => 1]);
    $this->actingAs($t)->getJson('/api/invoices?month=2026-09');
    $inv = $t->invoices()->first();

    $this->actingAs($t)->getJson("/api/invoices/{$inv->id}/whatsapp-link")
        ->assertOk()->assertJsonPath('url', fn ($u) => str_starts_with($u, 'https://wa.me/5531999998888?text='));
});
