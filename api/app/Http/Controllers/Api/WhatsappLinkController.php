<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MessageTemplateRenderer;
use App\Services\WhatsAppLinkBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class WhatsappLinkController extends Controller
{
    public function __invoke(Request $request, int $invoice)
    {
        $teacher = $request->user();
        $model = $teacher->invoices()->with('student', 'adjustments')->findOrFail($invoice);

        $competencia = Carbon::createFromFormat('Y-m', $model->reference_month)->format('m/Y');
        $message = (new MessageTemplateRenderer)->render($teacher->message_template, [
            'aluno' => $model->student->name,
            'competencia' => $competencia,
            'aulas' => $model->base_lesson_count,
            'valor' => 'R$ '.number_format((float) $model->total_amount, 2, ',', '.'),
            'vencimento' => $model->due_date->format('d/m/Y'),
            'professora' => $teacher->name,
        ]);
        $url = (new WhatsAppLinkBuilder)->build($model->student->phone, $message);

        return response()->json(['url' => $url, 'message' => $message]);
    }
}
