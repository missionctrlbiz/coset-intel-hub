'use client';

import confetti from 'canvas-confetti';
import { CheckCircle2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SubscribeResponse = {
    success?: boolean;
    message?: string;
    error?: string;
};

type SubscribeFormProps = {
    /**
     * Visual tone of the form surface.
     * - `dark`  : form sits on a fixed dark surface (e.g. inside the subscribe modal)
     * - `auto`  : form adapts to light/dark via Tailwind `dark:` variants (e.g. inline card)
     */
    tone?: 'dark' | 'auto';
    submitLabel?: string;
    successTitle?: string;
    successMessage?: string;
    className?: string;
};

/**
 * Shared subscribe form used by:
 *  - the header/footer subscribe modal (wrapped by SubscribeModalTrigger, tone="dark")
 *  - the inline newsletter card on the homepage (tone="auto")
 *
 * Owns the email state, validation, submit, success/error UI and confetti burst.
 */
export function SubscribeForm({
    tone = 'auto',
    submitLabel = 'Save my email',
    successTitle = 'Your email has been saved.',
    successMessage = "We'll send you an update as soon as a new publication goes live.",
    className,
}: SubscribeFormProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isDark = tone === 'dark';

    function fireConfetti() {
        // Confetti origin is computed from the form's viewport position so
        // the burst always emerges from wherever the form actually lives
        // (modal center, inline card, etc.).
        let origin = { x: 0.5, y: 0.7 };
        if (rootRef.current && typeof window !== 'undefined') {
            const rect = rootRef.current.getBoundingClientRect();
            const vw = window.innerWidth || 1;
            const vh = window.innerHeight || 1;
            origin = {
                x: (rect.left + rect.width / 2) / vw,
                y: Math.min(Math.max((rect.top + rect.height / 2) / vh, 0.2), 0.85),
            };
        }
        const angle = origin.x < 0.5 ? 60 : 120;
        const opposite = 180 - angle;
        void confetti({ angle, spread: 68, particleCount: 70, origin });
        void confetti({ angle: opposite, spread: 68, particleCount: 70, origin });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!email.trim()) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = (await response.json()) as SubscribeResponse;
            if (!response.ok || !data.success) {
                setError(data.error ?? 'Could not save your email right now. Please try again.');
                return;
            }
            setSuccess(true);
            setEmail('');
            fireConfetti();
        } catch {
            setError('Could not save your email right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <div ref={rootRef} className={cn('space-y-3 text-center', className)}>
                <div
                    className={cn(
                        'mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-soft',
                        isDark
                            ? 'border border-emerald-300/22 bg-emerald-400/12 text-emerald-200'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-300/22 dark:bg-emerald-400/12 dark:text-emerald-200'
                    )}
                >
                    <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                    <p
                        className={cn(
                            'font-display text-lg font-extrabold',
                            isDark ? 'text-white' : 'text-ink dark:text-white'
                        )}
                    >
                        {successTitle}
                    </p>
                    <p
                        className={cn(
                            'mt-1 text-sm',
                            isDark ? 'text-white/82' : 'text-muted'
                        )}
                    >
                        {successMessage}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef} className={className}>
            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                <label className="block space-y-1.5">
                    <span
                        className={cn(
                            'text-sm font-semibold',
                            isDark ? 'text-white/88' : 'text-ink dark:text-white/88'
                        )}
                    >
                        Email address
                    </span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        aria-label="Email address"
                        autoComplete="email"
                        className={cn(
                            'w-full rounded-xl border px-4 py-3 text-base outline-none transition',
                            isDark
                                ? 'border-white/12 bg-white/8 text-white placeholder:text-white/45 focus:border-ember/70 focus:bg-white/10 focus:ring-2 focus:ring-ember/20'
                                : 'border-line bg-white text-ink placeholder:text-muted/70 focus:border-ember focus:ring-2 focus:ring-ember/20 dark:border-white/12 dark:bg-white/5 dark:text-white dark:placeholder:text-white/45'
                        )}
                    />
                </label>

                {error ? (
                    <div
                        role="alert"
                        className={cn(
                            'rounded-xl border px-4 py-2.5 text-sm',
                            isDark
                                ? 'border-rose-300/22 bg-rose-500/12 text-rose-100'
                                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-300/22 dark:bg-rose-500/12 dark:text-rose-100'
                        )}
                    >
                        {error}
                    </div>
                ) : null}

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={isSubmitting}
                    fullWidth
                    className="font-bold shadow-soft"
                >
                    {isSubmitting ? 'Saving...' : submitLabel}
                </Button>
            </form>
        </div>
    );
}
