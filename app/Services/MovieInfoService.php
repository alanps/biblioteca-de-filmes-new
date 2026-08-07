<?php

namespace App\Services;

use DateTimeImmutable;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MovieInfoService
{
    /**
     * @return array<int, array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}>
     */
    public function search(string $title): array
    {
        $cacheKey = 'tmdb.search.'.sha1(Str::lower(Str::squish($title)));

        return Cache::remember(
            $cacheKey,
            now()->addMinutes(15),
            fn (): array => $this->searchProvider($title),
        );
    }

    /**
     * @return array<int, array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}>
     */
    private function searchProvider(string $title): array
    {
        $results = $this->request()
            ->get('/search/movie', [
                'query' => $title,
                'include_adult' => false,
                'language' => 'pt-BR',
                'region' => 'BR',
                'page' => 1,
            ])
            ->throw()
            ->json('results');

        if (! is_array($results)) {
            return [];
        }

        return collect($results)
            ->filter(fn (mixed $movie): bool => is_array($movie)
                && is_int(Arr::get($movie, 'id'))
                && filled(Arr::get($movie, 'title')))
            ->take(50)
            ->map(function (array $movie): array {
                $id = (int) Arr::get($movie, 'id');

                return [
                    'id' => $id,
                    'title' => (string) Arr::get($movie, 'title'),
                    'originalTitle' => (string) Arr::get($movie, 'original_title', Arr::get($movie, 'title', '')),
                    'releaseDate' => $this->releaseDate($movie),
                    'synopsis' => (string) Arr::get($movie, 'overview', ''),
                    'genres' => [],
                    'posterUrl' => $this->posterUrl($movie, $id),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function releaseDate(array $movie): string
    {
        $releaseDate = Arr::get($movie, 'release_date');

        if (! is_string($releaseDate)) {
            return '';
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $releaseDate);

        return $date !== false && $date->format('Y-m-d') === $releaseDate
            ? $date->format('d/m/Y')
            : '';
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function posterUrl(array $movie, int $id): ?string
    {
        $posterPath = Arr::get($movie, 'poster_path');

        if (! is_string($posterPath) || $posterPath === '') {
            return null;
        }

        $posterUrl = rtrim((string) config('services.tmdb.image_url'), '/').'/w500/'.ltrim($posterPath, '/');

        Cache::put("tmdb.movie.{$id}.poster", $posterUrl, now()->addYear());

        return route('movies.poster', ['movie' => $id]);
    }

    private function request(): PendingRequest
    {
        $token = config('services.tmdb.token');

        if (! is_string($token) || $token === '') {
            throw new RuntimeException('TMDB_API_TOKEN is not configured.');
        }

        return Http::baseUrl(config('services.tmdb.base_url'))
            ->acceptJson()
            ->withToken($token)
            ->withOptions(['verify' => config('services.tmdb.verify_tls')])
            ->connectTimeout(3)
            ->timeout(10)
            ->retry(2, 200, throw: false);
    }
}
