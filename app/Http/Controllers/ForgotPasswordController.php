<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    // 1. Envia o e-mail com o token de recuperação
    public function enviarTokenRecuperacao(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Este endereço de e-mail não está cadastrado no sistema.'
        ]);

        $email = $request->email;

        // Gera um token aleatório de 6 caracteres (pode ser Str::random(60) para links)
        $token = Str::random(60);

        // Salva ou atualiza o token na tabela nativa do Laravel
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($token), // Salva o hash por segurança
                'created_at' => now()
            ]
        );

        // [OPCIONAL] Envio do e-mail real usando Mail do Laravel
        Mail::to($email)->send(new \App\Mail\ResetPasswordMailable($token));

        // Retorna o token no JSON apenas para você testar no ambiente de desenvolvimento
        return response()->json([
            'message' => 'As instruções de recuperação foram enviadas para o seu e-mail.',
            'dev_token' => $token // Remova esta linha quando colocar em produção!
        ], 200);
    }

    // 2. Valida o token e altera a senha do usuário
    public function redefinirSenha(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        // Busca o registro do token para o e-mail informado
        $registro = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        // Verifica se o token existe e se bate com o hash salvo
        if (!$registro || !Hash::check($request->token, $registro->token)) {
            return response()->json([
                'message' => 'O código ou token de recuperação é inválido.'
            ], 400);
        }

        // Verifica se o token expirou (ex: limite de 1 hora)
        if (now()->parse($registro->created_at)->addHours(1)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'message' => 'Este token de recuperação já expirou. Solicite um novo.'
            ], 400);
        }

        // Atualiza a senha do usuário
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Deleta o token utilizado para não permitir reuso
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Sua senha foi alterada com sucesso! Você já pode fazer login.'
        ], 200);
    }
}
