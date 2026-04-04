import localFont from 'next/font/local';

export const cosetSans = localFont({
    src: [
        { path: '../public/fonts/mtn-brighter-sans-regular.otf', weight: '400', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-medium.otf', weight: '500', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-bold.otf', weight: '700', style: 'normal' },
    ],
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