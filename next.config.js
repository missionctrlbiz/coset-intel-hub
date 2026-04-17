const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
    /** @type {import('next').NextConfig} */
    const nextConfig = {
        distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
        experimental: {
            serverComponentsExternalPackages: ['officeparser', 'file-type'],
        },
        images: {
            unoptimized: true,
            remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
                ? [{ protocol: 'https', hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname }]
                : [],
        },
    };

    return nextConfig;
};