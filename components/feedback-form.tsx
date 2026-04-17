'use client';

import { CheckCircle2, Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

type FeedbackResponse = {
    success?: boolean;
    message?: string;
    error?: string;
};

const topics = [
    'General Inquiry',
    'Submit Intelligence / Tip',
    'Data Access Request',
    'Hub Features / Bug',
];

export function FeedbackForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [topic, setTopic] = useState(topics[0]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    topic,
                    message,
                }),
            });

            const payload = (await response.json()) as FeedbackResponse;

            if (!response.ok || !payload.success) {
                setError(payload.error ?? 'We could not submit your feedback right now. Please try again.');
                return;
            }

            setIsSubmitted(true);
            setSuccessMessage(payload.message ?? 'Thanks. Your feedback has been recorded.');
            setName('');
            setEmail('');
            setTopic(topics[0]);
            setMessage('');
        } catch {
            setError('We could not submit your feedback right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="rounded-[2rem] border border-ember/20 bg-panel p-6 text-ink shadow-soft">
                <div className="flex items-start gap-4">
                    <div className="rounded-full bg-ember/10 p-3 text-ember">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                            Message Sent
                        </p>
                        <h4 className="mt-2 font-display text-2xl font-bold text-navy dark:text-white">
                            Thank you for your message
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-muted">
                            {successMessage}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSubmitted(false);
                                setSuccessMessage('');
                                setError(null);
                            }}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Send Another Message
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="feedback-name" className="ml-2 text-xs font-bold uppercase tracking-wider text-muted">
                        Name
                    </label>
                    <input
                        id="feedback-name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink outline-none transition focus:border-ember dark:bg-panel"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="feedback-email" className="ml-2 text-xs font-bold uppercase tracking-wider text-muted">
                        Email
                    </label>
                    <input
                        id="feedback-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink outline-none transition focus:border-ember dark:bg-panel"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="feedback-topic" className="ml-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Topic
                </label>
                <select
                    id="feedback-topic"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink outline-none transition focus:border-ember dark:bg-panel"
                >
                    {topics.map((topicOption) => (
                        <option key={topicOption} value={topicOption}>
                            {topicOption}
                        </option>
                    ))}
                </select>
            </div>
            <div className="space-y-2">
                <label htmlFor="feedback-message" className="ml-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Message
                </label>
                <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what worked, what feels broken, or what you want improved."
                    rows={6}
                    required
                    className="h-[180px] w-full resize-none rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink outline-none transition focus:border-ember dark:bg-panel"
                />
            </div>
            {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
                    {error}
                </div>
            ) : null}
            <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-4 py-4 font-bold text-white shadow-soft transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                {isSubmitting ? 'Sending Feedback…' : 'Send Message'}
            </button>
        </form>
    );
}
