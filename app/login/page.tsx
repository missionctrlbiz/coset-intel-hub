'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Fingerprint, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { login } from './actions';

export default function LoginPage() {
    return (
        <Suspense>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/admin';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-radial p-4">
            <div className="absolute inset-0 bg-grid-fade bg-grid opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-ink/80 to-teal/40" />

            <div className="absolute inset-0">
                <Image
                    src="/coset-eye-banner.jpg"
                    alt="Background"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover opacity-[0.12] mix-blend-screen"
                />
            </div>

            <SectionWrapper>
                <div className="relative w-full max-w-lg">
                    <div className="mb-10 text-center">
                        <Link href="/" className="mb-12 inline-block">
                            <Image
                                src="/logo.png"
                                alt="CoSET"
                                width={512}
                                height={256}
                                className="mx-auto w-[160px] invert grayscale brightness-200"
                            />
                        </Link>
                        <p className="mt-8 text-xs font-bold uppercase tracking-[0.4em] text-ember">Intelligence Hub Authority</p>
                        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.04em] text-white">Administrator Portal</h1>
                        <p className="mt-4 text-white/55">Enter your executive credentials to manage socio-ecological signals.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2.5rem] border border-white/10 bg-black/30 p-1 shadow-editorial backdrop-blur-2xl"
                    >
                        <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-inner-white">
                            <form action={handleSubmit} className="space-y-6">
                                <input type="hidden" name="redirect" value={redirectTo} />
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50" htmlFor="email">
                                        Executive Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="name@organization.org"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-white/50" htmlFor="password">
                                        Authentication Key
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            placeholder="••••••••••••"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition focus:border-ember/50 focus:ring-1 focus:ring-ember/30"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-ember py-4 font-bold text-white shadow-soft transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                    ) : (
                                        <>
                                            Secure Sign In
                                            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>Encrypted connection active</span>
                                </div>
                                <button type="button" className="text-xs font-semibold text-white/60 hover:text-white">
                                    Forgot credentials?
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-teal/20 p-2 text-teal-400">
                                    <Fingerprint className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/70">Role-Based Access</p>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-white/40">Only editor and admin roles can manage hub content through the administrative desk.</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-ember/20 p-2 text-ember-400">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/70">Editorial Policy</p>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-white/40">Generated draft content must be manually reviewed and approved by staff before publication.</p>
                        </div>
                    </div>
                </div>
            </SectionWrapper>
        </main>
    );
}

function SectionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center"
        >
            {children}
        </motion.section>
    );
}
