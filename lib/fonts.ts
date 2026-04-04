import localFont from 'next/font/local';

export const cosetSans = localFont({
    src: [
        { path: '../public/fonts/mtn-brighter-sans-extralight.otf', weight: '200', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-extralight-italic.otf', weight: '200', style: 'italic' },
        { path: '../public/fonts/mtn-brighter-sans-regular.otf', weight: '400', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-italic.otf', weight: '400', style: 'italic' },
        { path: '../public/fonts/mtn-brighter-sans-medium.otf', weight: '500', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-medium-italic.otf', weight: '500', style: 'italic' },
        { path: '../public/fonts/mtn-brighter-sans-bold.otf', weight: '700', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-bold-italic.otf', weight: '700', style: 'italic' },
        { path: '../public/fonts/mtn-brighter-sans-extrabold.otf', weight: '800', style: 'normal' },
        { path: '../public/fonts/mtn-brighter-sans-extrabold-italic.otf', weight: '800', style: 'italic' },
    ],
    variable: '--font-coset-sans',
    display: 'swap',
    preload: true,
});