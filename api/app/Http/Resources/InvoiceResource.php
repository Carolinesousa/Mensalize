<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_month' => $this->reference_month,
            'student' => ['id' => $this->student->id, 'name' => $this->student->name],
            'base_lesson_count' => $this->base_lesson_count,
            'base_amount' => (string) $this->base_amount,
            'adjustments' => AdjustmentResource::collection($this->adjustments),
            'total_amount' => $this->total_amount,
            'due_date' => $this->due_date->format('Y-m-d'),
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
