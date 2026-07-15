<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config()->set('cache.default', 'array');
    config()->set('services.trakt.base_url', 'https://api.trakt.tv');
    config()->set('services.trakt.client_id', 'test-client-id');
    config()->set('services.trakt.api_version', 2);
    config()->set('services.trakt.verify_tls', true);
    Cache::flush();
});

test('movies can be searched by title with Brazilian Portuguese translations', function () {
    Http::preventStrayRequests();
    Http::fake(function (Request $request) {
        if (str_contains($request->url(), '/search/movie')) {
            return Http::response([[
                'type' => 'movie',
                'score' => 1000,
                'movie' => [
                    'title' => 'Jumanji',
                    'year' => 1995,
                    'released' => '1995-12-15',
                    'overview' => 'Two children discover a magical board game.',
                    'ids' => [
                        'trakt' => 1267,
                        'slug' => 'jumanji-1995',
                        'imdb' => 'tt0113497',
                        'tmdb' => 8844,
                    ],
                    'images' => [
                        'poster' => [
                            'walter-r2.trakt.tv/images/movies/000/001/267/posters/thumb/jumanji.webp',
                        ],
                    ],
                ],
            ]]);
        }

        if (str_contains($request->url(), '/movies/jumanji-1995/translations/pt')) {
            return Http::response([
                [
                    'title' => 'Jumanji',
                    'overview' => 'Duas crianças descobrem um jogo de tabuleiro mágico.',
                    'tagline' => 'Um jogo para aqueles que procuram encontrar uma saída.',
                    'language' => 'pt',
                    'country' => 'br',
                ],
            ]);
        }

        return Http::response(status: 404);
    });

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertSuccessful()
        ->assertJsonPath('movies.0.id', 1267)
        ->assertJsonPath('movies.0.title', 'Jumanji')
        ->assertJsonPath('movies.0.originalTitle', 'Jumanji')
        ->assertJsonPath('movies.0.releaseDate', '15/12/1995')
        ->assertJsonPath('movies.0.synopsis', 'Duas crianças descobrem um jogo de tabuleiro mágico.')
        ->assertJsonPath('movies.0.posterUrl', route('movies.poster', ['movie' => 1267]))
        ->assertJsonPath('movies.0.genres', []);

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('trakt-api-key', 'test-client-id')
        && $request->hasHeader('trakt-api-version', '2')
        && str_contains($request->url(), '/search/movie?')
        && $request['query'] === 'jumanji'
        && $request['extended'] === 'full'
        && $request['page'] === 1
        && $request['limit'] === 50);

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('trakt-api-key', 'test-client-id')
        && $request->hasHeader('trakt-api-version', '2')
        && str_contains($request->url(), '/movies/jumanji-1995/translations/pt'));
    Http::assertSentCount(2);
});

test('movie search responses are cached', function () {
    Http::preventStrayRequests();
    Http::fake([
        'api.trakt.tv/search/movie*' => Http::response([]),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))->assertSuccessful();
    $this->getJson(route('movies.search', ['title' => 'JUMANJI']))->assertSuccessful();

    Http::assertSentCount(1);
});

test('movie search requires at least three characters', function () {
    Http::preventStrayRequests();

    $this->getJson(route('movies.search', ['title' => 'ju']))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('title');
});

test('movie search handles provider failures', function () {
    Exceptions::fake();
    Http::preventStrayRequests();
    Http::fake([
        'api.trakt.tv/*' => Http::response(status: 503),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertStatus(502)
        ->assertJsonPath('message', 'Não foi possível buscar os filmes agora.');
});
