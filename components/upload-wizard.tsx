'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Database, FileText, ImagePlus, type LucideIcon, Presentation, UploadCloud } from 'lucide-react';
import { useMemo, useState } from 'react';

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

    const canAdvance = useMemo(() => {
        if (step === 0) return true;
        if (step === 1) return title.trim().length > 0 && summary.trim().length > 0;
        return true;
    }, [step, summary, title]);

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
                            {step === 0 ? <UploadStep /> : null}
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
                            {step === 2 ? <ReviewStep title={title} summary={summary} categories={categories} tags={tags} /> : null}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => setStep((current) => Math.max(current - 1, 0))}
                            className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-navy"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            disabled={!canAdvance}
                            onClick={() => setStep((current) => Math.min(current + 1, 2))}
                            className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {step === 2 ? 'Ready for AI Processing' : 'Continue'}
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
                        <p className="mb-5 text-sm text-white/70">Prepared for AI-assisted extraction, metadata population, and review approval.</p>
                        <button className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">Publish Report</button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function UploadStep() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-display text-3xl font-extrabold text-navy">Upload Intelligence</h2>
                <p className="mt-3 text-muted">Drag in PDFs, CSVs, PPTs, or policy papers to begin the extraction workflow.</p>
            </div>
            <div className="rounded-[2rem] border-2 border-dashed border-line bg-mist px-6 py-12 text-center">
                <div className="mx-auto mb-8 flex w-max items-center gap-3 rounded-full bg-panel px-6 py-3 shadow-soft">
                    <FileText className="h-5 w-5 text-navy" />
                    <Database className="h-5 w-5 text-ember" />
                    <Presentation className="h-5 w-5 text-teal" />
                </div>
                <UploadCloud className="mx-auto mb-4 h-12 w-12 text-navy" />
                <h3 className="font-display text-2xl font-bold text-navy">Drag & Drop Intel Assets</h3>
                <p className="mt-2 text-muted">Support for PDF, CSV, DOCX, and PPT up to 50MB.</p>
                <button className="mt-8 rounded-full bg-navy px-6 py-3 font-semibold text-white transition hover:bg-teal">Browse Files</button>
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

function ReviewStep({ title, summary, categories, tags }: { title: string; summary: string; categories: string[]; tags: string[] }) {
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