'use client';

import { useTransition, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { syncResendAudience, type SyncResult } from '@/lib/actions/admin-subscribers';

export function AdminResendSyncButton() {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);

    function handleSync() {
        startTransition(async () => {
            setMessage(null);
            const result = (await syncResendAudience()) as SyncResult;
            if (result.success) {
                const parts: string[] = [];
                if (typeof result.synced === 'number') parts.push(`${result.synced} synced`);
                if (typeof result.removed === 'number') parts.push(`${result.removed} removed`);
                setMessage(parts.length > 0 ? `Done — ${parts.join(', ')}.` : 'Already in sync.');
            } else {
                setMessage(result.error ?? 'Sync failed.');
            }
        });
    }

    return (
        <div className="flex flex-col items-end gap-2">
            <button
                type="button"
                onClick={handleSync}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:border-ember/40 hover:text-ember disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
                <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
                {isPending ? 'Syncing...' : 'Sync from Resend'}
            </button>
            {message ? (
                <p className="text-xs text-muted" role="status">
                    {message}
                </p>
            ) : null}
        </div>
    );
}
