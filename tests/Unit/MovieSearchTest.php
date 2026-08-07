<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config()->set('cache.default', 'array');
    config()->set('services.tmdb.base_url', 'https://api.themoviedb.org/3');
    config()->set('services.tmdb.image_url', 'https://image.tmdb.org/t/p');
    config()->set('services.tmdb.token', 'test-token');
    config()->set('services.tmdb.verify_tls', true);
    Cache::flush();
});

test('movies can be searched by title in Brazilian Portuguese', function () {
    Http::preventStrayRequests();
    Http::fake([
        'api.themoviedb.org/3/search/movie*' => Http::response([
            'page' => 1,
            'results' => [[
                'id' => 8844,
                'title' => 'Jumanji',
                'original_title' => 'Jumanji',
                'release_date' => '1995-12-15',
                'overview' => 'Duas crianças descobrem um jogo de tabuleiro mágico.',
                'poster_path' => '/jumanji.jpg',
            ]],
        ]),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertSuccessful()
        ->assertJsonPath('movies.0.id', 8844)
        ->assertJsonPath('movies.0.title', 'Jumanji')
        ->assertJsonPath('movies.0.originalTitle', 'Jumanji')
        ->assertJsonPath('movies.0.releaseDate', '15/12/1995')
        ->assertJsonPath('movies.0.synopsis', 'Duas crianças descobrem um jogo de tabuleiro mágico.')
        ->assertJsonPath('movies.0.posterUrl', route('movies.poster', ['movie' => 8844]))
        ->assertJsonPath('movies.0.genres', []);

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('Authorization', 'Bearer test-token')
        && str_contains($request->url(), '/search/movie?')
        && $request['query'] === 'jumanji'
        && $request['include_adult'] === false
        && $request['language'] === 'pt-BR'
        && $request['region'] === 'BR'
        && $request['page'] === 1);
    Http::assertSentCount(1);

    expect(Cache::get('tmdb.movie.8844.poster'))
        ->toBe('https://image.tmdb.org/t/p/w500/jumanji.jpg');
});

test('movie search responses are cached', function () {
    Http::preventStrayRequests();
    Http::fake([
        'api.themoviedb.org/3/search/movie*' => Http::response(['results' => []]),
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
        'api.themoviedb.org/3/*' => Http::response(status: 503),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertStatus(502)
        ->assertJsonPath('message', 'Não foi possível buscar os filmes agora.');
});
