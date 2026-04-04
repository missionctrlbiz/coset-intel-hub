'use client';

import { MoonStar, SunMedium } from 'lucide-react';

import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
    darkSurface?: boolean;
};

export function ThemeToggle({ darkSurface = false }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                darkSurface
                    ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                    : 'border-line bg-panel text-ink hover:bg-mist'
            )}
        >
            {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </button>
    );
}