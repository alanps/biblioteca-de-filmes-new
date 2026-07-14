<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class UserIndexController extends Controller
{
    public function __invoke(): JsonResponse
    {
        Gate::authorize('view-users');

        return response()->json([
            'users' => User::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
        ]);
    }
}
