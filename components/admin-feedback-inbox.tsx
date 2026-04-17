'use client';

import { MailOpen, MessageSquareReply, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';

export type FeedbackItem = {
    id: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    is_read: boolean;
    admin_reply: string | null;
    created_at: string;
    read_at: string | null;
    replied_at: string | null;
    updated_at: string;
};

type AdminFeedbackInboxProps = {
    initialFeedback: FeedbackItem[];
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function AdminFeedbackInbox({ initialFeedback }: AdminFeedbackInboxProps) {
    const [feedback, setFeedback] = useState(initialFeedback);
    const [selectedId, setSelectedId] = useState(initialFeedback[0]?.id ?? null);
    const [replyDraft, setReplyDraft] = useState(initialFeedback[0]?.admin_reply ?? '');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const selectedFeedback = useMemo(
        () => feedback.find((item) => item.id === selectedId) ?? null,
        [feedback, selectedId],
    );

    useEffect(() => {
        setReplyDraft(selectedFeedback?.admin_reply ?? '');
        setError(null);
        setNotice(null);
    }, [selectedId, selectedFeedback?.admin_reply]);

    async function markAsRead(id: string) {
        setError(null);
        setNotice(null);
        startTransition(async () => {
            try {
                const response = await fetch(`/api/feedback/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'mark-read' }),
                });
                const payload = await response.json();
                if (!response.ok || !payload.feedback) {
                    setError(payload.error ?? 'Could not mark feedback as read.');
                    return;
                }
                setFeedback((current) => current.map((item) => (item.id === id ? payload.feedback : item)));
                setNotice('Marked as read.');
            } catch {
                setError('Could not mark feedback as read.');
            }
        });
    }

    async function saveReply() {
        if (!selectedFeedback) return;
        setError(null);
        setNotice(null);
        startTransition(async () => {
            try {
                const response = await fetch(`/api/feedback/${selectedFeedback.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reply', reply: replyDraft }),
                });
                const payload = await response.json();
                if (!response.ok || !payload.feedback) {
                    setError(payload.error ?? 'Could not save the reply.');
                    return;
                }
                setFeedback((current) => current.map((item) => (item.id === selectedFeedback.id ? payload.feedback : item)));
                setNotice('Reply saved successfully.');
            } catch {
                setError('Could not save the reply.');
            }
        });
    }

    async function deleteFeedback(id: string) {
        const confirmed = window.confirm('Delete this feedback entry? This action cannot be undone.');
        if (!confirmed) return;
        setError(null);
        setNotice(null);
        startTransition(async () => {
            try {
                const response = await fetch(`/api/feedback/${id}`, {
                    method: 'DELETE',
                });
                const payload = await response.json();
                if (!response.ok) {
                    setError(payload.error ?? 'Could not delete feedback.');
                    return;
                }
                setFeedback((current) => {
                    const next = current.filter((item) => item.id !== id);
                    if (selectedId === id) {
                        setSelectedId(next[0]?.id ?? null);
                    }
                    return next;
                });
                setNotice('Feedback deleted.');
            } catch {
                setError('Could not delete feedback.');
            }
        });
    }

    if (feedback.length === 0) {
        return (
            <section className="rounded-[2rem] border border-line bg-panel p-10 text-center shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Feedback Inbox</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">No feedback yet</h2>
                <p className="mt-3 text-sm leading-7 text-muted">New public feedback submissions will appear here once they are sent from the contact page.</p>
            </section>
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] border border-line bg-panel p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between px-2 pt-2">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Inbox</p>
                        <p className="mt-1 text-sm text-muted">{feedback.filter((item) => !item.is_read).length} unread</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {feedback.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition ${selectedId === item.id ? 'border-ember bg-ember/5 shadow-soft' : 'border-line bg-panel-alt/50 hover:border-ember/40 hover:bg-mist'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-ink">{item.name}</p>
                                    <p className="mt-1 text-xs text-muted">{item.email}</p>
                                </div>
                                {!item.is_read ? (
                                    <span className="rounded-full bg-ember/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ember">
                                        New
                                    </span>
                                ) : null}
                            </div>
                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{item.topic}</p>
                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{item.message}</p>
                            <p className="mt-3 text-xs font-medium text-muted">{formatDate(item.created_at)}</p>
                        </button>
                    ))}
                </div>
            </aside>

            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
                {selectedFeedback ? (
                    <>
                        <div className="flex flex-col justify-between gap-5 border-b border-line pb-6 md:flex-row md:items-start">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Feedback Detail</p>
                                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">{selectedFeedback.topic}</h2>
                                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                                    <span className="font-semibold text-ink">{selectedFeedback.name}</span>
                                    <span>{selectedFeedback.email}</span>
                                    <span>{formatDate(selectedFeedback.created_at)}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {!selectedFeedback.is_read ? (
                                    <button
                                        type="button"
                                        onClick={() => markAsRead(selectedFeedback.id)}
                                        disabled={isPending}
                                        className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-ink transition hover:border-navy hover:text-navy disabled:opacity-60"
                                    >
                                        <MailOpen className="h-4 w-4" />
                                        Mark as Read
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={() => deleteFeedback(selectedFeedback.id)}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-line bg-mist p-5 dark:bg-panel-alt/60">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Message</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">{selectedFeedback.message}</p>
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-2">
                                <MessageSquareReply className="h-4 w-4 text-teal" />
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Admin Reply</p>
                            </div>
                            <textarea
                                value={replyDraft}
                                onChange={(event) => setReplyDraft(event.target.value)}
                                rows={6}
                                placeholder="Write an internal reply or resolution note for this feedback."
                                className="w-full rounded-[1.5rem] border border-line bg-mist px-4 py-4 text-sm text-ink outline-none transition focus:border-ember dark:bg-panel-alt/60"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="text-xs text-muted">
                                    {selectedFeedback.replied_at ? `Last updated ${formatDate(selectedFeedback.replied_at)}` : 'No reply saved yet.'}
                                </div>
                                <button
                                    type="button"
                                    onClick={saveReply}
                                    disabled={isPending || !replyDraft.trim()}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <MessageSquareReply className="h-4 w-4" />
                                    Save Reply
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                                {error}
                            </div>
                        ) : null}

                        {notice ? (
                            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                                {notice}
                            </div>
                        ) : null}
                    </>
                ) : null}
            </section>
        </div>
    );
}
