import localFont from 'next/font/local';
import { Playfair_Display } from 'next/font/google';

/**
 * MTN Brighter Sans
 *
 * Place valid font binaries in `src/fonts/`.
 * Recommended formats: `.woff2` (best) or `.woff`.
 */
export const mtnBrighterSans = localFont({
  src: [
    {
      path: './mtn-brighter-sans-extralight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './mtn-brighter-sans-extralight-italic.otf',
      weight: '200',
      style: 'italic',
    },
    {
      path: './mtn-brighter-sans-light-italic.otf',
      weight: '300',
      style: 'italic',
    },
    {
      path: './mtn-brighter-sans-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './mtn-brighter-sans-italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: './mtn-brighter-sans-medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './mtn-brighter-sans-medium-italic.otf',
      weight: '500',
      style: 'italic',
    },
    {
      path: './mtn-brighter-sans-bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './mtn-brighter-sans-bold-italic.otf',
      weight: '700',
      style: 'italic',
    },
    {
      path: './mtn-brighter-sans-extrabold.otf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './mtn-brighter-sans-extrabold-italic.otf',
      weight: '800',
      style: 'italic',
    },
  ],
  variable: '--font-mtn-brighter-sans',
  display: 'swap',
  preload: true,
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});
