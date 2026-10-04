<?php

use App\Http\Controllers\Api\{AuthController, InvoiceAdjustmentController, InvoiceController, ProfileController, PromotionController, StudentController, WhatsappLinkController};
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::apiResource('promotions', PromotionController::class);
    Route::apiResource('students', StudentController::class);

    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::patch('invoices/{invoice}', [InvoiceController::class, 'update']);
    Route::post('invoices/{invoice}/adjustments', [InvoiceAdjustmentController::class, 'store']);
    Route::delete('invoices/{invoice}/adjustments/{adjustment}', [InvoiceAdjustmentController::class, 'destroy']);
    Route::get('invoices/{invoice}/whatsapp-link', WhatsappLinkController::class);
});
