<?php

namespace App\Services;

use App\Models\{Invoice, Teacher};
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class InvoiceService
{
    public function __construct(
        private LessonCounter $counter,
        private MensalidadeCalculator $calculator,
    ) {}

    /** @return Collection<int, Invoice> */
    public function ensureMonth(Teacher $teacher, string $ym): Collection
    {
        $month = CarbonImmutable::createFromFormat('Y-m', $ym)->startOfMonth();
        $students = $teacher->students()->with('weekdays', 'promotion')->get();

        return $students->map(function ($student) use ($teacher, $month) {
            $lessons = $this->counter->countInMonth($student->weekdays->pluck('weekday')->all(), $month);

            return Invoice::firstOrCreate(
                ['student_id' => $student->id, 'reference_month' => $month->format('Y-m')],
                [
                    'teacher_id' => $teacher->id,
                    'base_lesson_count' => $lessons,
                    'base_amount' => $this->calculator->baseAmount($lessons, $teacher->hourly_rate, $student->promotion?->discount_percent),
                    'due_date' => $this->calculator->dueDate($month, $student->due_day)->format('Y-m-d'),
                    'status' => 'pending',
                ],
            );
        });
    }
}
