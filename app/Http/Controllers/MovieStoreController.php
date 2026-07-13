<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMovieRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class MovieStoreController extends Controller
{
    public function __invoke(StoreMovieRequest $request): JsonResponse
    {
        $validated = $request->validated();
        /** @var User $user */
        $user = $request->user();
        $movie = $user->movies()->firstOrCreate(
            ['original_title' => $validated['originalTitle']],
            [
                'title' => $validated['title'],
                'release_date' => $this->releaseDate($validated['releaseDate'] ?? null),
                'synopsis' => $validated['synopsis'] ?? null,
                'poster_url' => $validated['posterUrl'] ?? null,
            ],
        );

        return response()->json([
            'movie' => [
                'id' => $movie->id,
                'title' => $movie->title,
                'originalTitle' => $movie->original_title,
                'releaseDate' => $movie->release_date?->format('d-m-Y') ?? '',
                'synopsis' => $movie->synopsis ?? '',
                'genres' => [],
                'posterUrl' => $movie->poster_url,
            ],
        ], $movie->wasRecentlyCreated ? 201 : 200);
    }

    private function releaseDate(?string $releaseDate): ?string
    {
        if ($releaseDate === null) {
            return null;
        }

        $format = Str::of($releaseDate)->before('-')->length() === 4 ? 'Y-m-d' : 'd-m-Y';

        return Carbon::createFromFormat($format, $releaseDate)->toDateString();
    }
}
