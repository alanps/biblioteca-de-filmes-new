import { Link } from '@inertiajs/react';

export default function CTA() {
    return (
        <section className="cta">
            <Link href="/login" className="registrationButton">
                Faça seu cadastro agora!
            </Link>
        </section>
    );
}
