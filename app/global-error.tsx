'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-mist font-sans text-ink antialiased">
                <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">Critical Error</p>
                    <h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">The application needs to recover</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                        A top-level rendering error occurred. Retry first. If the issue persists, reload the app or return to the homepage.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={reset}
                            className="rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal"
                        >
                            Retry App
                        </button>
                        <Link href="/" className="rounded-full border border-line px-5 py-3 font-semibold text-navy transition hover:border-navy">
                            Go Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}