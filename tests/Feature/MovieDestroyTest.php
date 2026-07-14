<?php

use App\Models\Movie;
use App\Models\User;

test('an authenticated user can remove a movie from their library', function () {
    $user = User::factory()->create();
    $movie = Movie::factory()->for($user)->create();
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->deleteJson(route('movies.destroy', $movie))
        ->assertNoContent();

    $this->assertModelMissing($movie);
});

test('a user cannot remove another users movie', function () {
    $user = User::factory()->create();
    $movie = Movie::factory()->for(User::factory())->create();
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->deleteJson(route('movies.destroy', $movie))
        ->assertNotFound();

    $this->assertModelExists($movie);
});

test('movie removal requires authentication', function () {
    $movie = Movie::factory()->create();

    $this->deleteJson(route('movies.destroy', $movie))->assertUnauthorized();
});
