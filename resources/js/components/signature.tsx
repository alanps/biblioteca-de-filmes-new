import dup from "@images/dup.png";

export default function Signature() {

    return (

        <footer className="footer">

            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-auto">

                        <div className="assinatura">

                            <span className="texto">
                                Desenvolvido por
                            </span>

                            <span className="nome">
                                <a
                                    href="https://www.linkedin.com/in/alanpardinisantana/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <img className="icon" src={dup} alt="Alan Pardini Sant'Ana" />
                                    Alan Pardini Sant'Ana
                                </a>
                            </span>

                            <div className="copyright">
                                Todos os direitos reservados.
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </footer>

    );

}