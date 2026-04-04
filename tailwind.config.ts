import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const withOpacity = (variableName: string) => `rgb(var(${variableName}) / <alpha-value>)`;

const config: Config = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                ink: withOpacity('--color-ink'),
                navy: withOpacity('--color-navy'),
                teal: withOpacity('--color-teal'),
                ember: withOpacity('--color-ember'),
                mist: withOpacity('--color-mist'),
                sand: withOpacity('--color-sand'),
                line: withOpacity('--color-line'),
                muted: withOpacity('--color-muted'),
                panel: withOpacity('--color-panel'),
                'panel-alt': withOpacity('--color-panel-alt'),
            },
            boxShadow: {
                editorial: '0 24px 60px rgba(7, 26, 51, 0.12)',
                soft: '0 10px 30px rgba(7, 26, 51, 0.08)',
            },
            fontFamily: {
                sans: ['var(--font-coset-sans)'],
                display: ['var(--font-coset-sans)'],
            },
            backgroundImage: {
                'hero-radial': 'radial-gradient(circle at top left, rgb(var(--color-ember) / 0.2), transparent 35%), radial-gradient(circle at 80% 20%, rgb(var(--color-teal) / 0.22), transparent 30%)',
                'grid-fade': 'linear-gradient(to right, rgb(var(--color-line) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-line) / 0.35) 1px, transparent 1px)',
            },
            backgroundSize: {
                grid: '36px 36px',
            },
        },
    },
    plugins: [typography],
};

export default config;