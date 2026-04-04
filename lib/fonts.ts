import { Lexend } from 'next/font/google';
import localFont from 'next/font/local';

export const cosetSans = Lexend({
    subsets: ['latin'],
    variable: '--font-coset-sans',
    display: 'swap',
});

// Keeping the variable name same to minimize layout changes
export const mtnBrighterSans = localFont({
    src: [
        { path: '../public/fonts/mtn-brighter-sans-regular.otf', weight: '400', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-bold.otf', weight: '700', style: 'normal' },
    ],
    variable: '--font-mtn-sans',
});