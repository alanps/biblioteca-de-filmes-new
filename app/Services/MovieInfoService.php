<?php

namespace App\Services;

use DateTimeImmutable;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Pool;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MovieInfoService
{
    /**
     * @return array<int, array{id: int, title: string, originalTitle: string, releaseDate: string, synopsis: string, genres: array<int, string>, posterUrl: string|null}>
     */
    public function search(string $title): array
    {
        $cacheKey = 'trakt.search.'.sha1(Str::lower(Str::squish($title)));

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
        $response = $this->request()
            ->get('/search/movie', [
                'query' => $title,
                'extended' => 'full',
                'page' => 1,
                'limit' => 50,
            ])
            ->throw();

        $results = $response->json();

        if (! is_array($results)) {
            return [];
        }

        $movies = [];

        foreach ($results as $result) {
            $movie = is_array($result) ? Arr::get($result, 'movie') : null;

            if (! is_array($movie)
                || ! is_int(Arr::get($movie, 'ids.trakt'))
                || blank(Arr::get($movie, 'title'))) {
                continue;
            }

            $movies[] = $movie;

            if (count($movies) === 50) {
                break;
            }
        }

        $translations = $this->translations($movies);

        return collect($movies)
            ->map(function (array $movie) use ($translations): array {
                $id = (int) Arr::get($movie, 'ids.trakt');
                $originalTitle = (string) Arr::get($movie, 'title');
                $translation = $translations[$id] ?? [];
                $translatedTitle = Arr::get($translation, 'title');
                $translatedSynopsis = Arr::get($translation, 'overview');

                return [
                    'id' => $id,
                    'title' => is_string($translatedTitle) && $translatedTitle !== '' ? $translatedTitle : $originalTitle,
                    'originalTitle' => $originalTitle,
                    'releaseDate' => $this->releaseDate($movie),
                    'synopsis' => is_string($translatedSynopsis) && $translatedSynopsis !== ''
                        ? $translatedSynopsis
                        : (string) Arr::get($movie, 'overview', ''),
                    'genres' => [],
                    'posterUrl' => $this->posterUrl($movie, $id),
                ];
            })
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $movies
     * @return array<int, array<string, mixed>>
     */
    private function translations(array $movies): array
    {
        $translations = [];
        $missingMovies = [];

        foreach ($movies as $movie) {
            $id = (int) Arr::get($movie, 'ids.trakt');
            $cachedTranslation = Cache::get($this->translationCacheKey($id));

            if (is_array($cachedTranslation)) {
                $translations[$id] = $cachedTranslation;

                continue;
            }

            $missingMovies[$id] = $movie;
        }

        if ($missingMovies === []) {
            return $translations;
        }

        $responses = Http::pool(function (Pool $pool) use ($missingMovies): array {
            $requests = [];

            foreach ($missingMovies as $id => $movie) {
                $identifier = Arr::get($movie, 'ids.slug', $id);
                $requests[] = $pool
                    ->as((string) $id)
                    ->acceptJson()
                    ->withOptions(['verify' => config('services.trakt.verify_tls')])
                    ->withHeaders($this->headers())
                    ->connectTimeout(3)
                    ->timeout(10)
                    ->get(config('services.trakt.base_url')."/movies/{$identifier}/translations/pt");
            }

            return $requests;
        }, concurrency: 10);

        foreach ($missingMovies as $id => $movie) {
            $response = $responses[(string) $id] ?? null;
            $translation = $response instanceof Response && $response->successful()
                ? $this->preferredTranslation($response)
                : [];

            Cache::put($this->translationCacheKey($id), $translation, now()->addDays(7));
            $translations[$id] = $translation;
        }

        return $translations;
    }

    /**
     * @return array<string, mixed>
     */
    private function preferredTranslation(Response $response): array
    {
        $translations = $response->json();

        if (! is_array($translations)) {
            return [];
        }

        $translation = collect($translations)
            ->filter(fn (mixed $item): bool => is_array($item))
            ->first(fn (array $item): bool => Str::lower((string) Arr::get($item, 'country')) === 'br')
            ?? collect($translations)->first(fn (mixed $item): bool => is_array($item));

        return is_array($translation) ? $translation : [];
    }

    /**
     * @param  array<string, mixed>  $movie
     */
    private function releaseDate(array $movie): string
    {
        $releaseDate = Arr::get($movie, 'released');

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
        $posterUrl = Arr::get($movie, 'images.poster.0');

        if (! is_string($posterUrl) || $posterUrl === '') {
            return null;
        }

        $posterUrl = Str::startsWith($posterUrl, ['http://', 'https://'])
            ? $posterUrl
            : "https://{$posterUrl}";

        Cache::put("trakt.movie.{$id}.poster", $posterUrl, now()->addYear());

        return route('movies.poster', ['movie' => $id]);
    }

    private function request(): PendingRequest
    {
        return Http::baseUrl(config('services.trakt.base_url'))
            ->acceptJson()
            ->withOptions(['verify' => config('services.trakt.verify_tls')])
            ->withHeaders($this->headers())
            ->connectTimeout(3)
            ->timeout(10);
    }

    /**
     * @return array<string, mixed>
     */
    private function headers(): array
    {
        return [
            'Content-Type' => 'application/json',
            'trakt-api-key' => config('services.trakt.client_id'),
            'trakt-api-version' => config('services.trakt.api_version'),
        ];
    }

    private function translationCacheKey(int $id): string
    {
        return "trakt.movie.{$id}.translation.pt";
    }
}
