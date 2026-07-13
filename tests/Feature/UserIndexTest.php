<?php

use App\Models\User;

test('users are listed alphabetically for the dashboard modal', function () {
    $zuleica = User::factory()->create(['name' => 'Zuleica']);
    $amanda = User::factory()->create(['name' => 'Amanda']);

    $this->getJson(route('users.index'))
        ->assertSuccessful()
        ->assertExactJson([
            'users' => [
                ['id' => $amanda->id, 'name' => 'Amanda'],
                ['id' => $zuleica->id, 'name' => 'Zuleica'],
            ],
        ]);
});
