import dup from "@images/dup.png";

export default function Signature() {

    return (

        <footer className="footer">

            <div className="signature">

                <span className="text">
                    Desenvolvido por
                </span>

                <span className="name">
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

        </footer>

    );

}