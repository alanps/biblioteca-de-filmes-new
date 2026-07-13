<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserIndexController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'users' => User::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
        ]);
    }
}
