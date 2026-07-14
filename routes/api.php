<?php

use App\Http\Controllers\AuthenticatedUserController;
use App\Http\Controllers\ForgotPasswordController;
use App\Http\Controllers\MovieDestroyController;
use App\Http\Controllers\MovieIndexController;
use App\Http\Controllers\MovieStoreController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'enviarTokenRecuperacao']);
Route::post('/reset-password', [ForgotPasswordController::class, 'redefinirSenha']);
Route::post('/movies', MovieStoreController::class)
    ->middleware('auth:sanctum')
    ->name('movies.store');
Route::get('/movies', MovieIndexController::class)
    ->middleware(['auth:sanctum', 'throttle:60,1'])
    ->name('movies.index');
Route::delete('/movies/{movie}', MovieDestroyController::class)
    ->middleware(['auth:sanctum', 'throttle:60,1'])
    ->name('movies.destroy');
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    Route::get('/user', [AuthenticatedUserController::class, 'show'])->name('session.user');
    Route::delete('/logout', [AuthenticatedUserController::class, 'destroy'])->name('session.destroy');
});
