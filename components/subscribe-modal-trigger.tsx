'use client';

import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Mail, X } from 'lucide-react';
import { useState } from 'react';

type SubscribeModalTriggerProps = {
    label?: string;
    className?: string;
    modalTitle?: string;
    modalDescription?: string;
};

type SubscribeResponse = {
    success?: boolean;
    message?: string;
    error?: string;
};

const defaultDescription = 'Receive CoSET publication updates in your inbox as soon as new reports and briefs go live.';

export function SubscribeModalTrigger({
    label = 'Subscribe Now',
    className,
    modalTitle = 'Subscribe to CoSET Updates',
    modalDescription = defaultDescription,
}: SubscribeModalTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

            void confetti({
                angle: 60,
                spread: 68,
                particleCount: 70,
                origin: { x: 0.18, y: 0.58 },
            });

            void confetti({
                angle: 120,
                spread: 68,
                particleCount: 70,
                origin: { x: 0.82, y: 0.58 },
            });
        } catch {
            setError('Could not save your email right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    function closeModal() {
        setIsOpen(false);
        setError(null);
        setIsSubmitting(false);
        setSuccess(false);
    }

    return (
        <>
            <button type="button" onClick={() => setIsOpen(true)} className={className}>
                {label}
            </button>

            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        className="fixed inset-0 z-[120] flex items-center justify-center bg-[#020611]/78 px-4 py-8 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                            className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/12 bg-[#08131f] text-white shadow-[0_40px_120px_rgb(2_6_23/0.48)]"
                        >
                            <button
                                type="button"
                                onClick={closeModal}
                                aria-label="Close subscribe modal"
                                className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/82 transition hover:bg-white/12 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,75,34,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(13,148,136,0.16),transparent_26%)]" />

                            <div className="relative px-7 py-8 sm:px-10 sm:py-10">
                                {!success ? (
                                    <div className="space-y-7">
                                        <div className="space-y-4 text-center">
                                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8 text-ember shadow-soft">
                                                <Mail className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Publication Alerts</p>
                                                <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
                                                    {modalTitle}
                                                </h3>
                                                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                                                    {modalDescription}
                                                </p>
                                            </div>
                                        </div>

                                        <form className="space-y-4" onSubmit={handleSubmit}>
                                            <label className="block space-y-3">
                                                <span className="text-sm font-semibold text-white/88">Email address</span>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                    placeholder="you@example.com"
                                                    required
                                                    className="w-full rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-4 text-base text-white outline-none transition placeholder:text-white/45 focus:border-ember/70 focus:bg-white/10 focus:ring-2 focus:ring-ember/20"
                                                />
                                            </label>

                                            {error ? (
                                                <div className="rounded-[1.2rem] border border-rose-300/22 bg-rose-500/12 px-4 py-3 text-sm text-rose-100">
                                                    {error}
                                                </div>
                                            ) : null}

                                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-ember px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isSubmitting ? 'Saving...' : 'Save my email'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeModal}
                                                    className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/14 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white/88 transition hover:bg-white/10 hover:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="space-y-7 text-center">
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/22 bg-emerald-400/12 text-emerald-200 shadow-soft">
                                            <CheckCircle2 className="h-10 w-10" />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Subscription Saved</p>
                                            <h3 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-4xl">
                                                Your email has been saved.
                                            </h3>
                                            <p className="mx-auto max-w-lg text-sm leading-7 text-white/84 sm:text-base">
                                                We&apos;ll be getting updates once we get a new publication.
                                            </p>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-ember px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:brightness-110"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}