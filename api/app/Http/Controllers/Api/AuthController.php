<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $teacher = Teacher::create($request->validated());
        Auth::login($teacher);
        $request->session()->regenerate();

        return (new TeacherResource($teacher))->response()->setStatusCode(201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required']]);

        if (! Auth::attempt($data)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 422);
        }

        $request->session()->regenerate();

        return response()->json(null, 204);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }

    public function me(Request $request): TeacherResource
    {
        return new TeacherResource($request->user());
    }
}
