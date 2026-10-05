<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\TeacherResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): TeacherResource
    {
        return new TeacherResource($request->user());
    }

    public function update(UpdateProfileRequest $request): TeacherResource
    {
        $request->user()->update($request->validated());

        return new TeacherResource($request->user());
    }
}
