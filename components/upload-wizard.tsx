'use client';

import confetti from 'canvas-confetti';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CheckCircle2, ChevronDown, Eye, ImagePlus, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { ChipInput } from '@/components/chip-input';
import { useTheme } from '@/components/theme-provider';
import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import { MetadataStep, ReviewStep, UploadStep } from './upload-wizard-steps';

const steps = ['Upload File', 'Add Details', 'Review'];
const stepProgressClasses = ['w-1/3', 'w-2/3', 'w-full'];

type PublishIntent = 'draft' | 'scheduled' | 'published';

type UploadResult = {
    tone: 'error' | 'success';
    message: string;
    reportSlug?: string;
    intent?: PublishIntent;
};

export type UploadWizardProps = {
    initialData?: {
        id: string;
        title: string;
        summary: string;
        content?: string;
        categories: string[];
        tags: string[];
        coverImagePath: string | null;
        sourceUrl?: string | null;
    } | null;
};

export function UploadWizard({ initialData }: UploadWizardProps = {}) {
    const { theme } = useTheme();
    const [step, setStep] = useState(initialData ? 1 : 0);
    const [categories, setCategories] = useState<string[]>(initialData?.categories ?? []);
    const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [summary, setSummary] = useState(initialData?.summary ?? '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [isPending, startTransition] = useTransition();
    const [pendingIntent, setPendingIntent] = useState<PublishIntent | null>(null);
    const [scheduledAt, setScheduledAt] = useState<string>('');
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);
    const [extractedContent, setExtractedContent] = useState<string>(initialData?.content ?? '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isBeautifying, setIsBeautifying] = useState(false);
    const [sourceMode, setSourceMode] = useState<'file' | 'url' | 'paste'>(initialData?.sourceUrl ? 'url' : 'file');
    const [urlInput, setUrlInput] = useState(initialData?.sourceUrl ?? '');
    const [pastedContent, setPastedContent] = useState('');
    const [isExtractingUrl, setIsExtractingUrl] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const attachmentFileRef = useRef<HTMLInputElement>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [pendingPhase, setPendingPhase] = useState<string | null>(null);
    const celebratedResultRef = useRef<string | null>(null);
    const previewHtml = useMemo(() => sanitizeHtml(extractedContent), [extractedContent]);

    useEffect(() => {
        if (coverImageFile) {
            const objectUrl = URL.createObjectURL(coverImageFile);
            setCoverImagePreview(objectUrl);

            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        }

        if (initialData?.coverImagePath && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            setCoverImagePreview(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${initialData.coverImagePath}`);
            return;
        }

        setCoverImagePreview(null);
    }, [coverImageFile, initialData?.coverImagePath]);

    useEffect(() => {
        if (!result || result.tone !== 'success') {
            celebratedResultRef.current = null;
            return;
        }

        const celebrationKey = `${result.reportSlug ?? 'no-slug'}:${result.message}`;
        if (celebratedResultRef.current === celebrationKey) {
            return;
        }

        celebratedResultRef.current = celebrationKey;

        if (typeof window === 'undefined') {
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        const originY = theme === 'dark' ? 0.62 : 0.58;

        void confetti({
            angle: 60,
            spread: 64,
            particleCount: 80,
            startVelocity: 42,
            origin: { x: 0.18, y: originY },
        });

        void confetti({
            angle: 120,
            spread: 64,
            particleCount: 80,
            startVelocity: 42,
            origin: { x: 0.82, y: originY },
        });
    }, [result, theme]);

    useEffect(() => {
        if (!result || result.tone !== 'success') {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                dismissSuccessModal();
            }
        }

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [result]);

    const canAdvance = useMemo(() => {
        if (step === 0) {
            if (sourceMode === 'file') return selectedFile !== null && !isExtracting;
            if (sourceMode === 'url') return urlInput.trim().length > 0 && !isExtractingUrl;
            if (sourceMode === 'paste') return pastedContent.trim().length > 0;
            return false;
        }
        if (step === 1) return title.trim().length > 0 && summary.trim().length > 0;
        return true;
    }, [selectedFile, step, summary, title, isExtracting, sourceMode, urlInput, isExtractingUrl, pastedContent]);

    async function readApiResponse<T extends Record<string, unknown>>(response: Response): Promise<T | null> {
        const contentType = response.headers.get('content-type') ?? '';
        const responseText = await response.text();

        if (!responseText.trim()) {
            return null;
        }

        if (contentType.includes('application/json')) {
            return JSON.parse(responseText) as T;
        }

        return null;
    }

    async function extractMetadata(file: File) {
        setIsExtracting(true);
        setExtractionError(null);
        setPendingPhase('Reading the file and preparing the first draft...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('previewOnly', 'true');

            const response = await fetch('/api/extract-from-file', {
                method: 'POST',
                body: formData,
            });

            const data = await readApiResponse<{
                aiDraft?: {
                    title?: string;
                    summary?: string;
                    category?: string[];
                    tags?: string[];
                };
                beautifiedHtml?: string;
                fullText?: string;
                aiError?: string;
                error?: string;
            }>(response);

            if (!response.ok) {
                setExtractionError(data?.error ?? 'We could not extract document details right now. You can still continue and enter them manually.');
                setStep(1);
                return;
            }

            if (!data) {
                setExtractionError('We could not read the extraction response. You can still continue and enter the details manually.');
                setStep(1);
                return;
            }

            if (data.aiDraft) {
                if (data.aiDraft.title) setTitle(data.aiDraft.title);
                if (data.aiDraft.summary) setSummary(data.aiDraft.summary);
                if (data.aiDraft.category) setCategories(data.aiDraft.category);
                if (data.aiDraft.tags) setTags(data.aiDraft.tags);
            }

            if (data?.beautifiedHtml || data?.fullText) {
                setExtractedContent(data.beautifiedHtml ?? data.fullText ?? '');
            }

            if (data.aiError) {
                setExtractionError(data.aiError);
            }

            setStep(1);
        } catch {
            setExtractionError('Failed to parse document for metadata extraction.');
            setStep(1);
        } finally {
            setIsExtracting(false);
            setPendingPhase(null);
        }
    }

    function handleFileSelection(file: File | null) {
        setSelectedFile(file);
        setResult(null);
    }

    async function handleAnalyze() {
        if (!extractedContent) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: extractedContent }),
            });
            const data = await readApiResponse<{
                success?: boolean;
                metadata?: { title?: string; summary?: string; category?: string[]; tags?: string[] };
                error?: string;
            }>(response);
            if (data?.metadata) {
                if (data.metadata.title) setTitle(data.metadata.title);
                if (data.metadata.summary) setSummary(data.metadata.summary);
                if (data.metadata.category) setCategories(data.metadata.category);
                if (data.metadata.tags) setTags(data.metadata.tags);
            }
        } catch {
            // Silently fail — fields keep their current values
        } finally {
            setIsAnalyzing(false);
        }
    }

    async function handleBeautify() {
        if (!extractedContent) return;
        setIsBeautifying(true);
        try {
            const response = await fetch('/api/beautify-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: extractedContent }),
            });
            const data = await readApiResponse<{
                success?: boolean;
                formattedHtml?: string;
                error?: string;
            }>(response);
            if (data?.formattedHtml) {
                setExtractedContent(data.formattedHtml);
            }
        } catch {
            // Silently fail
        } finally {
            setIsBeautifying(false);
        }
    }

    async function handleExtractUrl() {
        if (!urlInput.trim()) return;
        setIsExtractingUrl(true);
        setUrlError(null);
        setPendingPhase('Fetching the page and drafting the report details...');
        try {
            const response = await fetch('/api/extract-from-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput.trim(), previewOnly: true }),
            });
            const data = await readApiResponse<{
                success?: boolean;
                aiDraft?: { title?: string; summary?: string; category?: string[]; tags?: string[]; formattedContent?: string };
                aiError?: string;
                error?: string;
            }>(response);
            if (!response.ok || !data?.success) {
                setUrlError(data?.error ?? 'Could not extract the page. Try pasting the content instead.');
                return;
            }
            if (data.aiDraft) {
                if (data.aiDraft.title) setTitle(data.aiDraft.title);
                if (data.aiDraft.summary) setSummary(data.aiDraft.summary);
                if (data.aiDraft.category) setCategories(data.aiDraft.category);
                if (data.aiDraft.tags) setTags(data.aiDraft.tags);
                if (data.aiDraft.formattedContent) setExtractedContent(data.aiDraft.formattedContent);
            }
            if (data?.aiError) setUrlError(data.aiError);
            setStep(1);
        } catch {
            setUrlError('Could not extract the URL. Please check the address or paste the content directly.');
        } finally {
            setIsExtractingUrl(false);
            setPendingPhase(null);
        }
    }

    async function handlePasteAdvance() {
        setExtractedContent(pastedContent);
        setIsExtracting(true);
        setPendingPhase('Analyzing the pasted content and preparing the draft...');
        try {
            const response = await fetch('/api/analyze-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: pastedContent }),
            });
            const data = await readApiResponse<{
                success?: boolean;
                metadata?: { title?: string; summary?: string; category?: string[]; tags?: string[] };
                error?: string;
            }>(response);
            if (data?.metadata) {
                if (data.metadata.title) setTitle(data.metadata.title);
                if (data.metadata.summary) setSummary(data.metadata.summary);
                if (data.metadata.category) setCategories(data.metadata.category);
                if (data.metadata.tags) setTags(data.metadata.tags);
            }
        } catch {
            // Silently fail — proceed to step 1
        } finally {
            setIsExtracting(false);
            setPendingPhase(null);
        }
        setStep(1);
    }

    function executeSave(intent: PublishIntent) {
        if (intent === 'scheduled' && !scheduledAt) {
            setShowSchedulePicker(true);
            return;
        }

        const hasSource = !!selectedFile || (sourceMode !== 'file' && !!extractedContent);
        if (!hasSource && !initialData) {
            setResult({ tone: 'error', message: 'Choose a source file, enter a URL, or paste content before saving.' });
            return;
        }

        setPendingIntent(intent);
        setPendingPhase(
            intent === 'draft'
                ? 'Saving the report draft...'
                : intent === 'scheduled'
                    ? 'Saving the report and scheduling publication...'
                    : 'Saving the report and preparing publication...'
        );
        startTransition(async () => {
            try {
                // Step 1: Save / update the report draft
                const formData = new FormData();
                if (selectedFile) {
                    formData.append('file', selectedFile);
                    if (extractedContent) {
                        formData.append('textContent', extractedContent);
                    }
                } else if (extractedContent && sourceMode !== 'file') {
                    formData.append('textContent', extractedContent);
                }
                if (attachmentFile) {
                    formData.append('downloadFile', attachmentFile);
                }
                formData.append('title', title);
                formData.append('summary', summary);
                if (urlInput.trim()) {
                    formData.append('sourceUrl', urlInput.trim());
                }
                if (initialData?.id) {
                    formData.append('id', String(initialData.id));
                }
                if (initialData?.coverImagePath) {
                    formData.append('coverImagePath', initialData.coverImagePath);
                }
                if (coverImageFile) {
                    formData.append('coverImage', coverImageFile);
                }
                categories.forEach((cat) => formData.append('categories', cat));
                tags.forEach((tag) => formData.append('tags', tag));

                const saveResponse = await fetch('/api/extract-from-file', {
                    body: formData,
                    method: 'POST',
                });

                const savePayload = await readApiResponse<{
                    error?: string;
                    message?: string;
                    report?: { id: string; slug: string };
                }>(saveResponse);

                if (!saveResponse.ok) {
                    setResult({ tone: 'error', message: savePayload?.error ?? 'Could not save the report. Please try again.' });
                    setPendingIntent(null);
                    return;
                }

                if (!savePayload?.report) {
                    setResult({ tone: 'error', message: 'Unexpected response from server. Please refresh and try again.' });
                    setPendingIntent(null);
                    return;
                }

                const reportId = savePayload.report.id;
                const reportSlug = savePayload.report.slug;

                // If saving as draft, we're done
                if (intent === 'draft') {
                    setResult({
                        tone: 'success',
                        message: urlInput.trim()
                            ? 'Report saved as draft with its source link and is ready for review.'
                            : 'Report saved as draft and ready for review.',
                        reportSlug,
                        intent,
                    });
                    setShowSchedulePicker(false);
                    setPendingIntent(null);
                    setPendingPhase(null);
                    return;
                }

                // Step 2: Deploy (publish or schedule)
                setPendingPhase(intent === 'published' ? 'Publishing the saved draft live...' : 'Scheduling the saved draft...');
                const deployResponse = await fetch('/api/reports/deploy', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reportId,
                        status: intent,
                        ...(intent === 'scheduled' && scheduledAt ? { scheduledAt } : {}),
                    }),
                });

                const deployPayload = await readApiResponse<{
                    error?: string;
                    message?: string;
                }>(deployResponse);

                if (!deployResponse.ok) {
                    setResult({
                        tone: 'error',
                        message: deployPayload?.error ?? 'Saved draft but could not publish. Try again from Manage Reports.',
                    });
                    setPendingIntent(null);
                    return;
                }

                const successMsg = intent === 'published'
                    ? (urlInput.trim()
                        ? 'Report published successfully and is now live with its source reference attached.'
                        : 'Report published successfully and is now live.')
                    : `Report scheduled for ${scheduledAt ? new Date(scheduledAt).toLocaleString() : 'the selected date'}.`;

                setResult({ tone: 'success', message: successMsg, reportSlug, intent });
                setShowSchedulePicker(false);
                setPendingIntent(null);
                setPendingPhase(null);
            } catch {
                setResult({ tone: 'error', message: 'An error occurred. Please try again.' });
                setPendingIntent(null);
                setPendingPhase(null);
            }
        });
    }

    function handleAdvance() {
        if (step === 0) {
            if (sourceMode === 'file' && selectedFile) {
                extractMetadata(selectedFile);
            } else if (sourceMode === 'url') {
                handleExtractUrl();
            } else if (sourceMode === 'paste') {
                handlePasteAdvance();
            }
            return;
        }

        if (step < 2) {
            setStep((current) => Math.min(current + 1, 2));
            return;
        }
    }

    function dismissSuccessModal() {
        setResult((current) => (current?.tone === 'success' ? null : current));
    }

    return (
        <>
            <div className="space-y-8">
                <div className="relative grid gap-5 md:grid-cols-3">
                <div className="absolute left-0 top-5 hidden h-px w-full bg-line md:block" />
                <div className={`absolute left-0 top-5 hidden h-px bg-ember transition-all md:block ${stepProgressClasses[step]}`} />
                {steps.map((label, index) => (
                    <div key={label} className="relative flex flex-col items-center gap-3 text-center">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold ${index <= step ? 'bg-ember text-white shadow-soft' : 'bg-slate-200 text-muted'
                                }`}
                        >
                            {index + 1}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-[0.18em] ${index <= step ? 'text-ink dark:text-white' : 'text-muted'}`}>{label}</span>
                    </div>
                ))}
                </div>

                <div className="items-start gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1.1fr)_320px]">
                    <div className="self-start rounded-[2rem] border border-line bg-panel p-6 shadow-editorial dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/70 sm:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {step === 0 ? (
                                    <UploadStep
                                        onBrowse={() => fileInputRef.current?.click()}
                                        onFileSelected={handleFileSelection}
                                        selectedFile={selectedFile}
                                        sourceMode={sourceMode}
                                        setSourceMode={setSourceMode}
                                        urlInput={urlInput}
                                        setUrlInput={setUrlInput}
                                        pastedContent={pastedContent}
                                        setPastedContent={setPastedContent}
                                        isExtractingUrl={isExtractingUrl}
                                        urlError={urlError}
                                    />
                                ) : null}
                                {step === 1 ? (
                                    <MetadataStep
                                        title={title}
                                        summary={summary}
                                        sourceMode={sourceMode}
                                        sourceUrl={urlInput}
                                        categories={categories}
                                        tags={tags}
                                        setTitle={setTitle}
                                        setSummary={setSummary}
                                        setSourceUrl={setUrlInput}
                                        setCategories={setCategories}
                                        setTags={setTags}
                                        hasContent={!!extractedContent}
                                        onAnalyze={handleAnalyze}
                                        onBeautify={handleBeautify}
                                        isAnalyzing={isAnalyzing}
                                        isBeautifying={isBeautifying}
                                    />
                                ) : null}
                                {step === 2 ? <ReviewStep title={title} summary={summary} sourceMode={sourceMode} sourceUrl={urlInput} categories={categories} tags={tags} selectedFile={selectedFile} coverImageFile={coverImageFile} coverImagePreview={coverImagePreview} /> : null}
                            </motion.div>
                        </AnimatePresence>

                        <input
                            ref={fileInputRef}
                            hidden
                            type="file"
                            accept=".pdf,.csv,.doc,.docx,.ppt,.pptx,.txt,.md,.json,.html,.xml"
                            onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                        />

                        {/* HTML content preview */}
                        {step >= 1 && extractedContent ? (
                            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-line bg-mist dark:bg-panel-alt/70">
                                <button
                                    type="button"
                                    onClick={() => setPreviewOpen((o) => !o)}
                                    className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold text-ink dark:text-white"
                                >
                                    <span className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-ember" />
                                        Preview Extracted Content
                                    </span>
                                    <ChevronDown className={cn('h-4 w-4 text-muted transition-transform', previewOpen && 'rotate-180')} />
                                </button>
                                {previewOpen ? (
                                    <div className="max-h-[520px] overflow-y-auto border-t border-line bg-panel-alt/40 px-5 py-5 dark:bg-panel/70">
                                        <div className="report-prose report-prose--preview prose prose-sm max-w-none rounded-[1.5rem] border border-line p-5 sm:p-6">
                                            <div
                                                className="report-prose__content"
                                                // eslint-disable-next-line react/no-danger
                                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                                            />
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {result?.tone === 'error' ? (
                            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-900">
                                <p>{result.message}</p>
                            </div>
                        ) : null}

                        {extractionError ? (
                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                                <p>{extractionError}</p>
                            </div>
                        ) : null}

                        {/* Step navigation */}
                        {step < 2 ? (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep((current) => Math.max(current - 1, 0))}
                                        disabled={isPending}
                                        className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-ink dark:hover:text-white"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canAdvance}
                                        onClick={handleAdvance}
                                        className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {step === 0 && (isExtracting || isExtractingUrl)
                                            ? isExtractingUrl ? 'Importing…' : 'Extracting…'
                                            : 'Continue'}
                                    </button>
                                </div>
                                {pendingPhase ? (
                                    <p className="text-sm font-medium text-muted">
                                        {pendingPhase}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            /* Step 2: Publish actions */
                            <div className="mt-8 space-y-5">
                                {showSchedulePicker && (
                                    <div className="rounded-2xl border border-line bg-mist p-4">
                                        <label className="block space-y-2">
                                            <span className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
                                                <Calendar className="h-4 w-4 text-ember" />
                                                Schedule publish date &amp; time
                                            </span>
                                            <input
                                                type="datetime-local"
                                                value={scheduledAt}
                                                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                                onChange={(e) => setScheduledAt(e.target.value)}
                                                className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep((current) => Math.max(current - 1, 0))}
                                        disabled={isPending}
                                        className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-ink dark:hover:text-white"
                                    >
                                        Back
                                    </button>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={isPending}
                                            onClick={() => executeSave('draft')}
                                            className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:border-navy/60 hover:bg-mist dark:hover:bg-white/5 disabled:opacity-40"
                                        >
                                            {pendingIntent === 'draft' ? 'Saving...' : 'Save as Draft'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isPending || (showSchedulePicker && !scheduledAt)}
                                            onClick={() => {
                                                if (!showSchedulePicker) {
                                                    setShowSchedulePicker(true);
                                                } else {
                                                    executeSave('scheduled');
                                                }
                                            }}
                                            className="rounded-full border border-teal bg-teal/10 px-5 py-3 text-sm font-semibold text-teal transition hover:bg-teal/20 disabled:opacity-40"
                                        >
                                            {pendingIntent === 'scheduled' ? 'Scheduling...' : showSchedulePicker ? 'Confirm Schedule' : 'Schedule'}
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isPending}
                                            onClick={() => executeSave('published')}
                                            className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110 disabled:opacity-40"
                                        >
                                            {pendingIntent === 'published' ? 'Publishing...' : 'Publish Now'}
                                        </button>
                                    </div>
                                </div>
                                {pendingPhase ? (
                                    <p className="text-sm font-medium text-muted">
                                        {pendingPhase}
                                    </p>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <aside className="self-start space-y-5 lg:sticky lg:top-24">
                        <div className="rounded-[2rem] border border-line bg-panel p-5 shadow-soft dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/70">
                            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-ember">Classification</p>
                            <p className="mb-4 font-display text-lg font-bold text-ink">Categories &amp; Tags</p>
                            <div className="space-y-4">
                                <ChipInput
                                    label="Categories"
                                    placeholder="Add category and press Enter"
                                    value={categories}
                                    onChange={setCategories}
                                />
                                <ChipInput
                                    label="Tags"
                                    placeholder="Add tag and press Enter"
                                    value={tags}
                                    onChange={setTags}
                                    limit={10}
                                />
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-line bg-panel p-5 shadow-soft dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/70">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-display text-lg font-bold text-ink">Cover Image</p>
                                    <p className="mt-1 text-sm text-muted">Optional. This image becomes the report&apos;s thumbnail.</p>
                                </div>
                                <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                                    Optional
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => coverImageInputRef.current?.click()}
                                className="flex w-full min-h-[150px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-mist px-5 text-center text-muted transition hover:border-ember hover:bg-ember/5 dark:bg-panel-alt/70"
                            >
                                {coverImagePreview ? (
                                    <>
                                        <div className="relative -mx-5 -mt-0 mb-4 h-44 w-[calc(100%+2.5rem)] overflow-hidden rounded-[1.25rem] border border-line bg-panel shadow-soft">
                                            <Image
                                                src={coverImagePreview}
                                                alt="Cover preview"
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 100vw, 720px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <p className="text-sm font-semibold text-ink">{coverImageFile ? coverImageFile.name : 'Current cover image'}</p>
                                        <p className="mt-1 text-xs text-muted">
                                            {coverImageFile ? `${(coverImageFile.size / 1024).toFixed(0)} KB · Click to change` : 'Click to replace this cover image'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className="h-8 w-8" />
                                        <p className="mt-4 text-sm font-medium text-ink">Click to choose a cover image</p>
                                        <p className="mt-2 max-w-xs text-xs leading-6 text-muted">
                                            JPG, PNG, or WebP. Shown as the report&apos;s cover thumbnail.
                                        </p>
                                    </>
                                )}
                            </button>
                            <input
                                ref={coverImageInputRef}
                                hidden
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
                            />
                        </div>

                        {step >= 1 ? (
                            <div className="rounded-[2rem] border border-line bg-panel p-5 shadow-soft dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/70">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-display text-lg font-bold text-ink">Downloadable File</p>
                                        <p className="mt-1 text-sm text-muted">Optional. Readers can download this direct from the report page.</p>
                                    </div>
                                    <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                                        Optional
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => attachmentFileRef.current?.click()}
                                    className="flex w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-line bg-mist px-5 py-8 text-center text-muted transition hover:border-ember hover:bg-ember/5 dark:bg-panel-alt/70"
                                >
                                    {attachmentFile ? (
                                        <>
                                            <p className="text-sm font-semibold text-ink">{attachmentFile.name}</p>
                                            <p className="text-xs text-muted">{(attachmentFile.size / 1024).toFixed(0)} KB &middot; Click to change</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-ink">Click to attach a file</p>
                                            <p className="max-w-xs text-xs leading-6 text-muted">
                                                PDF, DOCX, PPTX, XLSX, or CSV. Shown as a download button on the report page.
                                            </p>
                                        </>
                                    )}
                                </button>
                                <input
                                    ref={attachmentFileRef}
                                    hidden
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.csv,.xls,.xlsx"
                                    onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                        ) : null}
                    </aside>
                </div>
            </div>

            <AnimatePresence>
                {result?.tone === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/65 px-4 py-6 backdrop-blur-sm"
                        onClick={(event) => {
                            if (event.target === event.currentTarget) {
                                dismissSuccessModal();
                            }
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.98 }}
                            transition={{ duration: 0.24, ease: 'easeOut' }}
                            className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-line bg-panel shadow-editorial dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(26,32,44,0.96))]"
                        >
                            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(233,115,22,0.18),transparent_72%)] dark:bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.22),transparent_72%)]" />

                            <button
                                type="button"
                                onClick={dismissSuccessModal}
                                aria-label="Close success dialog"
                                className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-muted transition hover:text-ink dark:bg-white/5 dark:hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="relative px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
                                <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                                    <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-soft">
                                        <CheckCircle2 className="h-7 w-7" />
                                    </div>

                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/90">
                                        Publication Ready
                                    </p>
                                    <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-white sm:text-[2.4rem]">
                                        {result.intent === 'scheduled'
                                            ? 'Report scheduled successfully'
                                            : result.intent === 'published'
                                                ? 'Report published successfully'
                                                : 'Draft saved successfully'}
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                                        {result.message}
                                    </p>
                                </div>

                                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                                    <Link
                                        href="/admin/content"
                                        onClick={dismissSuccessModal}
                                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
                                    >
                                        Go to Manage Reports
                                    </Link>
                                    {result.reportSlug ? (
                                        <Link
                                            href={`/reports/${result.reportSlug}`}
                                            target="_blank"
                                            onClick={dismissSuccessModal}
                                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-panel-alt px-6 py-3 text-sm font-semibold text-navy transition hover:border-ember hover:text-ember dark:bg-white/5 dark:text-white dark:hover:border-ember dark:hover:text-ember"
                                        >
                                            View Report
                                        </Link>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={dismissSuccessModal}
                                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-mist px-6 py-3 text-sm font-semibold text-ink transition hover:border-navy hover:text-navy dark:bg-white/5 dark:text-white dark:hover:border-ember dark:hover:text-ember"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
