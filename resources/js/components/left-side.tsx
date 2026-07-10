import claquete2 from "@images/claquete2.png";
import ticket from "@images/ticket.png";

export default function LeftSide() {

    return (

        <div class="left-side">

            <div class="yellow-column">

                <img
                    src={claquete2}
                    alt="Claquete"
                    class="claquete" />

            </div>

            <div class="blue-column">

                <img
                    src={ticket}
                    alt="Ingressos"
                    class="ticket" />

            </div>

        </div>

    );

}