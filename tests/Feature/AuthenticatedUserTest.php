<?php

use App\Models\User;

test('the authenticated user name is returned for the dashboard menu', function () {
    $user = User::factory()->create(['name' => 'Alan Pardini']);
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->getJson(route('session.user'))
        ->assertSuccessful()
        ->assertExactJson([
            'user' => [
                'id' => $user->id,
                'name' => 'Alan Pardini',
            ],
        ]);
});

test('logout revokes the token used by the dashboard', function () {
    $user = User::factory()->create();
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->deleteJson(route('session.destroy'))
        ->assertNoContent();

    $this->assertModelMissing($token->accessToken);
});

test('dashboard authentication endpoints reject guests', function (string $routeName, string $method) {
    $this->json($method, route($routeName))->assertUnauthorized();
})->with([
    ['session.user', 'GET'],
    ['session.destroy', 'DELETE'],
]);
