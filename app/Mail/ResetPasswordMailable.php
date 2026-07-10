<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Vite;

class ResetPasswordMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $token; // Variável que armazenará o token

    // Recebe o token enviado pelo Controller
    public function __construct($token)
    {
        $this->token = $token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Código de Recuperação de Senha',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "<img src='".Vite::asset('resources/images/logo.png')."'><br><h3>Seu código de recuperação é:</h3><h2><strong>{$this->token}</strong></h2><p>Use este código na tela do sistema para redefinir sua senha.</p>",
        );
    }

}
