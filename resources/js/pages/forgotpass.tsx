import { Head } from '@inertiajs/react';
import Password from '@/components/password';
import logo from "@images/logo.png";
import { useState } from "react";

export default function ForgotPassword() {
    // Controle de etapas (1 = pedir email, 2 = definir nova senha)
    const [etapa, setEtapa] = useState(1);
    
    // Estados dos inputs
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    
    // Estados de feedback e carregamento
    const [mensagemSucesso, setMensagemSucesso] = useState(null);
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);

    // 1. Envia a solicitação de recuperação para o Laravel
    const lidarComSolicitacao = async (evento) => {
        evento.preventDefault();
        setErro(null);
        setCarregando(true);

        try {
            const resposta = await fetch('https://biblioteca-de-filmes.ddev.site/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR'
                },
                body: JSON.stringify({ email: email })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao solicitar recuperação.');
            }

            setMensagemSucesso(dados.message);
            setEtapa(2); // Avança para a tela de digitar o token e nova senha

        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    };

    // 2. Envia o token e a nova senha para atualizar no Laravel
    const lidarComRedefinicao = async (evento) => {
        evento.preventDefault();
        setErro(null);
        setCarregando(true);

        try {
            const resposta = await fetch('https://biblioteca-de-filmes.ddev.site/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR'
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    password: novaSenha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao redefinir senha.');
            }

            alert(dados.message); // "Sua senha foi alterada com sucesso!"
            
            // Redireciona o usuário para a tela de login do seu sistema
            window.location.href = '/login';

        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (

        <>

            <Head />
            
            <div class="page d-flex justify-content-center align-items-center">

                <div class="register-wrapper">

                    <header class="logo text-center">

                        <img
                            src={logo}
                            alt="Biblioteca de Filmes" />

                    </header>

                    <div className="register-box login-box forgot-box">
                        <div className="register-title">RECUPERAR ACESSO</div>

                        {/* Mensagem de sucesso global (ex: "Instruções enviadas por e-mail") */}
                        {mensagemSucesso && (
                            <div className="alert-success" style={{ display: 'block', color: 'green', marginBottom: '15px' }}>
                                {mensagemSucesso}
                            </div>
                        )}

                        {/* ETAPA 1: Formulário para solicitar o token */}
                        {etapa === 1 && (
                            <form onSubmit={lidarComSolicitacao}>
                                <p style={{ fontSize: '14px', marginBottom: '15px', color: '#FFF' }}>
                                    Insira seu e-mail cadastrado para receber o código de verificação.
                                </p>
                                
                                <div className="mb-3">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="form-control" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button className="btn btn-register" type="submit" disabled={carregando}>
                                    {carregando ? 'Buscando...' : 'Enviar Código'}
                                </button>
                            </form>
                        )}

                        {/* ETAPA 2: Formulário para digitar o token recebido e a nova senha */}
                        {etapa === 2 && (
                            <form onSubmit={lidarComRedefinicao}>
                                <div className="mb-3">
                                    <label>Código/Token de Recuperação</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="form-control" 
                                        placeholder="Insira o token recebido"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3 password">
                                    <label>Nova Senha (mínimo 8 caracteres)</label>
                                    <Password 
                                        value={novaSenha} 
                                        onChange={(e) => setNovaSenha(e.target.value)} 
                                    />
                                </div>

                                <button className="btn btn-register" type="submit" disabled={carregando}>
                                    {carregando ? 'Alterando...' : 'Salvar Nova Senha'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer' }}
                                    onClick={() => { setEtapa(1); setMensagemSucesso(null); }}
                                >
                                    ← Voltar e corrigir e-mail
                                </button>
                            </form>
                        )}

                        {/* Exibição dinâmica de erros vindos do Laravel */}
                        {erro && (
                            <div className="alert-error" style={{ display: 'block', marginTop: '15px' }}>
                                {erro}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        
        </>
    );
}
