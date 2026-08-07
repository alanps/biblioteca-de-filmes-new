<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\User as GoogleUser;

test('guests can be redirected to Google', function () {
    Socialite::fake('google');

    $this->get(route('google.redirect'))
        ->assertRedirect();
});

test('new users can register and authenticate with Google', function () {
    Socialite::fake('google', googleUser());

    $response = $this->get(route('google.callback'));

    $user = User::query()->where('email', 'cinefilo@example.com')->firstOrFail();

    expect($user->google_id)->toBe('google-123')
        ->and($user->email_verified_at)->not->toBeNull();
    $this->assertAuthenticatedAs($user);
    $response->assertRedirect(route('google.complete'))
        ->assertSessionHas('google_access_token');
});

test('existing users can link and authenticate with Google', function () {
    $user = User::factory()->unverified()->create([
        'email' => 'cinefilo@example.com',
    ]);
    Socialite::fake('google', googleUser());

    $this->get(route('google.callback'))
        ->assertRedirect(route('google.complete'))
        ->assertSessionHas('google_access_token');

    expect($user->refresh()->google_id)->toBe('google-123')
        ->and($user->email_verified_at)->not->toBeNull();
    $this->assertAuthenticatedAs($user);
});

test('authenticated users can complete Google login exactly once', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['google_access_token' => 'plain-text-token'])
        ->get(route('google.complete'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/google-complete')
            ->where('accessToken', 'plain-text-token'),
        )
        ->assertSessionMissing('google_access_token');

    $this->actingAs($user)
        ->get(route('google.complete'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');
});

test('a Google identity cannot replace a different linked identity', function () {
    $user = User::factory()->create([
        'email' => 'cinefilo@example.com',
        'google_id' => 'another-google-id',
    ]);
    Socialite::fake('google', googleUser());

    $this->get(route('google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    expect($user->refresh()->google_id)->toBe('another-google-id');
    $this->assertGuest();
});

test('an unverified Google email is rejected', function () {
    Socialite::fake('google', googleUser(['email_verified' => false]));

    $this->get(route('google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    $this->assertGuest();
    expect(User::query()->count())->toBe(0);
});

test('a denied Google grant returns to login', function () {
    $this->get(route('google.callback', ['error' => 'access_denied']))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    $this->assertGuest();
});

test('an expired Google state returns to login', function () {
    Socialite::fake('google', fn () => throw new InvalidStateException);

    $this->get(route('google.callback'))
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('google');

    $this->assertGuest();
});

/** @param array<string, mixed> $attributes */
function googleUser(array $attributes = []): GoogleUser
{
    return GoogleUser::fake(array_merge([
        'id' => 'google-123',
        'name' => 'Cinefilo Google',
        'email' => 'cinefilo@example.com',
        'email_verified' => true,
    ], $attributes));
}
