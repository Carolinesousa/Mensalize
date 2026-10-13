<?php

namespace App\Http\Requests;

use App\Support\Placeholders;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'message_template' => ['nullable', 'string', 'max:1000', function ($attr, $value, $fail) {
                if ($value === null || $value === '') {
                    return;
                }
                if (! Placeholders::validate($value)) {
                    $fail('O modelo contém placeholders desconhecidos. Permitidos: '.implode(', ', Placeholders::all()).'.');
                }
            }],
        ];
    }
}
