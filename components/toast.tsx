'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import clsx from 'clsx';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastContextValue {
    toast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
}

let toastId = 0;
const DEFAULT_DURATION = 4500;

const variantStyles: Record<ToastVariant, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
    success: { icon: CheckCircle2, className: 'border-teal/30 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100' },
    error: { icon: XCircle, className: 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100' },
    warning: { icon: AlertCircle, className: 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100' },
    info: { icon: Info, className: 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100' },
};

const iconStyles: Record<ToastVariant, string> = {
    success: 'text-teal-600 dark:text-teal-400',
    error: 'text-rose-600 dark:text-rose-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-sky-600 dark:text-sky-400',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((t: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastId}-${Date.now()}`;
        setToasts((prev) => [...prev.slice(-4), { ...t, id }]);

        const duration = t.duration ?? DEFAULT_DURATION;
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((item) => item.id !== id));
            }, duration);
        }
    }, []);

    const value: ToastContextValue = { toast: addToast };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <AnimatePresence>
                <div className="fixed bottom-4 right-4 z-[9999] flex w-full max-w-sm flex-col-reverse gap-2">
                    {toasts.map((t) => {
                        const { icon: Icon, className } = variantStyles[t.variant];
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                                className={clsx(
                                    'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-soft',
                                    className,
                                )}
                            >
                                <Icon className={clsx('mt-0.5 h-5 w-5 shrink-0', iconStyles[t.variant])} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold">{t.title}</p>
                                    {t.description && (
                                        <p className="mt-0.5 text-xs opacity-80">{t.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() =>
                                        setToasts((prev) => prev.filter((item) => item.id !== t.id))
                                    }
                                    className="ml-2 shrink-0 rounded-lg p-1 opacity-60 transition hover:opacity-100"
                                    aria-label="Dismiss"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </AnimatePresence>
        </ToastContext.Provider>
    );
}
