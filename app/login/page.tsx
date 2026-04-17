'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
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
    const redirectTo = searchParams?.get('redirect') || '/admin';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero-radial p-4 sm:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-ink/88 via-ink/82 to-ink/70" />

            <div className="absolute inset-0">
                <Image
                    src="/coset-eye-banner.jpg"
                    alt="Background"
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover opacity-[0.08] mix-blend-screen"
                />
            </div>

            <SectionWrapper>
                <div className="relative w-full max-w-md">
                    <div className="mb-8 text-center">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/logo.png"
                                alt="CoSET"
                                width={512}
                                height={256}
                                className="mx-auto w-[144px] invert brightness-200"
                            />
                        </Link>
                        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-[-0.04em] text-white">Sign in</h1>
                        <p className="mt-3 text-sm leading-7 text-white/65">Use your email and password to access the admin dashboard.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2rem] border border-white/12 bg-white/8 p-1 shadow-editorial backdrop-blur-xl"
                    >
                        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6 sm:p-8">
                            <form action={handleSubmit} className="space-y-6">
                                <input type="hidden" name="redirect" value={redirectTo} />
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/75" htmlFor="email">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="name@example.com"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:ring-1 focus:ring-white/15"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <label className="text-sm font-semibold text-white/75" htmlFor="password">
                                            Password
                                        </label>
                                        <Link href="/contact" className="text-sm font-medium text-white/60 transition hover:text-white">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Enter your password"
                                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-16 text-white outline-none transition placeholder:text-white/25 focus:border-white/25 focus:ring-1 focus:ring-white/15"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-ember py-4 font-semibold text-white shadow-soft transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Sign in
                                            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-white/45">
                                Need access? Contact the CoSET admin team.
                            </p>
                        </div>
                    </motion.div>
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
