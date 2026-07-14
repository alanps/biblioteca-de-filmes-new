import logo from "@images/logo.png";
import google from "@images/google.svg";
import RegisterBox from '@/components/registerBox';
import Password from '@/components/password';
import { dashboard } from '@/routes';
import { useState } from "react";

export default function LoginBox() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage(null);
        setIsLoading(true);

        try {
            const response = await fetch('https://biblioteca-de-filmes.ddev.site/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Language': 'pt-BR'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login.');
            }

            
            localStorage.setItem('TOKEN_API', data.access_token);

            setErrorMessage(null);
            
            window.location.href = dashboard.url();

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Não foi possível fazer login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        
        <div className="loginWrapper">

            <header className="logo text-center">

                <img
                    src={logo}
                    alt="Biblioteca de Filmes" />

            </header>

            <div className="loginBox">

                <div className="loginTitle">

                    FAÇA LOGIN

                    <span></span>

                    <span></span>

                </div>

                <form onSubmit={handleLogin}>

                    <div className="mb-3">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="formControl" />

                    </div>

                    <div className="mb-3 password">

                        <label>Senha</label>

                        <Password 
                            value={password} 
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }} 
                        />

                    </div>

                    <div className="loginButtons">

                        <button
                            type="submit"
                            className="btn btnLogin">

                            Entrar

                        </button>

                        <a href="/forgotpass">

                            Esqueceu a password?

                        </a>

                    </div>

                    {errorMessage && (
                        <div className="alertError" style={{ display: 'block' }}>
                            {errorMessage}
                        </div>
                    )}

                    <small>

                        Outras opções de login

                    </small>

                    <button
                        className="btnGoogle"
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
