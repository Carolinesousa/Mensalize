<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Teacher extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'hourly_rate', 'message_template'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed', 'hourly_rate' => 'decimal:2'];

    public function promotions() { return $this->hasMany(Promotion::class); }
    public function students() { return $this->hasMany(Student::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
}
