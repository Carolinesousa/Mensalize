<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        return StudentResource::collection(
            $request->user()->students()->with('weekdays', 'promotion')->orderBy('name')->get()
        );
    }

    public function store(StoreStudentRequest $request)
    {
        $student = DB::transaction(function () use ($request) {
            $data = $request->safe()->except('weekdays');
            $student = $request->user()->students()->create($data);
            $this->syncWeekdays($student, $request->input('weekdays'));

            return $student;
        });

        return (new StudentResource($student->load('weekdays', 'promotion')))->response()->setStatusCode(201);
    }

    public function show(Request $request, int $student)
    {
        return new StudentResource(
            $request->user()->students()->with('weekdays', 'promotion')->findOrFail($student)
        );
    }

    public function update(UpdateStudentRequest $request, int $student)
    {
        $model = $request->user()->students()->findOrFail($student);

        DB::transaction(function () use ($request, $model) {
            $model->update($request->safe()->except('weekdays'));
            if ($request->has('weekdays')) {
                $this->syncWeekdays($model, $request->input('weekdays'));
            }
        });

        return new StudentResource($model->load('weekdays', 'promotion'));
    }

    public function destroy(Request $request, int $student)
    {
        $request->user()->students()->findOrFail($student)->delete();

        return response()->json(null, 204);
    }

    private function syncWeekdays(Student $student, array $weekdays): void
    {
        $student->weekdays()->delete();
        $student->weekdays()->createMany(collect($weekdays)->map(fn ($w) => ['weekday' => $w])->all());
    }
}
