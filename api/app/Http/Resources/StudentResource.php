<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'due_day' => $this->due_day,
            'weekdays' => $this->weekdays->pluck('weekday')->sort()->values(),
            'promotion' => $this->promotion ? [
                'id' => $this->promotion->id,
                'name' => $this->promotion->name,
                'discount_percent' => (string) $this->promotion->discount_percent,
            ] : null,
        ];
    }
}
