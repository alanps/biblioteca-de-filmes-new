import logo from "@images/logo.png";
import google from "@images/google.svg";
import RegisterBox from '@/components/register-box';
import Password from '@/components/password';
import { useState } from "react";

export default function LoginBox() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const lidarComLogin = async (evento) => {
        evento.preventDefault();
        setErro(null);
        setCarregando(true);

        try {
            const resposta = await fetch('https://biblioteca-de-filmes.ddev.site/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR' // Força a resposta em português se houver erro de validação
                },
                body: JSON.stringify({
                    email: email,
                    password: senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao fazer login.');
            }

            
            localStorage.setItem('TOKEN_API', dados.access_token);

            setErro(null);
            
            window.location.href = '/listagem';

        } catch (error) {
            setErro(error.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        
        <div className="login-wrapper">

            <header className="logo text-center">

                <img
                    src={logo}
                    alt="Biblioteca de Filmes" />

            </header>

            <div className="login-box">

                <div className="login-title">

                    FAÇA LOGIN

                    <span></span>

                    <span></span>

                </div>

                <form onSubmit={lidarComLogin}>

                    <div className="mb-3">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-control" />

                    </div>

                    <div className="mb-3 password">

                        <label>Senha</label>

                        <Password 
                            value={senha} 
                            onChange={(e) => {
                                setSenha(e.target.value);
                            }} 
                        />

                    </div>

                    <div className="login-buttons">

                        <button
                            type="submit"
                            className="btn btn-login">

                            Entrar

                        </button>

                        <a href="/forgotpass">

                            Esqueceu a senha?

                        </a>

                    </div>

                    {erro && (
                        <div classNameName="alert-error" style={{ display: 'block' }}>
                            {erro}
                        </div>
                    )}

                    <small>

                        Outras opções de login

                    </small>

                    <button
                        className="btn-google"
                        type="button">

                        <img
                            src={google}
                            alt="Google" />

                        Fazer login com Google

                    </button>

                </form>

            </div>

            <RegisterBox />

        </div>

    );
}
