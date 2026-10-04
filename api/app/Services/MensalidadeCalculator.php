<?php
namespace App\Services;

use Carbon\CarbonImmutable;

class MensalidadeCalculator {
    public function baseAmount(int $lessons, string $hourlyRate, ?string $discountPercent): string {
        $discount = $discountPercent === null ? 0.0 : (float) $discountPercent;
        $amount = $lessons * (float) $hourlyRate * (1 - $discount / 100);
        return number_format(round($amount, 2), 2, '.', '');
    }

    public function dueDate(CarbonImmutable $referenceMonth, int $dueDay): CarbonImmutable {
        $next = $referenceMonth->addMonthNoOverflow()->startOfMonth();
        return $next->day(min($dueDay, $next->daysInMonth));
    }
}
