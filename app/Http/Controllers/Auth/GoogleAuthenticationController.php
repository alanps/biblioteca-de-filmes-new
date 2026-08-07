<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\AbstractUser;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleAuthenticationController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        if ($request->filled('error')) {
            return $this->redirectToLoginWithError('Login com Google cancelado.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
            $user = $this->findOrCreateUser($googleUser);
        } catch (InvalidStateException) {
            return $this->redirectToLoginWithError('Sua sessão com o Google expirou. Tente novamente.');
        } catch (ValidationException $exception) {
            return redirect()->route('login')->withErrors($exception->errors());
        }

        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put(
            'google_access_token',
            $user->createToken('auth_token')->plainTextToken,
        );

        return redirect()->route('google.complete');
    }

    public function complete(Request $request): Response|RedirectResponse
    {
        $accessToken = $request->session()->pull('google_access_token');

        if (! is_string($accessToken) || blank($accessToken)) {
            return $this->redirectToLoginWithError('Não foi possível concluir o login com Google. Tente novamente.');
        }

        return Inertia::render('auth/google-complete', [
            'accessToken' => $accessToken,
        ]);
    }

    private function findOrCreateUser(SocialiteUser $googleUser): User
    {
        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();

        if (blank($googleId) || blank($email) || ! $this->hasVerifiedEmail($googleUser)) {
            throw ValidationException::withMessages([
                'google' => 'Não foi possível confirmar seu e-mail da conta Google.',
            ]);
        }

        return DB::transaction(function () use ($googleUser, $googleId, $email): User {
            $user = User::query()->where('google_id', $googleId)->first();

            if ($user !== null) {
                return $user;
            }

            $user = User::query()->where('email', $email)->first();

            if ($user !== null && $user->google_id !== null) {
                throw ValidationException::withMessages([
                    'google' => 'Este e-mail já está vinculado a outra conta Google.',
                ]);
            }

            if ($user === null) {
                $user = User::query()->create([
                    'name' => $googleUser->getName() ?: Str::before($email, '@'),
                    'email' => $email,
                    'password' => Str::random(64),
                    'email_verified_at' => Carbon::now(),
                ]);
            } elseif ($user->email_verified_at === null) {
                $user->email_verified_at = Carbon::now();
            }

            $user->google_id = $googleId;
            $user->save();

            return $user;
        });
    }

    private function hasVerifiedEmail(SocialiteUser $googleUser): bool
    {
        return $googleUser instanceof AbstractUser
            && data_get($googleUser->getRaw(), 'email_verified') === true;
    }

    private function redirectToLoginWithError(string $message): RedirectResponse
    {
        return redirect()->route('login')->withErrors(['google' => $message]);
    }
}
