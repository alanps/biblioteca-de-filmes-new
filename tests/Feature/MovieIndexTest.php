<?php

use App\Models\Movie;
use App\Models\User;

test('only the authenticated users movies are listed with newest first', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $token = $user->createToken('dashboard');

    Movie::factory()->for($user)->create([
        'title' => 'Filme antigo',
        'created_at' => now()->subMinute(),
    ]);
    Movie::factory()->for($user)->create([
        'title' => 'Filme recente',
        'created_at' => now(),
    ]);
    Movie::factory()->for($otherUser)->create([
        'title' => 'Filme de outro usuário',
    ]);

    $this->withToken($token->plainTextToken)
        ->getJson(route('movies.index'))
        ->assertSuccessful()
        ->assertJsonCount(2, 'movies')
        ->assertJsonPath('movies.0.title', 'Filme recente')
        ->assertJsonPath('movies.1.title', 'Filme antigo')
        ->assertJsonMissing(['title' => 'Filme de outro usuário']);
});

test('movie listing requires authentication', function () {
    $this->getJson(route('movies.index'))->assertUnauthorized();
});
