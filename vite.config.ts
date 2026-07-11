import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { google } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
            '@images': fileURLToPath(new URL('./resources/images', import.meta.url)),
        },
    },
    plugins: [
        laravel({
            input: ['resources/scss/app.scss', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                google('Montserrat', {
                    weights: [400, 500, 600, 700],
                }),
                google('Anton'),
                google('Roboto Condensed', {
                    weights: [400, 500, 600, 700],
                }),
                google('Share Tech Mono'),
            ],
            assets: ['resources/img/**'],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        })
    ],
});
