<?php

namespace App\Http\Controllers;

use App\Http\Resources\MovieResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MovieIndexController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $movies = $user->movies()
            ->select(['id', 'user_id', 'title', 'original_title', 'release_date', 'synopsis', 'poster_url'])
            ->latest()
            ->get();

        return response()->json([
            'movies' => MovieResource::collection($movies)->resolve($request),
        ]);
    }
}
