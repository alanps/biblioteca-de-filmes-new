import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pageAliases: Record<string, string> = {
    'landing-page': 'landingPage',
    forgotpass: 'forgotPassword',
};

createInertiaApp({
    resolve: (name) => resolvePageComponent(
        `./pages/${pageAliases[name] ?? name}.tsx`,
        import.meta.glob('./pages/**/*.tsx'),
    ),
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
});
