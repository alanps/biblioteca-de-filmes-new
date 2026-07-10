<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\ForgotPasswordController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'enviarTokenRecuperacao']);
Route::post('/reset-password', [ForgotPasswordController::class, 'redefinirSenha']);
