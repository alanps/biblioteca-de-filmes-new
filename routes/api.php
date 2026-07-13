<?php

use App\Http\Controllers\ForgotPasswordController;
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
