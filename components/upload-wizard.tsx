'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Database, FileText, ImagePlus, type LucideIcon, Presentation, UploadCloud } from 'lucide-react';
import { useMemo, useRef, useState, useTransition } from 'react';

import { ChipInput } from '@/components/chip-input';

const steps = ['Upload File', 'Add Metadata', 'Review & Process'];
const stepProgressClasses = ['w-1/3', 'w-2/3', 'w-full'];
const uploadAssetCards: Array<{ title: string; copy: string; icon: LucideIcon }> = [
    { title: 'Reports', copy: 'Auto-summarize PDF reports', icon: FileText },
    { title: 'Datasets', copy: 'Extract CSV structures', icon: Database },
    { title: 'Presentations', copy: 'Analyze PPT visual data', icon: Presentation },
];

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

    async function extractMetadata(file: File) {
        setIsExtracting(true);
        setExtractionError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            // We tell the server not to persist yet, just return the extraction
            formData.append('previewOnly', 'true');

            const response = await fetch('/api/extract-from-file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

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

                const payload = (await response.json()) as {
                    error?: string;
                    message?: string;
                    report?: { slug: string };
                };

                if (!response.ok) {
                    setResult({ tone: 'error', message: payload.error ?? 'The draft could not be saved.' });
                    return;
                }

                setResult({
                    tone: 'success',
                    message: payload.message ?? 'Draft report saved to the database and queued for editorial review.',
                    reportSlug: payload.report?.slug,
                });
            } catch (error) {
                setResult({
                    tone: 'error',
                    message: error instanceof Error ? error.message : 'Unexpected upload error.',
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
                        <p className="mb-4 font-display text-lg font-bold text-navy">Featured Image</p>
                        <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-line bg-mist text-muted">
                            <ImagePlus className="h-8 w-8" />
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                        <p className="mb-2 font-display text-lg font-bold">Publish Flow</p>
                        <p className="mb-5 text-sm text-white/70">Prepared for AI-assisted extraction, metadata population, and review approval. Drafts are saved to Supabase when you finish step three.</p>
                        <button type="button" disabled className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white/90 opacity-70">
                            Publish Report
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function UploadStep({ onBrowse, onFileSelected, selectedFile }: { onBrowse: () => void; onFileSelected: (file: File | null) => void; selectedFile: File | null }) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-display text-3xl font-extrabold text-navy">Upload Intelligence</h2>
                <p className="mt-3 text-muted">Drag in PDFs, CSVs, PPTs, or policy papers to begin the extraction workflow.</p>
            </div>
            <div
                className="rounded-[2rem] border-2 border-dashed border-line bg-mist px-6 py-12 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();
                    onFileSelected(event.dataTransfer.files?.[0] ?? null);
                }}
            >
                <div className="mx-auto mb-8 flex w-max items-center gap-3 rounded-full bg-panel px-6 py-3 shadow-soft">
                    <FileText className="h-5 w-5 text-navy" />
                    <Database className="h-5 w-5 text-ember" />
                    <Presentation className="h-5 w-5 text-teal" />
                </div>
                <UploadCloud className="mx-auto mb-4 h-12 w-12 text-navy" />
                <h3 className="font-display text-2xl font-bold text-navy">Drag & Drop Intel Assets</h3>
                <p className="mt-2 text-muted">Support for PDF, CSV, DOCX, and PPT up to 50MB.</p>
                <button type="button" onClick={onBrowse} className="mt-8 rounded-full bg-navy px-6 py-3 font-semibold text-white transition hover:bg-teal">Browse Files</button>
                {selectedFile ? (
                    <div className="mx-auto mt-6 max-w-lg rounded-[1.5rem] border border-line bg-panel px-5 py-4 text-left shadow-soft">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Selected File</p>
                        <p className="mt-2 font-display text-xl font-bold text-navy">{selectedFile.name}</p>
                        <p className="mt-2 text-sm text-muted">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {uploadAssetCards.map(({ title, copy, icon: RenderedIcon }) => {
                    return (
                        <div key={title} className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
                            <RenderedIcon className="mb-3 h-5 w-5 text-navy" />
                            <p className="font-display text-sm font-bold text-navy">{title}</p>
                            <p className="mt-1 text-xs text-muted">{copy}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

type MetadataStepProps = {
    title: string;
    summary: string;
    categories: string[];
    tags: string[];
    setTitle: (value: string) => void;
    setSummary: (value: string) => void;
    setCategories: (value: string[]) => void;
    setTags: (value: string[]) => void;
};

function MetadataStep({ title, summary, categories, tags, setTitle, setSummary, setCategories, setTags }: MetadataStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Report Identity</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">Add the editorial metadata</h2>
            </div>
            <label className="block space-y-3">
                <span className="text-sm font-semibold text-navy">Title</span>
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-base font-medium text-navy shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                />
            </label>
            <label className="block space-y-3">
                <span className="text-sm font-semibold text-navy">Executive Summary</span>
                <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-sm text-navy shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                />
            </label>
            <ChipInput label="Category Tags" placeholder="Add category and press Enter" value={categories} onChange={setCategories} />
            <ChipInput label="Topics & Tags" placeholder="Add tag and press Enter" value={tags} onChange={setTags} limit={5} />
        </div>
    );
}

function ReviewStep({ title, summary, categories, tags, selectedFile }: { title: string; summary: string; categories: string[]; tags: string[]; selectedFile: File | null }) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Review & Process</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">Everything is ready for extraction</h2>
            </div>
            <div className="rounded-[2rem] border border-line bg-mist p-6">
                <div className="mb-5 flex items-center gap-3 text-teal">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Metadata validated. The AI pipeline can now generate HTML content and autofill structured fields.</p>
                </div>
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Source File</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{selectedFile?.name ?? 'No file selected yet'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Title</p>
                        <p className="mt-1 font-display text-2xl font-bold text-navy">{title}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Summary</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{summary}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Categories</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {categories.map((item) => (
                                <span key={item} className="rounded-full bg-panel px-3 py-1 text-sm font-medium text-navy shadow-soft">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Tags</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tags.map((item) => (
                                <span key={item} className="rounded-full bg-panel px-3 py-1 text-sm font-medium text-teal shadow-soft">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}