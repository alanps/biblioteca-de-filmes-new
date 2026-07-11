import { Link } from "@inertiajs/react";
import { index } from '@/routes/login';

export default function CTA() {

    return (

        <section className="cta">

            <div className="container">

                <div className="row justify-content-center">

                    <div className="col-lg-8">

                        <Link
                            href="/login"
                            className="registrationButton"
                        >
                            Faça login ou cadastreSe agora!
                        </Link>
                    </div>

                </div>

            </div>

        </section>
        
    );

}