<?php

namespace App\Services;

use DateTimeImmutable;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class MovieInfoService
{
    /**
     * @return array<int, array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}>
     */
    public function search(string $title): array
    {
        $response = Http::baseUrl(config('services.movie_info.base_url'))
            ->acceptJson()
            ->withOptions(['verify' => config('services.movie_info.verify_tls')])
            ->withHeaders([
                'X-RapidAPI-Key' => config('services.movie_info.key'),
                'X-RapidAPI-Host' => config('services.movie_info.host'),
            ])
            ->connectTimeout(3)
            ->timeout(10)
            ->get('/movie-info', [
                'title' => $title,
                'lang' => 'pt-BR',
                'max_results' => 50,
            ])
            ->throw();

        $movies = $response->json();

        if (! is_array($movies)) {
            return [];
        }

        $movies = Arr::get($movies, 'results', $movies);

        if (! is_array($movies)) {
            return [];
        }

        return collect($movies)
            ->filter(fn (mixed $movie): bool => is_array($movie) && filled(Arr::get($movie, 'title')))
            ->take(50)
            ->map(function (array $movie): array {
                $title = (string) Arr::get($movie, 'title');
                $releaseDate = (string) Arr::get($movie, 'release_date');
                $posterUrl = Arr::get($movie, 'poster_url');

                return [
                    'id' => crc32("{$title}|{$releaseDate}"),
                    'title' => $title,
                    'originalTitle' => (string) Arr::get($movie, 'original_title', $title),
                    'releaseDate' => $this->formatReleaseDate($releaseDate),
                    'synopsis' => (string) Arr::get($movie, 'sinopsis', ''),
                    'genres' => [],
                    'posterUrl' => is_string($posterUrl) ? $posterUrl : null,
                ];
            })
            ->values()
            ->all();
    }

    private function formatReleaseDate(string $releaseDate): string
    {
        $releaseDate = trim($releaseDate);

        foreach (['d/m/Y', 'd-m-Y', 'Y-m-d'] as $format) {
            $date = DateTimeImmutable::createFromFormat("!{$format}", $releaseDate);

            if ($date !== false && $date->format($format) === $releaseDate) {
                return $date->format('d/m/Y');
            }
        }

        return $releaseDate;
    }
}
