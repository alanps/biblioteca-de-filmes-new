<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config()->set('cache.default', 'array');
    config()->set('services.omdb.verify_tls', true);
    Cache::flush();
    Storage::fake('local');
});

test('OMDb posters are downloaded once and served from local storage', function () {
    $posterUrl = 'https://m.media-amazon.com/images/M/jumanji.jpg';

    Cache::put('omdb.movie.1267.poster', $posterUrl, now()->addYear());
    Http::preventStrayRequests();
    Http::fake([
        $posterUrl => Http::response('webp-image', 200, ['Content-Type' => 'image/webp']),
    ]);

    $this->get(route('movies.poster', ['movie' => 1267]))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'image/webp')
        ->assertContent('webp-image');

    Storage::disk('local')->assertExists('movie-posters/1267.webp');

    $this->get(route('movies.poster', ['movie' => 1267]))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'image/webp')
        ->assertStreamedContent('webp-image');

    Http::assertSentCount(1);
});

test('poster proxy rejects URLs outside OMDb poster hosts', function () {
    Cache::put('omdb.movie.1267.poster', 'https://example.com/poster.webp', now()->addYear());
    Http::preventStrayRequests();

    $this->get(route('movies.poster', ['movie' => 1267]))->assertNotFound();

    Http::assertNothingSent();
});
