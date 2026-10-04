<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdjustmentRequest;
use App\Http\Resources\AdjustmentResource;
use Illuminate\Http\Request;

class InvoiceAdjustmentController extends Controller
{
    public function store(StoreAdjustmentRequest $request, int $invoice)
    {
        $model = $request->user()->invoices()->findOrFail($invoice);
        $adjustment = $model->adjustments()->create($request->validated());

        return (new AdjustmentResource($adjustment))->response()->setStatusCode(201);
    }

    public function destroy(Request $request, int $invoice, int $adjustment)
    {
        $model = $request->user()->invoices()->findOrFail($invoice);
        $model->adjustments()->findOrFail($adjustment)->delete();

        return response()->json(null, 204);
    }
}
