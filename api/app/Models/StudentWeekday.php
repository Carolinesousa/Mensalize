<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentWeekday extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'weekday'];

    public function student() { return $this->belongsTo(Student::class); }
}
