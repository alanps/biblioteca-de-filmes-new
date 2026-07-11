import Card from './card';

import camera from '@images/camera.svg';
import clapboard from '@images/claquete.svg';
import glasses from '@images/oculos.svg';
import popcorn from '@images/pipoca.svg';

export default function Cards() {
    return (
        <section className="cards">
            <div className="landingCardsGrid">
                <Card
                    color="landingCardGreen"
                    icon={clapboard}
                    title="Faça sua lista de filmes com cadastro automático."
                />
                <Card
                    color="landingCardBlue"
                    icon={glasses}
                    title="Descubra clássicos do cinema."
                />
                <Card
                    color="landingCardYellow"
                    icon={popcorn}
                    title="Marque os filmes que já assistiu."
                />
                <Card
                    color="landingCardPink"
                    icon={camera}
                    title="Compartilhe sua coleção."
                />
            </div>
        </section>
    );
}
