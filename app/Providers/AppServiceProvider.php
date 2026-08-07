<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('view-users', fn (User $user): bool => in_array($user->id, [1, 2], true));

        RateLimiter::for('google-oauth-redirect', fn (Request $request): Limit => Limit::perMinute(20)
            ->by('google-oauth-redirect|'.$request->ip()));
        RateLimiter::for('google-oauth-callback', fn (Request $request): Limit => Limit::perMinute(30)
            ->by('google-oauth-callback|'.$request->ip()));
        RateLimiter::for('google-oauth-complete', fn (Request $request): Limit => Limit::perMinute(30)
            ->by('google-oauth-complete|'.$request->user()->getAuthIdentifier()));

        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
