/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;