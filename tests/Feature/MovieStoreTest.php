<?php

use App\Models\Movie;
use App\Models\User;

test('an authenticated user can add a movie to their library', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson(route('movies.store'), [
            'title' => 'Jumanji',
            'originalTitle' => 'Jumanji',
            'releaseDate' => '15-12-1995',
            'synopsis' => 'Um jogo mágico transforma a vida de duas crianças.',
            'posterUrl' => 'https://image.example/jumanji.jpg',
        ])
        ->assertCreated()
        ->assertJsonPath('movie.title', 'Jumanji')
        ->assertJsonPath('movie.releaseDate', '15-12-1995');

    $movie = Movie::query()->sole();

    expect($movie->user_id)->toBe($user->id)
        ->and($movie->original_title)->toBe('Jumanji');
});

test('a movie cannot be added without authentication', function () {
    $this->postJson(route('movies.store'), [
        'title' => 'Jumanji',
        'originalTitle' => 'Jumanji',
    ])->assertUnauthorized();
});
