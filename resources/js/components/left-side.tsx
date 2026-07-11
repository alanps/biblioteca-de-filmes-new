import clapboard2 from "@images/claquete2.png";
import ticket from "@images/ticket.png";

export default function LeftSide() {

    return (

        <div className="leftSide">

            <div className="yellowColumn">

                <img
                    src={clapboard2}
                    alt="Claquete"
                    className="clapboard" />

            </div>

            <div className="blueColumn">

                <img
                    src={ticket}
                    alt="Ingressos"
                    className="ticket" />

            </div>

        </div>

    );

}
