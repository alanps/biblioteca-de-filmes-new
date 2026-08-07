import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

import { dashboard } from '@/routes';

type GoogleCompleteProps = {
    accessToken: string;
};

export default function GoogleComplete({ accessToken }: GoogleCompleteProps) {
    useEffect(() => {
        window.localStorage.setItem('TOKEN_API', accessToken);
        window.location.replace(dashboard.url());
    }, [accessToken]);

    return (
        <>
            <Head title="Concluindo login" />
            <main className="flex min-h-screen items-center justify-center">
                <p>Concluindo login com Google...</p>
            </main>
        </>
    );
}
