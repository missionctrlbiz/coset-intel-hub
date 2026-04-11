'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteReportButton({ id, title }: { id: string; title: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleConfirm() {
        setPending(true);
        setErrorMsg(null);
        try {
            const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setErrorMsg(body.error ?? 'Failed to delete report. Please try again.');
                return;
            }
            setOpen(false);
            router.refresh();
        } finally {
            setPending(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => { setErrorMsg(null); setOpen(true); }}
                title="Delete report"
                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted transition hover:bg-rose-50 hover:text-rose-600"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {open ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                >
                    <div className="relative w-full max-w-md rounded-[2rem] border border-line bg-panel p-8 shadow-editorial">
                        <button
                            type="button"
                            aria-label="Close"
                            onClick={() => setOpen(false)}
                            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-mist hover:text-navy"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                            <AlertTriangle className="h-6 w-6 text-rose-600" />
                        </div>

                        <h2 className="font-display text-2xl font-extrabold text-navy">Delete Report?</h2>
                        <p className="mt-3 text-sm leading-6 text-muted">
                            You are about to permanently delete{' '}
                            <span className="font-semibold text-ink">&ldquo;{title}&rdquo;</span>.
                            This action cannot be undone.
                        </p>

                        {errorMsg ? (
                            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMsg}</p>
                        ) : null}

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={pending}
                                className="flex-1 rounded-xl border border-line bg-mist py-3 text-sm font-semibold text-navy transition hover:border-navy disabled:opacity-50"
                            >
                                No, Keep It
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={pending}
                                className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                            >
                                {pending ? 'Deleting\u2026' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
