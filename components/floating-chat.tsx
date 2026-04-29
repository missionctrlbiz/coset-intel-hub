'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessageCircle, Send, X } from 'lucide-react';
import clsx from 'clsx';

type AssistantMode = 'general' | 'report';

type TopReport = {
    title: string;
    slug: string;
    category: string;
};

type Message = {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    actions?: string[];
    streaming?: boolean;
};

type FloatingChatWidgetProps = {
    mode?: AssistantMode;
    slug?: string;
    reportTitle?: string;
    topReports?: TopReport[];
};

const EMPTY_TOP_REPORTS: TopReport[] = [];

const LINK_PATTERN = /(\[[^\]]+\]\((?:https?:\/\/|\/|mailto:|tel:)[^)]+\)|(?:https?:\/\/[^\s<]+|\/(?:reports|blog|contact|login|admin)[^\s<]*|mailto:[^\s<]+|tel:[^\s<]+))/g;

function buildMessageId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSafeHref(rawHref: string) {
    if (/^(https?:\/\/|mailto:|tel:|\/)/.test(rawHref)) {
        return rawHref;
    }
    return null;
}

function renderInlineContent(content: string, keyPrefix: string) {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const match of content.matchAll(LINK_PATTERN)) {
        const token = match[0];
        const start = match.index ?? 0;

        if (start > lastIndex) {
            nodes.push(<span key={`${keyPrefix}-t-${start}`}>{content.slice(lastIndex, start)}</span>);
        }

        if (token.startsWith('[')) {
            const m = token.match(/^\[([^\]]+)\]\((.+)\)$/);
            const label = m?.[1] ?? token;
            const href = m?.[2] ? getSafeHref(m[2]) : null;
            if (href) {
                nodes.push(
                    <a key={`${keyPrefix}-l-${start}`} href={href}
                        target={!href.startsWith('/') ? '_blank' : undefined}
                        rel={!href.startsWith('/') ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-ember underline decoration-ember/50 underline-offset-4 transition hover:text-white">
                        {label}
                    </a>
                );
            } else {
                nodes.push(<span key={`${keyPrefix}-lf-${start}`}>{token}</span>);
            }
        } else {
            const trailMatch = token.match(/^(.*?)([),.!?;:]+)?$/);
            const core = trailMatch?.[1] ?? token;
            const suffix = trailMatch?.[2] ?? '';
            const href = getSafeHref(core);
            if (href) {
                nodes.push(
                    <a key={`${keyPrefix}-u-${start}`} href={href}
                        target={!href.startsWith('/') ? '_blank' : undefined}
                        rel={!href.startsWith('/') ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-ember underline decoration-ember/50 underline-offset-4 transition hover:text-white">
                        {core}
                    </a>
                );
                if (suffix) nodes.push(<span key={`${keyPrefix}-s-${start}`}>{suffix}</span>);
            } else {
                nodes.push(<span key={`${keyPrefix}-uf-${start}`}>{token}</span>);
            }
        }

        lastIndex = start + token.length;
    }

    if (lastIndex < content.length) {
        nodes.push(<span key={`${keyPrefix}-tail`}>{content.slice(lastIndex)}</span>);
    }

    return nodes;
}

function renderMessageContent(content: string) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
            elements.push(<div key={`gap-${index}`} className="h-1.5" />);
            return;
        }

        // Section header: "Key Findings:" or "Summary:" — label on its own line ending with colon
        const sectionHeader = trimmed.match(/^([A-Z][A-Za-z\s&/-]{1,45}):$/);
        if (sectionHeader) {
            elements.push(
                <div key={`h-${index}`} className="mt-3 mb-1.5 flex items-center gap-2 first:mt-0">
                    <span className="h-px flex-1 bg-ember/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ember">{sectionHeader[1]}</span>
                    <span className="h-px flex-1 bg-ember/20" />
                </div>
            );
            return;
        }

        // Numbered list: 1. or 1)
        const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
        if (numbered) {
            elements.push(
                <div key={`n-${index}`} className="my-1 flex gap-2.5 pl-0.5">
                    <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember/15 text-[10px] font-bold text-ember">
                        {numbered[1]}
                    </span>
                    <span className="text-white/88 leading-snug">{renderInlineContent(numbered[2], `n-${index}`)}</span>
                </div>
            );
            return;
        }

        // Bullet list: -, *, •
        const bulleted = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bulleted) {
            elements.push(
                <div key={`b-${index}`} className="my-1 flex gap-2.5 pl-0.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember/70" />
                    <span className="text-white/88 leading-snug">{renderInlineContent(bulleted[1], `b-${index}`)}</span>
                </div>
            );
            return;
        }

        // Plain text paragraph
        elements.push(
            <p key={`p-${index}`} className="my-0.5 leading-relaxed text-white/88">
                {renderInlineContent(trimmed, `p-${index}`)}
            </p>
        );
    });

    return elements;
}

function buildInitialMessages(mode: AssistantMode, reportTitle: string | undefined, topReports: TopReport[]) {
    if (mode === 'general') {
        const reportList = topReports.length > 0
            ? topReports.slice(0, 5).map((report, index) => `${index + 1}. [${report.title}](/reports/${report.slug}) — ${report.category}`).join('\n')
            : '';

        return [
            {
                id: 'init-general',
                role: 'assistant' as const,
                content: `Welcome to the **CoSET Intelligence Hub**. I can help you explore published research, compare themes, and point you to the right report quickly.\n\n${reportList ? `Here are the latest published reports:\n\n${reportList}\n\n` : ''}Ask about a topic, a policy issue, or a report title and I will stay within the published CoSET material.`,
                actions: ['Latest published reports', 'Climate justice research', 'Energy transition briefs', 'Browse all reports'],
            },
        ];
    }

    return [
        {
            id: 'init-report',
            role: 'assistant' as const,
            content: reportTitle
                ? `You are viewing **${reportTitle}**. Ask for a summary, key findings, policy recommendations, or source references and I will answer from this report only.`
                : 'Ask about this report and I will answer from the published CoSET material attached to it.',
            actions: ['Summarize this report', 'Key findings', 'Policy recommendations', 'Source references'],
        },
    ];
}

export function FloatingChatWidget({ mode = 'report', slug, reportTitle, topReports: providedTopReports }: FloatingChatWidgetProps) {
    const topReports = providedTopReports ?? EMPTY_TOP_REPORTS;
    const initialMessages = useMemo(
        () => buildInitialMessages(mode, reportTitle, topReports),
        [mode, reportTitle, topReports]
    );
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        const container = messagesContainerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        const shouldStickToBottom = distanceFromBottom < 96;

        if (shouldStickToBottom) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isLoading]);

    function updateAssistantMessage(messageId: string, updates: Partial<Message>) {
        setMessages((prev) => prev.map((message) => message.id === messageId ? { ...message, ...updates } : message));
    }

    async function handleSend(sourceText = input) {
        const trimmed = sourceText.trim();
        if (!trimmed || isLoading || (mode === 'report' && !slug)) {
            return;
        }

        const userMessage: Message = {
            id: buildMessageId('user'),
            role: 'user',
            content: trimmed,
        };
        const assistantMessageId = buildMessageId('assistant');

        setMessages((prev) => [
            ...prev,
            userMessage,
            { id: assistantMessageId, role: 'assistant', content: '', streaming: true },
        ]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed, slug, mode }),
            });

            const payload = response.headers.get('content-type')?.includes('application/json')
                ? await response.json()
                : null;

            if (!response.ok) {
                const fallback = payload?.error ?? 'Something went wrong while generating the response.';

                updateAssistantMessage(assistantMessageId, { content: fallback, streaming: false });
                return;
            }

            updateAssistantMessage(assistantMessageId, {
                content: payload?.content ?? 'I could not find a grounded answer for that request.',
                streaming: false,
            });
        } catch {
            updateAssistantMessage(assistantMessageId, {
                content: 'Connection error while contacting CoSET Intelligence.',
                streaming: false,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-ember/60 bg-ember text-white shadow-[0_18px_36px_rgb(2_6_23/0.35)] transition hover:-translate-y-1 hover:brightness-110"
                        aria-label="Open CoSET assistant"
                    >
                        <MessageCircle className="h-6 w-6 text-white" />
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-navy bg-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 28, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[calc(100vh-5rem)] w-[420px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-ember/25 bg-[#07111b] text-white shadow-[0_40px_120px_rgb(2_6_23/0.55)]"
                    >
                        <div className="flex items-center justify-between bg-ember px-4 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07111b] shadow-soft">
                                    <MessageCircle className="h-5 w-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-display text-lg font-extrabold leading-tight text-white">CoSET Assistant</p>
                                    <p className="truncate text-xs font-semibold text-white/82">
                                        {mode === 'report' ? 'Report chat' : 'Research chat'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-1.5 text-white/82 transition hover:bg-black/10 hover:text-white"
                                    aria-label="Close assistant"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-ember/15 bg-[#0b1724] px-4 py-2 text-xs font-medium text-ember">
                            {mode === 'report'
                                ? (reportTitle ?? 'CoSET Report Analysis')
                                : `${topReports.length} published reports available`}
                        </div>

                        <div ref={messagesContainerRef} className="flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#07111b] p-4 [scrollbar-color:rgb(255_170_86)_transparent] [scrollbar-width:thin]">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={clsx('flex gap-3', message.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                                >
                                    <div className="mt-1 shrink-0">
                                        <div
                                            className={clsx(
                                                'flex h-8 w-8 items-center justify-center rounded-full shadow-sm',
                                                message.role === 'assistant' ? 'bg-ember text-white' : 'bg-white/14 text-white'
                                            )}
                                        >
                                            {message.role === 'assistant'
                                                ? <MessageCircle className="h-4 w-4" />
                                                : <span className="text-xs font-bold">U</span>}
                                        </div>
                                    </div>
                                    <div
                                        className={clsx(
                                            'max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm',
                                            message.role === 'assistant'
                                                ? 'rounded-tl-sm border border-ember/12 bg-[#0d1a28] text-white'
                                                : 'rounded-tr-sm bg-ember text-white'
                                        )}
                                    >
                                        {message.streaming && !message.content ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-ember" />
                                                <span className="text-xs font-medium text-white/72">Thinking…</span>
                                            </div>
                                        ) : (
                                            <div>{renderMessageContent(message.content)}</div>
                                        )}

                                        {message.actions && message.actions.length > 0 && !message.streaming && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.actions.map((action) => (
                                                    <button
                                                        key={action}
                                                        type="button"
                                                        onClick={() => handleSend(action)}
                                                        disabled={isLoading}
                                                        className="rounded-lg border border-ember/18 bg-[#0a1521] px-2.5 py-1.5 text-left text-xs font-semibold text-ember transition hover:border-ember/45 hover:bg-[#102031] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
                                                    >
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSend();
                            }}
                            className="border-t border-ember/15 bg-[#07111b] p-3"
                        >
                            <div className="flex items-center gap-2 rounded-xl border border-ember/18 bg-[#0d1a28] px-3 py-1.5 transition focus-within:border-ember/70 focus-within:ring-2 focus-within:ring-ember/20">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(event) => setInput(event.target.value)}
                                    placeholder={mode === 'report' ? 'Ask this report...' : 'Ask about reports or policy...'}
                                    className="flex-1 bg-transparent py-2.5 text-sm text-white placeholder:text-white/56 outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="rounded-lg bg-ember p-2 text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Send message"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                </button>
                            </div>
                            <p className="mt-1.5 px-1 text-center text-[10px] text-white/56">
                                Grounded in published CoSET material.
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
