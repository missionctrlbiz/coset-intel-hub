'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}
