import type { Metadata } from 'next';

import { SiteFooter } from '@/components/site-footer';
import { ThemeProvider } from '@/components/theme-provider';
import { cosetSans } from '@/lib/fonts';

import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const themeScript = `
(() => {
    const storageKey = 'coset-theme';
    const storedTheme = window.localStorage.getItem(storageKey);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
})();`;

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: 'CoSET Intelligence Hub',
    description: 'A premium intelligence hub for climate justice, socio-ecological transformation, and policy insight in Nigeria.',
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/favicon-white.png',
    },
    openGraph: {
        title: 'CoSET Intelligence Hub',
        description: 'Data-driven reports, policy briefs, and research for socio-ecological transformation.',
        images: ['/coset-eye-banner.jpg'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning className={cosetSans.variable}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className="bg-mist font-sans text-ink antialiased">
                <ThemeProvider>
                    {children}
                    <SiteFooter />
                </ThemeProvider>
            </body>
        </html>
    );
}