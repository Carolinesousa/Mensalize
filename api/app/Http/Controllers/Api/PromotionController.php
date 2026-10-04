<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        return PromotionResource::collection($request->user()->promotions()->orderBy('name')->get());
    }

    public function store(StorePromotionRequest $request)
    {
        $promotion = $request->user()->promotions()->create($request->validated());

        return (new PromotionResource($promotion))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $promotion)
    {
        return new PromotionResource($request->user()->promotions()->findOrFail($promotion));
    }

    public function update(StorePromotionRequest $request, int $promotion)
    {
        $model = $request->user()->promotions()->findOrFail($promotion);
        $model->update($request->validated());

        return new PromotionResource($model);
    }

    public function destroy(Request $request, int $promotion)
    {
        $request->user()->promotions()->findOrFail($promotion)->delete();

        return response()->json(null, 204);
    }
}
