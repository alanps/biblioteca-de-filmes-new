import google from "@images/google.svg";
import Password from '@/components/password';
import { useState, useRef } from "react";

export default function RegisterBox() {

    // Estados para todos os campos do formulário
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const confirmarSenhaRef = useRef(null);
    
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const lidarComCadastro = async (evento) => {
        evento.preventDefault();
        const inputConfirmacao = confirmarSenhaRef.current;

        if (senha !== confirmarSenha) {
            inputConfirmacao.setCustomValidity("As senhas não coincidem!");
            inputConfirmacao.reportValidity();
            return;
        }

        inputConfirmacao.setCustomValidity("");

        setCarregando(true);

        try {
            const resposta = await fetch('https://biblioteca-de-filmes.ddev.site/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: senha
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao cadastrar.');
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
    
        <div className="register-box">

            <div className="register-title">

                CADASTRAR NOVO USUÁRIO

            </div>

            <form onSubmit={lidarComCadastro}>

                <div className="mb-3">

                    <label>Nome</label>

                    <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control" />

                </div>

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

                    <label>Senha (mínimo 8 caracteres)</label>

                        <Password 
                            value={senha} 
                            onChange={(e) => {
                                setSenha(e.target.value);
                                if (confirmarSenhaRef.current) {
                                    confirmarSenhaRef.current.setCustomValidity("");
                                }
                            }} 
                        />

                </div>

                <div className="mb-3 password password-confirm">

                    <label>Repetir senha</label>

                        <Password 
                            passwordConfirm={true} 
                            value={confirmarSenha} 
                            onChange={(e) => {
                                setConfirmarSenha(e.target.value);
                                if (confirmarSenhaRef.current) {
                                    confirmarSenhaRef.current.setCustomValidity("");
                                }
                            }} 
                            ref={confirmarSenhaRef}
                        />

                </div>

                <button className="btn btn-register" type="submit" disabled={carregando}>
                    {carregando ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                {erro && (
                    <div className="alert-error" style={{ display: 'block' }}>
                        {erro}
                    </div>
                )}

                <small>

                    Outras opções de cadastro

                </small>

                <button
                    className="btn-google"
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