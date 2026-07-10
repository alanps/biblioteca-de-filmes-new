import Card from "./card";

import claquete from "@images/claquete.svg";
import oculos from "@images/oculos.svg";
import pipoca from "@images/pipoca.svg";
import camera from "@images/camera.svg";

export default function Cards() {

    return (

        <section className="cards">

            <div className="row g-0">

                <div className="col-lg-6">
                    <Card
                        color="card-green"
                        icon={claquete}
                        title="Faça sua lista de filmes com cadastro automático."
                    />
                </div>

                <div className="col-lg-6">
                    <Card
                        color="card-blue"
                        icon={oculos}
                        title="Descubra clássicos do cinema."
                    />
                </div>

                <div className="col-lg-6">
                    <Card
                        color="card-yellow"
                        icon={pipoca}
                        title="Marque os filmes que já assistiu."
                    />
                </div>

                <div className="col-lg-6">
                    <Card
                        color="card-pink"
                        icon={camera}
                        title="Compartilhe sua coleção."
                    />
                </div>

            </div>

        </section>

    );

}