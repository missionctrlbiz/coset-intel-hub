'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Database, FileText, ImagePlus, type LucideIcon, Presentation, UploadCloud } from 'lucide-react';
import { useMemo, useRef, useState, useTransition } from 'react';

import { ChipInput } from '@/components/chip-input';

const steps = ['Upload File', 'Add Metadata', 'Review & Process'];
const stepProgressClasses = ['w-1/3', 'w-2/3', 'w-full'];

import { MetadataStep, ReviewStep, UploadStep } from './upload-wizard-steps';

export function UploadWizard() {
    const [step, setStep] = useState(0);
    const [categories, setCategories] = useState<string[]>(['Sustainability', '2024']);
    const [tags, setTags] = useState<string[]>(['Climate Resilience', 'Policy']);
    const [title, setTitle] = useState('Quarterly Sustainability Impact Report');
    const [summary, setSummary] = useState(
        'A premium intelligence brief mapping the socio-ecological patterns shaping climate adaptation, community resilience, and policy response.'
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [result, setResult] = useState<{ tone: 'error' | 'success'; message: string; reportSlug?: string } | null>(null);
    const [isPending, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);

    const canAdvance = useMemo(() => {
        if (step === 0) return selectedFile !== null && !isExtracting;
        if (step === 1) return title.trim().length > 0 && summary.trim().length > 0;
        return true;
    }, [selectedFile, step, summary, title, isExtracting]);

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
            // Request metadata extraction without persisting the draft yet.
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

            if (data.aiError) {
                setExtractionError(data.aiError);
            }

            setStep(1);
        } catch (error) {
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

    function persistDraft() {
        if (!selectedFile) {
            setResult({ tone: 'error', message: 'Choose a source file before creating a draft.' });
            return;
        }

        startTransition(async () => {
            try {
                const formData = new FormData();

                formData.append('file', selectedFile);
                formData.append('title', title);
                formData.append('summary', summary);
                categories.forEach((category) => formData.append('categories', category));
                tags.forEach((tag) => formData.append('tags', tag));

                const response = await fetch('/api/extract-from-file', {
                    body: formData,
                    method: 'POST',
                });

                const payload = await readApiResponse<{
                    error?: string;
                    message?: string;
                    report?: { slug: string };
                }>(response);

                if (!response.ok) {
                    setResult({ tone: 'error', message: payload?.error ?? 'We could not create the draft right now. Please try again.' });
                    return;
                }

                if (!payload) {
                    setResult({
                        tone: 'error',
                        message: 'We received an unexpected response while creating the draft. Please refresh the page and try again.',
                    });
                    return;
                }

                setResult({
                    tone: 'success',
                    message: payload.message ?? 'Draft created successfully and ready for review.',
                    reportSlug: payload.report?.slug,
                });
            } catch (error) {
                setResult({
                    tone: 'error',
                    message: 'We could not create the draft right now. Please try again.',
                });
            }
        });
    }

    function handleAdvance() {
        if (step === 0 && selectedFile) {
            extractMetadata(selectedFile);
            return;
        }

        if (step < 2) {
            setStep((current) => Math.min(current + 1, 2));
            return;
        }

        persistDraft();
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
                                />
                            ) : null}
                            {step === 2 ? <ReviewStep title={title} summary={summary} categories={categories} tags={tags} selectedFile={selectedFile} /> : null}
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
                                        Open content list
                                    </Link>
                                    {result.reportSlug ? <span className="text-xs uppercase tracking-[0.18em] text-muted">Draft slug: {result.reportSlug}</span> : null}
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {extractionError ? (
                        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                            <p>{extractionError}</p>
                        </div>
                    ) : null}

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
                            {step === 0 && isExtracting ? 'Extracting...' : step === 2 ? (isPending ? 'Saving Draft...' : 'Create Draft') : 'Continue'}
                        </button>
                    </div>
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
                                <p className="font-display text-lg font-bold text-navy">Featured Image</p>
                                <p className="mt-1 text-sm text-muted">Optional. Draft uploads can be created without a cover image.</p>
                            </div>
                            <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                                Optional
                            </span>
                        </div>
                        <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-mist px-5 text-center text-muted">
                            <ImagePlus className="h-8 w-8" />
                            <p className="mt-4 text-sm font-medium text-navy">No cover image selected in this step</p>
                            <p className="mt-2 max-w-xs text-xs leading-6 text-muted">
                                The report will use a default image until an editor adds a featured asset later in the content workflow.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                        <p className="mb-2 font-display text-lg font-bold">Publish Flow</p>
                        <p className="mb-5 text-sm text-white/70">Prepared for document extraction, metadata population, and review approval. Drafts are created when you finish step three.</p>
                        <button type="button" disabled className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white/90 opacity-70">
                            Publish Report
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
