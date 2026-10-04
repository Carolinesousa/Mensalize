<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'due_day' => ['sometimes', 'integer', 'between:1,31'],
            'promotion_id' => ['nullable', 'integer', 'exists:promotions,id'],
            'weekdays' => ['sometimes', 'array', 'min:1'],
            'weekdays.*' => ['integer', 'between:1,7', 'distinct'],
        ];
    }
}
