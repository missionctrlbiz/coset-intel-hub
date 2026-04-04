import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">404</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">The page could not be found</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                The link may be outdated or the page may have moved. Use the homepage to continue browsing CoSET intelligence.
            </p>
            <Link href="/" className="mt-8 rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal">
                Back To Home
            </Link>
        </div>
    );
}