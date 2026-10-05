<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceAdjustment>
 */
class InvoiceAdjustmentFactory extends Factory
{
    protected $model = InvoiceAdjustment::class;

    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::factory(),
            'description' => 'Ajuste',
            'amount' => '0.00',
        ];
    }
}
