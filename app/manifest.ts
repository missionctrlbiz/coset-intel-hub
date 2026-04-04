import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CoSET Intelligence Hub',
        short_name: 'CoSET Hub',
        description: 'Premium climate justice and socio-ecological intelligence.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f5f7fb',
        theme_color: '#0b2f52',
        icons: [
            {
                src: '/favicon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}