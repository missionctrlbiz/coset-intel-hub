'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, MessageCircleQuestion } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    streaming?: boolean;
};

export function FloatingChatWidget({ slug }: { slug: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
        setMessages(userMessages);
        setInput('');
        setIsLoading(true);

        // Append a placeholder for the streaming assistant reply
        const assistantIndex = userMessages.length;
        setMessages([...userMessages, { role: 'assistant', content: '', streaming: true }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, slug }),
            });

            if (!response.ok || !response.body) {
                const fallback = response.headers.get('content-type')?.includes('json')
                    ? (await response.json()).error ?? 'Something went wrong.'
                    : 'Something went wrong.';
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = { role: 'assistant', content: fallback };
                    return updated;
                });
                return;
            }

            // Stream tokens into the placeholder message
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[assistantIndex] = { role: 'assistant', content: accumulated, streaming: true };
                    return updated;
                });
            }

            // Mark streaming complete
            setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIndex] = { role: 'assistant', content: accumulated };
                return updated;
            });
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIndex] = { role: 'assistant', content: 'Connection error while contacting AI.' };
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="flex h-[450px] w-[350px] flex-col overflow-hidden rounded-[1.5rem] border border-line bg-panel shadow-editorial"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-ember" />
                                <span className="font-display font-bold">Report AI</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 transition hover:text-white"
                                aria-label="Close Chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-mist/30">
                            {messages.length === 0 && (
                                <div className="text-center text-sm text-muted mt-10">
                                    <Bot className="mx-auto mb-3 h-8 w-8 text-muted/50" />
                                    Ask any question to quickly retrieve information from this report.
                                </div>
                            )}

                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={clsx(
                                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                                        msg.role === 'user'
                                            ? 'ml-auto rounded-tr-sm bg-navy text-white'
                                            : 'mr-auto rounded-tl-sm bg-white border border-line text-ink'
                                    )}
                                >
                                    {msg.content}
                                    {msg.streaming && msg.content && (
                                        <span className="ml-1 inline-block h-3 w-0.5 animate-pulse bg-ember align-middle" />
                                    )}
                                </div>
                            ))}

                            {isLoading && messages[messages.length - 1]?.content === '' && (
                                <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-white px-4 py-2.5 text-sm text-ink">
                                    <Loader2 className="h-4 w-4 animate-spin text-ember" />
                                    <span>Searching…</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="border-t border-line bg-panel p-3">
                            <div className="flex items-center gap-2 rounded-xl border border-line bg-mist px-3 py-2 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy transition">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about this report..."
                                    className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    aria-label="Send message"
                                    className="rounded-lg bg-ember p-1.5 text-white transition hover:brightness-110 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-lg transition hover:-translate-y-1 hover:brightness-110 hover:shadow-xl focus:outline-none"
                aria-label="Toggle AI Chat"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircleQuestion className="h-6 w-6" />}
            </button>
        </div>
    );
}
