<?php
use App\Services\{LessonCounter, MensalidadeCalculator};
use Carbon\CarbonImmutable;

it('conta as aulas de um dia da semana em setembro/2026', function () {
    // setembro/2026 tem as segundas: 7, 14, 21, 28 => 4
    expect((new LessonCounter)->countInMonth([1], CarbonImmutable::parse('2026-09-01')))->toBe(4);
});

it('soma as ocorrências de múltiplos dias no mês', function () {
    // setembro/2026: segundas=4, quartas=5 (2,9,16,23,30) => 9
    expect((new LessonCounter)->countInMonth([1, 3], CarbonImmutable::parse('2026-09-01')))->toBe(9);
});

it('calcula o valor base com desconto, 2 casas', function () {
    expect((new MensalidadeCalculator)->baseAmount(9, '20.00', '10.00'))->toBe('162.00');
    expect((new MensalidadeCalculator)->baseAmount(4, '25.50', null))->toBe('102.00');
});

it('clampa o vencimento para o último dia do mês quando o dia não existe', function () {
    // competência 2026-01 (31 dias) -> vence em 2026-02; 31/02 não existe => 28
    expect((new MensalidadeCalculator)->dueDate(CarbonImmutable::parse('2026-01-01'), 31)->format('Y-m-d'))
        ->toBe('2026-02-28');
});
