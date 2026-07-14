<?php

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

test('movies can be searched by title', function () {
    config()->set('services.movie_info.base_url', 'https://movie-info-api.p.rapidapi.com');
    config()->set('services.movie_info.host', 'movie-info-api.p.rapidapi.com');
    config()->set('services.movie_info.key', 'test-key');
    config()->set('services.movie_info.verify_tls', true);

    Http::preventStrayRequests();
    Http::fake([
        'movie-info-api.p.rapidapi.com/*' => Http::response([
            [
                'title' => 'Jumanji',
                'original_title' => 'Jumanji',
                'sinopsis' => 'Um jogo mágico transforma a vida de duas crianças.',
                'release_date' => '15-12-1995',
                'poster_url' => 'https://image.example/jumanji.jpg',
            ],
        ]),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertSuccessful()
        ->assertJsonPath('movies.0.title', 'Jumanji')
        ->assertJsonPath('movies.0.originalTitle', 'Jumanji')
        ->assertJsonPath('movies.0.releaseDate', '15/12/1995')
        ->assertJsonPath('movies.0.synopsis', 'Um jogo mágico transforma a vida de duas crianças.')
        ->assertJsonPath('movies.0.posterUrl', 'https://image.example/jumanji.jpg')
        ->assertJsonPath('movies.0.genres', []);

    Http::assertSent(fn (Request $request): bool => $request->hasHeader('X-RapidAPI-Key', 'test-key')
        && $request['title'] === 'jumanji'
        && $request['lang'] === 'pt-BR'
        && $request['max_results'] === 50);
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
        'movie-info-api.p.rapidapi.com/*' => Http::response(status: 503),
    ]);

    $this->getJson(route('movies.search', ['title' => 'jumanji']))
        ->assertStatus(502)
        ->assertJsonPath('message', 'Não foi possível buscar os filmes agora.');
});
