<?php

use App\Http\Controllers\Auth\GoogleAuthenticationController;
use App\Http\Controllers\MovieDetailsController;
use App\Http\Controllers\MoviePosterController;
use App\Http\Controllers\MovieSearchController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingPage')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/forgotpass', 'forgotPassword')->name('forgotpass');
Route::get('/auth/google/redirect', [GoogleAuthenticationController::class, 'redirect'])
    ->middleware('throttle:google-oauth-redirect')
    ->name('google.redirect');
Route::get('/auth/google/callback', [GoogleAuthenticationController::class, 'callback'])
    ->middleware('throttle:google-oauth-callback')
    ->name('google.callback');
Route::get('/auth/google/complete', [GoogleAuthenticationController::class, 'complete'])
    ->middleware(['auth', 'throttle:google-oauth-complete'])
    ->name('google.complete');
Route::get('/movies/search', MovieSearchController::class)
    ->middleware('throttle:30,1')
    ->name('movies.search');
Route::get('/movies/{movie}/details', MovieDetailsController::class)
    ->whereNumber('movie')
    ->middleware('throttle:60,1')
    ->name('movies.details');
Route::get('/movies/posters/{movie}', MoviePosterController::class)
    ->whereNumber('movie')
    ->middleware('throttle:120,1')
    ->name('movies.poster');

// Route::middleware(['auth', 'verified'])->group(function () {
Route::inertia('/dashboard', 'dashboard')->name('dashboard');
// });

require __DIR__.'/settings.php';
