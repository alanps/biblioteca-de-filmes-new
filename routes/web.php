<?php

use App\Http\Controllers\MovieSearchController;
use App\Http\Controllers\UserIndexController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingPage')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/forgotpass', 'forgotpass')->name('forgotpass');
Route::get('/movies/search', MovieSearchController::class)
    ->middleware('throttle:30,1')
    ->name('movies.search');
Route::get('/users', UserIndexController::class)
    ->middleware('throttle:60,1')
    ->name('users.index');

// Route::middleware(['auth', 'verified'])->group(function () {
Route::inertia('/dashboard', 'dashboard')->name('dashboard');
// });

require __DIR__.'/settings.php';
