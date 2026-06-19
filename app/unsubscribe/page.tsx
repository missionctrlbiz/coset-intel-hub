'use client';

import { useState, useTransition } from 'react';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MailMinus } from 'lucide-react';

type Status = 'idle' | 'success' | 'error' | 'notfound';

export default function UnsubscribePage() {
    // The token comes from ?token=... in the email link.
    // We read it on the client to support SSR-less query parsing.
    const [token] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return new URLSearchParams(window.location.search).get('token');
    });
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [message, setMessage] = useState<string>('');
    const [isPending, startTransition] = useTransition();

    function submit(payload: { token?: string; email?: string }) {
        startTransition(async () => {
            setStatus('idle');
            setMessage('');
            try {
                const response = await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = (await response.json().catch(() => ({}))) as {
                    success?: boolean;
                    message?: string;
                    error?: string;
                };

                if (!response.ok || !data.success) {
                    setStatus('error');
                    setMessage(data.error ?? 'We could not process your request right now.');
                    return;
                }

                setStatus('success');
                setMessage(data.message ?? 'You have been unsubscribed.');
            } catch {
                setStatus('error');
                setMessage('Network error. Please try again.');
            }
        });
    }

    return (
        <>
            <SiteHeader />
            <main className="site-shell max-w-2xl py-16 sm:py-20">
                <div className="rounded-3xl border border-line bg-panel p-8 shadow-editorial sm:p-10">
                    <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ember/10 text-ember">
                            <MailMinus className="h-6 w-6" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                                Manage Subscription
                            </p>
                            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">
                                Unsubscribe from CoSET Briefs
                            </h1>
                        </div>
                    </div>

                    {status === 'success' ? (
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 dark:border-emerald-300/22 dark:bg-emerald-400/12 dark:text-emerald-200">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-semibold">{message}</p>
                            </div>
                            <p className="text-sm leading-relaxed text-muted">
                                You will not receive any further publication alerts from us. You can
                                re-subscribe at any time from the newsletter card on our homepage.
                            </p>
                            <Button href="/" variant="primary" size="md">
                                Return to homepage
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="mt-6 text-sm leading-relaxed text-muted">
                                We respect your inbox. Confirm below and we will stop sending
                                publication alerts to this address immediately.
                            </p>

                            {token ? (
                                <form
                                    className="mt-8 space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submit({ token });
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        disabled={isPending}
                                        fullWidth
                                        className="font-bold shadow-soft"
                                    >
                                        {isPending ? 'Unsubscribing...' : 'Confirm unsubscribe'}
                                    </Button>
                                    {status === 'error' ? (
                                        <p className="text-sm text-rose-600 dark:text-rose-300">{message}</p>
                                    ) : null}
                                </form>
                            ) : (
                                <form
                                    className="mt-8 space-y-4"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        submit({ email: email.trim() });
                                    }}
                                >
                                    <label className="block space-y-1.5">
                                        <span className="text-sm font-semibold text-ink dark:text-white/88">
                                            Email address
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-ember focus:ring-2 focus:ring-ember/20 dark:border-white/12 dark:bg-white/5 dark:text-white dark:placeholder:text-white/45"
                                        />
                                    </label>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                        disabled={isPending || !email.trim()}
                                        fullWidth
                                        className="font-bold shadow-soft"
                                    >
                                        {isPending ? 'Unsubscribing...' : 'Unsubscribe me'}
                                    </Button>
                                    {status === 'error' ? (
                                        <p className="text-sm text-rose-600 dark:text-rose-300">{message}</p>
                                    ) : null}
                                </form>
                            )}

                            <p className="mt-6 text-xs leading-relaxed text-muted">
                                Changed your mind? You can re-subscribe any time from the
                                newsletter card on the homepage. Questions? Email{' '}
                                <a
                                    href="mailto:cosetng@gmail.com"
                                    className="font-semibold text-ember underline-offset-4 hover:underline"
                                >
                                    cosetng@gmail.com
                                </a>
                                .
                            </p>
                        </>
                    )}
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
