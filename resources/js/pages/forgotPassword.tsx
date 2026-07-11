import { Head } from '@inertiajs/react';
import Password from '@/components/password';
import logo from "@images/logo.png";
import { useState } from "react";

export default function ForgotPassword() {
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetRequest = async (event) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch('https://biblioteca-de-filmes.ddev.site/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao solicitar recuperação.');
            }

            setSuccessMessage(data.message);
            setStep(2);

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Não foi possível solicitar a recuperação.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (event) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch('https://biblioteca-de-filmes.ddev.site/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR'
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    password: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao redefinir senha.');
            }

            alert(data.message);

            window.location.href = '/login';

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Não foi possível redefinir a senha.');
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <>

            <Head />
            
            <div class="page d-flex justify-content-center align-items-center">

                <div class="registerWrapper">

                    <header class="logo text-center">

                        <img
                            src={logo}
                            alt="Biblioteca de Filmes" />

                    </header>

                    <div className="registerBox loginBox forgotBox">
                        <div className="registerTitle">RECUPERAR ACESSO</div>

                        {successMessage && (
                            <div className="alertSuccess" style={{ display: 'block', color: 'green', marginBottom: '15px' }}>
                                {successMessage}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleResetRequest}>
                                <p style={{ fontSize: '14px', marginBottom: '15px', color: '#FFF' }}>
                                    Insira seu eMail cadastrado para receber o código de verificação.
                                </p>
                                
                                <div className="mb-3">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="formControl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button className="btn btnRegister" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Buscando...' : 'Enviar Código'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handlePasswordReset}>
                                <div className="mb-3">
                                    <label>Código/Token de Recuperação</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="formControl"
                                        placeholder="Insira o token recebido"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                    />
                                </div>

                                <div className="mb-3 password">
                                    <label>Nova Senha (mínimo 8 caracteres)</label>
                                    <Password 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                    />
                                </div>

                                <button className="btn btnRegister" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Alterando...' : 'Salvar Nova Senha'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    style={{ background: 'none', border: 'none', color: '#666', marginTop: '10px', cursor: 'pointer' }}
                                    onClick={() => { setStep(1); setSuccessMessage(null); }}
                                >
                                    ← Voltar e corrigir eMail
                                </button>
                            </form>
                        )}

                        {errorMessage && (
                            <div className="alertError" style={{ display: 'block', marginTop: '15px' }}>
                                {errorMessage}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        
        </>
    );
}
