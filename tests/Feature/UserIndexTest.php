<?php

use App\Models\User;

test('users are listed alphabetically for the dashboard modal', function () {
    $admin = User::factory()->create(['id' => 1, 'name' => 'Administrador']);
    $zuleica = User::factory()->create(['id' => 3, 'name' => 'Zuleica']);
    $amanda = User::factory()->create(['id' => 4, 'name' => 'Amanda']);
    $token = $admin->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->getJson(route('users.index'))
        ->assertSuccessful()
        ->assertExactJson([
            'users' => [
                ['id' => $admin->id, 'name' => 'Administrador'],
                ['id' => $amanda->id, 'name' => 'Amanda'],
                ['id' => $zuleica->id, 'name' => 'Zuleica'],
            ],
        ]);
});

test('users other than ids one and two cannot list users', function () {
    $user = User::factory()->create(['id' => 3]);
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->getJson(route('users.index'))
        ->assertForbidden();
});

test('user id two can list users', function () {
    $user = User::factory()->create(['id' => 2]);
    $token = $user->createToken('dashboard');

    $this->withToken($token->plainTextToken)
        ->getJson(route('users.index'))
        ->assertSuccessful();
});
