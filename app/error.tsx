'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">Application Error</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Something interrupted the page render</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                The app hit an unexpected error while loading this section. You can retry the request or return to the homepage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal"
                >
                    Try Again
                </button>
                <Link href="/" className="rounded-full border border-line px-5 py-3 font-semibold text-navy transition hover:border-navy">
                    Back To Home
                </Link>
            </div>
        </div>
    );
}