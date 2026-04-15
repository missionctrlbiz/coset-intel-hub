'use client';

import Image from 'next/image';
import { useTheme } from '@/components/theme-provider';

type ThemeLogoProps = {
    width?: number;
    height?: number;
    className?: string;
    forceDark?: boolean;
};

export function ThemeLogo({ width = 640, height = 256, className = 'w-[98px] h-auto sm:w-[118px]', forceDark }: ThemeLogoProps) {
    const { theme } = useTheme();
    const isDark = forceDark || theme === 'dark';

    return (
        <Image
            src={isDark ? '/logo-white.png' : '/logo.png'}
            alt="CoSET"
            width={width}
            height={height}
            priority
            className={className}
        />
    );
}
