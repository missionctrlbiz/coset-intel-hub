import Image from 'next/image';
import { CheckCircle2, Database, FileText, Globe, Presentation, Sparkles, UploadCloud, Wand2 } from 'lucide-react';
import { ChipInput } from '@/components/chip-input';

export type UploadStepProps = {
    onBrowse: () => void;
    onFileSelected: (file: File | null) => void;
    selectedFile: File | null;
    sourceMode: 'file' | 'url' | 'paste';
    setSourceMode: (mode: 'file' | 'url' | 'paste') => void;
    urlInput: string;
    setUrlInput: (v: string) => void;
    pastedContent: string;
    setPastedContent: (v: string) => void;
    isExtractingUrl: boolean;
    urlError: string | null;
};

export function UploadStep({
    onBrowse,
    onFileSelected,
    selectedFile,
    sourceMode,
    setSourceMode,
    urlInput,
    setUrlInput,
    pastedContent,
    setPastedContent,
    isExtractingUrl,
    urlError,
}: UploadStepProps) {
    const tabs: { key: 'file' | 'url' | 'paste'; label: string }[] = [
        { key: 'file', label: 'Upload File' },
        { key: 'url', label: 'From URL' },
        { key: 'paste', label: 'Paste Content' },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="font-display text-3xl font-extrabold text-ink">Add Source</h2>
                <p className="mt-3 text-muted">Upload a file, import from a URL, or paste content directly.</p>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-2xl border border-line bg-mist p-1">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setSourceMode(key)}
                        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${sourceMode === key
                            ? 'bg-panel text-ink shadow-soft'
                            : 'text-muted hover:text-ink'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* File upload tab */}
            {sourceMode === 'file' ? (
                <>
                    <div
                        className="rounded-[2rem] border-2 border-dashed border-line bg-mist px-6 py-12 text-center"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                            event.preventDefault();
                            onFileSelected(event.dataTransfer.files?.[0] ?? null);
                        }}
                    >
                        <div className="mx-auto mb-8 flex w-max items-center gap-3 rounded-full bg-panel px-6 py-3 shadow-soft">
                            <FileText className="h-5 w-5 text-ink" />
                            <Database className="h-5 w-5 text-ember" />
                            <Presentation className="h-5 w-5 text-teal" />
                        </div>
                        <UploadCloud className="mx-auto mb-4 h-12 w-12 text-ink" />
                        <h3 className="font-display text-2xl font-bold text-ink">Drag &amp; Drop Intel Assets</h3>
                        <p className="mt-2 text-muted">Support for PDF, CSV, DOCX, and PPT up to 50MB.</p>
                        <button type="button" onClick={onBrowse} className="mt-8 rounded-full bg-navy px-6 py-3 font-semibold text-white transition hover:bg-teal">
                            Browse Files
                        </button>
                        {selectedFile ? (
                            <div className="mx-auto mt-6 max-w-lg rounded-[1.5rem] border border-line bg-panel px-5 py-4 text-left shadow-soft">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Selected File</p>
                                <p className="mt-2 font-display text-xl font-bold text-ink">{selectedFile.name}</p>
                                <p className="mt-2 text-sm text-muted">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        ) : null}
                    </div>
                </>
            ) : null}

            {/* URL tab */}
            {sourceMode === 'url' ? (
                <div className="space-y-5">
                    <div className="rounded-[2rem] border border-line bg-mist px-6 py-8">
                        <div className="mb-4 flex items-center gap-3">
                            <Globe className="h-6 w-6 text-ink" />
                            <h3 className="font-display text-lg font-bold text-ink">Import from URL</h3>
                        </div>
                        <label className="block space-y-3">
                            <span className="text-sm font-semibold text-navy dark:text-white">Page URL</span>
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="https://example.com/report"
                                className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-base font-medium text-ink shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                            />
                        </label>
                        {urlError ? (
                            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{urlError}</p>
                        ) : null}
                        <p className="mt-4 text-sm leading-6 text-muted">
                            We&apos;ll fetch the page and extract the main article content. Pages that require a login or are fully JavaScript-rendered may not work — use Paste Content instead.
                        </p>
                        {isExtractingUrl ? (
                            <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-ember border-t-transparent" />
                                Importing content from URL&hellip;
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {/* Paste content tab */}
            {sourceMode === 'paste' ? (
                <div className="space-y-4">
                    <label className="block space-y-3">
                        <span className="text-sm font-semibold text-navy dark:text-white">Report content</span>
                        <textarea
                            value={pastedContent}
                            onChange={(e) => setPastedContent(e.target.value)}
                            rows={14}
                            placeholder="Paste your report text or HTML here&hellip;"
                            className="w-full rounded-2xl border border-line bg-panel px-4 py-4 font-mono text-sm text-ink shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                        />
                    </label>
                    <p className="text-xs text-muted">Plain text and HTML are both supported. Click Continue to auto-fill the report details.</p>
                </div>
            ) : null}
        </div>
    );
}

export type MetadataStepProps = {
    title: string;
    summary: string;
    sourceMode: 'file' | 'url' | 'paste';
    sourceUrl: string;
    categories: string[];
    tags: string[];
    setTitle: (value: string) => void;
    setSummary: (value: string) => void;
    setSourceUrl: (value: string) => void;
    setCategories: (value: string[]) => void;
    setTags: (value: string[]) => void;
    hasContent?: boolean;
    onAnalyze?: () => void;
    onBeautify?: () => void;
    isAnalyzing?: boolean;
    isBeautifying?: boolean;
};

export function MetadataStep({ title, summary, sourceMode, sourceUrl, categories, tags, setTitle, setSummary, setSourceUrl, setCategories, setTags, hasContent, onAnalyze, onBeautify, isAnalyzing, isBeautifying }: MetadataStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Report Identity</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">Add Report Details</h2>
            </div>
            {hasContent && (onAnalyze || onBeautify) ? (
                <div className="flex flex-wrap gap-3">
                    {onAnalyze ? (
                        <button
                            type="button"
                            onClick={onAnalyze}
                            disabled={isAnalyzing || isBeautifying}
                            className="flex items-center gap-2 rounded-full border border-ember/30 bg-ember/5 px-4 py-2 text-sm font-semibold text-ember transition hover:bg-ember/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Sparkles className="h-4 w-4" />
                            {isAnalyzing ? 'Analyzing\u2026' : 'Auto-fill details'}
                        </button>
                    ) : null}
                    {onBeautify ? (
                        <button
                            type="button"
                            onClick={onBeautify}
                            disabled={isAnalyzing || isBeautifying}
                            className="flex items-center gap-2 rounded-full border border-teal/30 bg-teal/5 px-4 py-2 text-sm font-semibold text-teal transition hover:bg-teal/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Wand2 className="h-4 w-4" />
                            {isBeautifying ? 'Enhancing\u2026' : 'Enhance formatting'}
                        </button>
                    ) : null}
                </div>
            ) : null}
            <label className="block space-y-3">
                <span className="text-sm font-semibold text-navy dark:text-white">Title</span>
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-base font-medium text-ink shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                />
            </label>
            <label className="block space-y-3">
                <span className="text-sm font-semibold text-navy dark:text-white">Executive Summary</span>
                <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-sm text-ink shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                />
            </label>
            <label className="block space-y-3">
                <span className="text-sm font-semibold text-navy dark:text-white">Source Link</span>
                <input
                    type="url"
                    value={sourceUrl}
                    onChange={(event) => setSourceUrl(event.target.value)}
                    placeholder={sourceMode === 'url' ? 'https://example.com/report' : 'Optional source reference URL'}
                    className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-base font-medium text-ink shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
                />
                <p className="text-xs text-muted">
                    {sourceMode === 'url' ? 'This imported page will be saved as the report source.' : 'Optional. Add a public source link readers can trace back to.'}
                </p>
            </label>
            <ChipInput label="Category Tags" placeholder="Add category and press Enter" value={categories} onChange={setCategories} />
            <ChipInput label="Topics & Tags" placeholder="Add tag and press Enter" value={tags} onChange={setTags} limit={5} />
        </div>
    );
}

export function ReviewStep({ title, summary, sourceMode, sourceUrl, categories, tags, selectedFile, coverImageFile, coverImagePreview }: { title: string; summary: string; sourceMode: 'file' | 'url' | 'paste'; sourceUrl: string; categories: string[]; tags: string[]; selectedFile: File | null; coverImageFile?: File | null; coverImagePreview?: string | null }) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Review</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">Everything is ready for extraction</h2>
            </div>
            <div className="rounded-[2rem] border border-line bg-mist p-6">
                <div className="mb-5 flex items-center gap-3 text-teal">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Review your report details and draft the content.</p>
                </div>
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Source Type</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{sourceMode === 'file' ? 'File upload' : sourceMode === 'url' ? 'Imported URL' : 'Pasted content'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Source File</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{selectedFile?.name ?? (sourceMode === 'file' ? 'No file selected yet' : 'No uploaded file attached')}</p>
                    </div>
                    {sourceUrl ? (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Source Link</p>
                            <p className="mt-1 break-all text-sm leading-7 text-muted">{sourceUrl}</p>
                        </div>
                    ) : null}
                    {sourceMode === 'url' && !sourceUrl ? (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Source Link</p>
                            <p className="mt-1 text-sm leading-7 text-muted">No source link captured yet.</p>
                        </div>
                    ) : null}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Title</p>
                        <p className="mt-1 font-display text-2xl font-bold text-ink">{title}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Summary</p>
                        <p className="mt-1 text-sm leading-7 text-muted">{summary}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Categories</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {categories.map((item) => (
                                <span key={item} className="rounded-full bg-panel px-3 py-1 text-sm font-medium text-ink shadow-soft dark:bg-white/10 dark:text-white">
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
                    {coverImageFile ? (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Cover Image</p>
                            <p className="mt-1 text-sm leading-7 text-muted">{coverImageFile.name}</p>
                        </div>
                    ) : null}
                    {coverImagePreview ? (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Cover Preview</p>
                            <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-line bg-panel shadow-soft">
                                <Image
                                    src={coverImagePreview}
                                    alt="Selected cover preview"
                                    fill
                                    unoptimized
                                    sizes="(max-width: 768px) 100vw, 720px"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
