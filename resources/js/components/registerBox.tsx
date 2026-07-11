import google from "@images/google.svg";
import Password from '@/components/password';
import { useState, useRef } from "react";

export default function RegisterBox() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const confirmPasswordRef = useRef(null);
    
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRegistration = async (event) => {
        event.preventDefault();
        const confirmPasswordInput = confirmPasswordRef.current;

        if (password !== confirmPassword) {
            confirmPasswordInput.setCustomValidity("As passwords não coincidem!");
            confirmPasswordInput.reportValidity();
            return;
        }

        confirmPasswordInput.setCustomValidity("");

        setIsLoading(true);

        try {
            const response = await fetch('https://biblioteca-de-filmes.ddev.site/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao cadastrar.');
            }

            localStorage.setItem('TOKEN_API', data.access_token);

            setErrorMessage(null);
            
            window.location.href = '/listagem';

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Não foi possível cadastrar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
    
        <div className="registerBox">

            <div className="registerTitle">

                CADASTRAR NOVO USUÁRIO

            </div>

            <form onSubmit={handleRegistration}>

                <div className="mb-3">

                    <label>Nome</label>

                    <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="formControl" />

                </div>

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

                    <label>Senha (mínimo 8 caracteres)</label>

                        <Password 
                            value={password} 
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (confirmPasswordRef.current) {
                                    confirmPasswordRef.current.setCustomValidity("");
                                }
                            }} 
                        />

                </div>

                <div className="mb-3 password passwordConfirm">

                    <label>Repetir password</label>

                        <Password 
                            passwordConfirm={true} 
                            value={confirmPassword} 
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (confirmPasswordRef.current) {
                                    confirmPasswordRef.current.setCustomValidity("");
                                }
                            }} 
                            ref={confirmPasswordRef}
                        />

                </div>

                <button className="btn btnRegister" type="submit" disabled={isLoading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                {errorMessage && (
                    <div className="alertError" style={{ display: 'block' }}>
                        {errorMessage}
                    </div>
                )}

                <small>

                    Outras opções de cadastro

                </small>

                <button
                    className="btnGoogle"
                    type="button">

                    <img
                        src={google}
                        alt="Google" />

                    Fazer cadastro com Google

                </button>

            </form>

        </div>

    );

}
