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
        $cacheKey = 'omdb.search.'.sha1(Str::lower(Str::squish($title)));

        return Cache::remember(
            $cacheKey,
            now()->addMinutes(15),
            fn (): array => $this->searchProvider($title),
        );
    }

    /**
     * @return array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}
     */
    public function details(int $id): array
    {
        return Cache::remember(
            "omdb.movie.{$id}.details",
            now()->addDays(7),
            fn (): array => $this->detailsProvider($id),
        );
    }

    /**
     * @return array<int, array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}>
     */
    private function searchProvider(string $title): array
    {
        $response = $this->request()
            ->get('/', [
                's' => $title,
                'type' => 'movie',
                'page' => 1,
            ])
            ->throw();

        if ($response->json('Response') === 'False') {
            return [];
        }

        $results = $response->json('Search');

        if (! is_array($results)) {
            return [];
        }

        return collect($results)
            ->filter(fn (mixed $movie): bool => is_array($movie)
                && $this->movieId($movie) !== null
                && filled(Arr::get($movie, 'Title')))
            ->map(function (array $movie): array {
                $id = $this->movieId($movie);

                if ($id === null) {
                    throw new RuntimeException('OMDb returned an invalid IMDb identifier.');
                }

                $title = (string) Arr::get($movie, 'Title');

                return [
                    'id' => $id,
                    'title' => $title,
                    'originalTitle' => $title,
                    'releaseDate' => '',
                    'synopsis' => '',
                    'genres' => [],
                    'posterUrl' => $this->posterUrl($movie, $id),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}
     */
    private function detailsProvider(int $id): array
    {
        $movie = $this->request()
            ->get('/', [
                'i' => 'tt'.str_pad((string) $id, 7, '0', STR_PAD_LEFT),
                'plot' => 'full',
            ])
            ->throw()
            ->json();

        if (! is_array($movie) || Arr::get($movie, 'Response') === 'False') {
            throw new RuntimeException('Movie details were not found on OMDb.');
        }

        $title = (string) Arr::get($movie, 'Title', '');
        $plot = Arr::get($movie, 'Plot');
        $genres = Arr::get($movie, 'Genre');

        return [
            'id' => $id,
            'title' => $title,
            'originalTitle' => $title,
            'releaseDate' => $this->releaseDate($movie),
            'synopsis' => is_string($plot) && $plot !== 'N/A' ? $plot : '',
            'genres' => is_string($genres) && $genres !== 'N/A'
                ? array_values(array_filter(array_map('trim', explode(',', $genres))))
                : [],
            'posterUrl' => $this->posterUrl($movie, $id),
        ];
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function releaseDate(array $movie): string
    {
        $releaseDate = Arr::get($movie, 'Released');

        if (! is_string($releaseDate) || $releaseDate === 'N/A') {
            return '';
        }

        $date = DateTimeImmutable::createFromFormat('!d M Y', $releaseDate);

        return $date !== false ? $date->format('d/m/Y') : '';
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function movieId(array $movie): ?int
    {
        $imdbId = Arr::get($movie, 'imdbID');

        if (! is_string($imdbId) || preg_match('/^tt(\d+)$/', $imdbId, $matches) !== 1) {
            return null;
        }

        return (int) $matches[1];
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function posterUrl(array $movie, int $id): ?string
    {
        $posterUrl = Arr::get($movie, 'Poster');

        if (! is_string($posterUrl) || $posterUrl === '' || $posterUrl === 'N/A') {
            return null;
        }

        Cache::put("omdb.movie.{$id}.poster", $posterUrl, now()->addYear());

        return route('movies.poster', ['movie' => $id]);
    }

    private function request(): PendingRequest
    {
        $apiKey = config('services.omdb.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('OMDB_API_KEY is not configured.');
        }

        return Http::baseUrl(config('services.omdb.base_url'))
            ->acceptJson()
            ->withQueryParameters(['apikey' => $apiKey])
            ->withOptions(['verify' => config('services.omdb.verify_tls')])
            ->connectTimeout(3)
            ->timeout(10)
            ->retry(2, 200, throw: false);
    }
}
