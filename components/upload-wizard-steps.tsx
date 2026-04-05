import { CheckCircle2, Database, FileText, ImagePlus, Presentation, UploadCloud } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { ChipInput } from '@/components/chip-input';

const uploadAssetCards: Array<{ title: string; copy: string; icon: LucideIcon }> = [
    { title: 'Reports', copy: 'Auto-summarize PDF reports', icon: FileText },
    { title: 'Datasets', copy: 'Extract CSV structures', icon: Database },
    { title: 'Presentations', copy: 'Analyze PPT visual data', icon: Presentation },
];

export function UploadStep({ onBrowse, onFileSelected, selectedFile }: { onBrowse: () => void; onFileSelected: (file: File | null) => void; selectedFile: File | null }) {
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

export type MetadataStepProps = {
    title: string;
    summary: string;
    categories: string[];
    tags: string[];
    setTitle: (value: string) => void;
    setSummary: (value: string) => void;
    setCategories: (value: string[]) => void;
    setTags: (value: string[]) => void;
};

export function MetadataStep({ title, summary, categories, tags, setTitle, setSummary, setCategories, setTags }: MetadataStepProps) {
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

export function ReviewStep({ title, summary, categories, tags, selectedFile }: { title: string; summary: string; categories: string[]; tags: string[]; selectedFile: File | null }) {
    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Review & Process</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">Everything is ready for extraction</h2>
            </div>
            <div className="rounded-[2rem] border border-line bg-mist p-6">
                <div className="mb-5 flex items-center gap-3 text-teal">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">Metadata validated. The processing flow can now generate draft content and autofill structured fields.</p>
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
