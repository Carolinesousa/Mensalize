<?php

use App\Models\{Teacher, Promotion, Student, StudentWeekday, Invoice, InvoiceAdjustment};

it('relaciona professor, aluno, dias, promoção e mensalidade', function () {
    $teacher = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $promo = Promotion::factory()->for($teacher)->create(['discount_percent' => '10.00']);
    $student = Student::factory()->for($teacher)->create(['promotion_id' => $promo->id, 'due_day' => 10]);

    StudentWeekday::factory()->for($student)->create(['weekday' => 1]);
    StudentWeekday::factory()->for($student)->create(['weekday' => 3]);

    $invoice = Invoice::factory()->for($teacher)->for($student)->create([
        'reference_month' => '2026-09', 'base_lesson_count' => 9, 'base_amount' => '162.00',
        'due_date' => '2026-10-10', 'status' => 'pending',
    ]);
    InvoiceAdjustment::factory()->for($invoice)->create(['description' => 'Aula extra', 'amount' => '20.00']);
    InvoiceAdjustment::factory()->for($invoice)->create(['description' => 'Falta', 'amount' => '-20.00']);

    expect($student->weekdays()->count())->toBe(2);
    expect($student->promotion->id)->toBe($promo->id);
    expect($invoice->fresh()->total_amount)->toBe('162.00'); // 162 + 20 - 20
});
