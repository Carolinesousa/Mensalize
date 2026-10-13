<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $service) {}

    public function index(Request $request)
    {
        $ym = $request->validate(['month' => ['required', 'date_format:Y-m']])['month'];
        $invoices = $this->service->ensureMonth($request->user(), $ym);
        $invoices->load('student', 'adjustments');

        return InvoiceResource::collection($invoices->sortBy('student.name')->values());
    }

    public function show(Request $request, int $invoice)
    {
        $model = $request->user()->invoices()->with('student', 'adjustments')->findOrFail($invoice);

        return new InvoiceResource($model);
    }

    public function update(UpdateInvoiceRequest $request, int $invoice)
    {
        $model = $request->user()->invoices()->with('student', 'adjustments')->findOrFail($invoice);
        $data = $request->validated();
        if (($data['status'] ?? null) === 'paid' && $model->status !== 'paid') {
            $data['paid_at'] = now();
        }
        if (($data['status'] ?? null) === 'pending') {
            $data['paid_at'] = null;
        }
        $model->update($data);

        return new InvoiceResource($model->fresh()->load('student', 'adjustments'));
    }
}
