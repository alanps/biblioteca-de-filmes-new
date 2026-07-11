import { Head } from '@inertiajs/react';

import Header from "@/components/header";
import Cards from "@/components/cards";
import CTA from "@/components/cta";
import Signature from "@/components/signature";

export default function LandingPage() {
    return (
        <>
            <Head />
            
            <main className="home">

                <div className="container">

                    <Header />
                    
                    <Cards />

                </div>

            </main>

            <CTA />

            <Signature />

        </>
    );
}
