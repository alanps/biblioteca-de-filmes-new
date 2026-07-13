<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchMoviesRequest;
use App\Services\MovieInfoService;
use Illuminate\Http\JsonResponse;
use Throwable;

class MovieSearchController extends Controller
{
    public function __invoke(SearchMoviesRequest $request, MovieInfoService $movieInfo): JsonResponse
    {
        try {
            return response()->json([
                'movies' => $movieInfo->search($request->validated('title')),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Não foi possível buscar os filmes agora.',
            ], 502);
        }
    }
}
