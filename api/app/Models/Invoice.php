<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_id', 'student_id', 'reference_month', 'base_lesson_count',
        'base_amount', 'due_date', 'status', 'paid_at'];

    protected $casts = ['due_date' => 'date', 'paid_at' => 'datetime', 'base_amount' => 'decimal:2'];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function adjustments()
    {
        return $this->hasMany(InvoiceAdjustment::class);
    }

    public function getTotalAmountAttribute(): string
    {
        $sum = (float) $this->base_amount + (float) $this->adjustments->sum('amount');

        return number_format(round($sum, 2), 2, '.', '');
    }
}
