'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const storageKey = 'coset-theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
}

function resolveInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');

    useEffect(() => {
        const initialTheme = resolveInitialTheme();
        setThemeState(initialTheme);
        applyTheme(initialTheme);
    }, []);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme: (nextTheme) => {
                setThemeState(nextTheme);
                applyTheme(nextTheme);
                window.localStorage.setItem(storageKey, nextTheme);
            },
            toggleTheme: () => {
                const nextTheme = theme === 'dark' ? 'light' : 'dark';
                setThemeState(nextTheme);
                applyTheme(nextTheme);
                window.localStorage.setItem(storageKey, nextTheme);
            },
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider.');
    }

    return context;
}