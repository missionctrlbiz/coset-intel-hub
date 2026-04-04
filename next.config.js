/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['officeparser', 'file-type'],
    },
    images: {
        remotePatterns: [],
    },
};

module.exports = nextConfig;