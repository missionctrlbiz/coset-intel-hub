'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ImagePlus } from 'lucide-react';
import { useMemo, useRef, useState, useTransition } from 'react';

import { MetadataStep, ReviewStep, UploadStep } from './upload-wizard-steps';

const steps = ['Upload File', 'Add Details', 'Review'];
const stepProgressClasses = ['w-1/3', 'w-2/3', 'w-full'];

type PublishIntent = 'draft' | 'scheduled' | 'published';

export type UploadWizardProps = {
    initialData?: {
        id: string;
        title: string;
        summary: string;
        content?: string;
        categories: string[];
        tags: string[];
        coverImagePath: string | null;
    } | null;
};

export function UploadWizard({ initialData }: UploadWizardProps = {}) {
    const [step, setStep] = useState(initialData ? 1 : 0);
    const [categories, setCategories] = useState<string[]>(initialData?.categories || ['Sustainability', '2024']);
    const [tags, setTags] = useState<string[]>(initialData?.tags || ['Climate Resilience', 'Policy']);
    const [title, setTitle] = useState(initialData?.title || 'Quarterly Sustainability Impact Report');
    const [summary, setSummary] = useState(
        initialData?.summary || 'A premium intelligence brief mapping the socio-ecological patterns shaping climate adaptation, community resilience, and policy response.'
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ tone: 'error' | 'success'; message: string; reportSlug?: string } | null>(null);
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
    const [sourceMode, setSourceMode] = useState<'file' | 'url' | 'paste'>('file');
    const [urlInput, setUrlInput] = useState('');
    const [pastedContent, setPastedContent] = useState('');
    const [isExtractingUrl, setIsExtractingUrl] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const attachmentFileRef = useRef<HTMLInputElement>(null);

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

            if ((data as { fullText?: string }).fullText) {
                setExtractedContent((data as { fullText?: string }).fullText ?? '');
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
        }
    }

    async function handlePasteAdvance() {
        setExtractedContent(pastedContent);
        setIsExtracting(true);
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
        startTransition(async () => {
            try {
                // Step 1: Save / update the report draft
                const formData = new FormData();
                if (selectedFile) {
                    formData.append('file', selectedFile);
                } else if (extractedContent && sourceMode !== 'file') {
                    formData.append('textContent', extractedContent);
                }
                if (attachmentFile) {
                    formData.append('downloadFile', attachmentFile);
                }
                formData.append('title', title);
                formData.append('summary', summary);
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
                        message: 'Report saved as draft and ready for review.',
                        reportSlug,
                    });
                    setPendingIntent(null);
                    return;
                }

                // Step 2: Deploy (publish or schedule)
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
                    ? 'Report published successfully and is now live.'
                    : `Report scheduled for ${scheduledAt ? new Date(scheduledAt).toLocaleString() : 'the selected date'}.`;

                setResult({ tone: 'success', message: successMsg, reportSlug });
                setPendingIntent(null);
            } catch {
                setResult({ tone: 'error', message: 'An error occurred. Please try again.' });
                setPendingIntent(null);
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

    return (
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
                        <span className={`text-xs font-bold uppercase tracking-[0.18em] ${index <= step ? 'text-navy' : 'text-muted'}`}>{label}</span>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
                <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-editorial sm:p-8">
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
                                    categories={categories}
                                    tags={tags}
                                    setTitle={setTitle}
                                    setSummary={setSummary}
                                    setCategories={setCategories}
                                    setTags={setTags}
                                    hasContent={!!extractedContent}
                                    onAnalyze={handleAnalyze}
                                    onBeautify={handleBeautify}
                                    isAnalyzing={isAnalyzing}
                                    isBeautifying={isBeautifying}
                                />
                            ) : null}
                            {step === 2 ? <ReviewStep title={title} summary={summary} categories={categories} tags={tags} selectedFile={selectedFile} coverImageFile={coverImageFile} /> : null}
                        </motion.div>
                    </AnimatePresence>

                    <input
                        ref={fileInputRef}
                        hidden
                        type="file"
                        accept=".pdf,.csv,.doc,.docx,.ppt,.pptx,.txt,.md,.json,.html,.xml"
                        onChange={(event) => handleFileSelection(event.target.files?.[0] ?? null)}
                    />

                    {result ? (
                        <div className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${result.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`}>
                            <p>{result.message}</p>
                            {result.tone === 'success' ? (
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <Link href="/admin/content" className="font-semibold text-navy underline-offset-4 hover:underline">
                                        Go to Manage Reports
                                    </Link>
                                    {result.reportSlug ? (
                                        <Link href={`/reports/${result.reportSlug}`} target="_blank" className="font-semibold text-teal underline-offset-4 hover:underline">
                                            View Report
                                        </Link>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {extractionError ? (
                        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                            <p>{extractionError}</p>
                        </div>
                    ) : null}

                    {/* Step navigation */}
                    {step < 2 ? (
                        <div className="mt-8 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setStep((current) => Math.max(current - 1, 0))}
                                disabled={isPending}
                                className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-navy"
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
                    ) : (
                        /* Step 2: Publish actions */
                        <div className="mt-8 space-y-5">
                            {showSchedulePicker && (
                                <div className="rounded-2xl border border-line bg-mist p-4">
                                    <label className="block space-y-2">
                                        <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                                            <Calendar className="h-4 w-4 text-ember" />
                                            Schedule publish date &amp; time
                                        </span>
                                        <input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-sm font-medium text-navy outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep((current) => Math.max(current - 1, 0))}
                                    disabled={isPending}
                                    className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-navy"
                                >
                                    Back
                                </button>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => executeSave('draft')}
                                        className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy transition hover:border-navy/60 hover:bg-mist disabled:opacity-40"
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
                        </div>
                    )}
                </div>

                <aside className="space-y-6">
                    <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                        <p className="mb-4 font-display text-lg font-bold text-navy">Metadata</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((item) => (
                                <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-navy">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <p className="font-display text-lg font-bold text-navy">Cover Image</p>
                                <p className="mt-1 text-sm text-muted">Optional. This image becomes the report&apos;s thumbnail.</p>
                            </div>
                            <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                                Optional
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => coverImageInputRef.current?.click()}
                            className="flex w-full aspect-[4/3] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-mist px-5 text-center text-muted transition hover:border-ember hover:bg-ember/5"
                        >
                            <ImagePlus className="h-8 w-8" />
                            {coverImageFile ? (
                                <>
                                    <p className="mt-4 text-sm font-semibold text-navy">{coverImageFile.name}</p>
                                    <p className="mt-1 text-xs text-muted">{(coverImageFile.size / 1024).toFixed(0)} KB &middot; Click to change</p>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4 text-sm font-medium text-navy">Click to choose a cover image</p>
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
                        <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-display text-lg font-bold text-navy">Downloadable File</p>
                                    <p className="mt-1 text-sm text-muted">Optional. Readers can download this direct from the report page.</p>
                                </div>
                                <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                                    Optional
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => attachmentFileRef.current?.click()}
                                className="flex w-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-line bg-mist px-5 py-8 text-center text-muted transition hover:border-ember hover:bg-ember/5"
                            >
                                {attachmentFile ? (
                                    <>
                                        <p className="text-sm font-semibold text-navy">{attachmentFile.name}</p>
                                        <p className="text-xs text-muted">{(attachmentFile.size / 1024).toFixed(0)} KB &middot; Click to change</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-navy">Click to attach a file</p>
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
    );
}
