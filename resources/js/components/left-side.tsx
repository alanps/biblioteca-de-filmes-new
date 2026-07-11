import claquete2 from "@images/claquete2.png";
import ticket from "@images/ticket.png";

export default function LeftSide() {

    return (

        <div className="left-side">

            <div className="yellow-column">

                <img
                    src={claquete2}
                    alt="Claquete"
                    className="claquete" />

            </div>

            <div className="blue-column">

                <img
                    src={ticket}
                    alt="Ingressos"
                    className="ticket" />

            </div>

        </div>

    );

}