<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceAdjustment extends Model
{
    use HasFactory;

    protected $fillable = ['invoice_id', 'description', 'amount'];
    protected $casts = ['amount' => 'decimal:2'];

    public function invoice() { return $this->belongsTo(Invoice::class); }
}
