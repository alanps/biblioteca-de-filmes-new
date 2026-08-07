<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config()->set('cache.default', 'array');
    config()->set('services.omdb.base_url', 'https://www.omdbapi.com');
    config()->set('services.omdb.api_key', 'test-key');
    config()->set('services.omdb.verify_tls', true);
    Cache::flush();
});

test('movies can be searched by title', function () {
    Http::preventStrayRequests();
    Http::fake([
        'www.omdbapi.com/*' => Http::response([
            'Search' => [[
                'Title' => 'Jumanji',
                'Year' => '1995',
                'imdbID' => 'tt0113497',
                'Type' => 'movie',
                'Poster' => 'https://m.media-amazon.com/images/M/jumanji.jpg',
            ]],
            'totalResults' => '1',
            'Response' => 'True',
        ]),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertSuccessful()
        ->assertJsonPath('movies.0.id', 113497)
        ->assertJsonPath('movies.0.title', 'Jumanji')
        ->assertJsonPath('movies.0.originalTitle', 'Jumanji')
        ->assertJsonPath('movies.0.releaseDate', '')
        ->assertJsonPath('movies.0.synopsis', '')
        ->assertJsonPath('movies.0.posterUrl', route('movies.poster', ['movie' => 113497]))
        ->assertJsonPath('movies.0.genres', []);

    Http::assertSent(fn (Request $request): bool => str_contains($request->url(), 'apikey=test-key')
        && $request['s'] === 'jumanji'
        && $request['type'] === 'movie'
        && $request['page'] === 1);
    Http::assertSentCount(1);

    expect(Cache::get('omdb.movie.113497.poster'))
        ->toBe('https://m.media-amazon.com/images/M/jumanji.jpg');
});

test('movie search responses are cached', function () {
    Http::preventStrayRequests();
    Http::fake([
        'www.omdbapi.com/*' => Http::response(['Response' => 'False', 'Error' => 'Movie not found!']),
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
        'www.omdbapi.com/*' => Http::response(status: 503),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertStatus(502)
        ->assertJsonPath('message', 'Não foi possível buscar os filmes agora.');
});
