import logo from '@images/logo.png';

export default function Header() {
    return (
        <div className="row">

            <div className="col-12">

                <header className="logo text-center">
                    <img src={logo} alt="Biblioteca de Filmes" />
                </header>
                
            </div>

        </div>
    );
}
