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
                'relative inline-flex h-8 w-14 items-center rounded-full border transition-colors duration-300',
                darkSurface
                    ? 'border-white/20 bg-white/10'
                    : isDark
                      ? 'border-line bg-panel-alt'
                      : 'border-line bg-mist'
            )}
        >
            <span
                className={cn(
                    'absolute flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300',
                    isDark
                        ? 'left-[calc(100%-28px)] bg-navy text-white'
                        : 'left-1 bg-white text-amber-500'
                )}
            >
                {isDark ? <MoonStar className="h-3.5 w-3.5" /> : <SunMedium className="h-3.5 w-3.5" />}
            </span>
        </button>
    );
}
