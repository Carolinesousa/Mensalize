<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_id', 'promotion_id', 'name', 'phone', 'due_day'];

    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }
    public function weekdays() { return $this->hasMany(StudentWeekday::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
}
