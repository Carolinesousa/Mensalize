<?php

namespace App\Services;

use Carbon\CarbonImmutable;

class LessonCounter
{
    /** @param int[] $weekdays 1=seg ... 7=dom */
    public function countInMonth(array $weekdays, CarbonImmutable $month): int
    {
        $count = 0;
        for ($d = $month->startOfMonth(); $d->lte($month->endOfMonth()); $d = $d->addDay()) {
            if (in_array($d->isoWeekday(), $weekdays, true)) {
                $count++;
            }
        }

        return $count;
    }
}
