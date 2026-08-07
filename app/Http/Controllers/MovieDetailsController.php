<?php

namespace App\Http\Controllers;

use App\Services\MovieInfoService;
use Illuminate\Http\JsonResponse;
use Throwable;

class MovieDetailsController extends Controller
{
    public function __invoke(int $movie, MovieInfoService $movieInfo): JsonResponse
    {
        try {
            return response()->json([
                'movie' => $movieInfo->details($movie),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Não foi possível carregar os detalhes do filme agora.',
            ], 502);
        }
    }
}
