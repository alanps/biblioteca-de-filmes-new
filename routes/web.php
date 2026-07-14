<?php

use App\Http\Controllers\MovieSearchController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingPage')->name('home');
Route::inertia('/login', 'auth/login')->name('login');
Route::inertia('/forgotpass', 'forgotpass')->name('forgotpass');
Route::get('/movies/search', MovieSearchController::class)
    ->middleware('throttle:30,1')
    ->name('movies.search');

// Route::middleware(['auth', 'verified'])->group(function () {
Route::inertia('/dashboard', 'dashboard')->name('dashboard');
// });

require __DIR__.'/settings.php';
