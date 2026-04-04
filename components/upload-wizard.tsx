"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  type LucideIcon,
  Presentation,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";

const steps = ["Upload", "Details", "Review"];
const stepProgressClasses = ["w-1/3", "w-2/3", "w-full"];

const supportedFileTypes: Array<{
  title: string;
  copy: string;
  icon: LucideIcon;
}> = [
  { title: "Reports", copy: "PDF and DOC/DOCX files", icon: FileText },
  { title: "Datasets", copy: "CSV and structured text files", icon: FileText },
  { title: "Presentations", copy: "PPT and PPTX files", icon: Presentation },
];

export function UploadWizard() {
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    tone: "error" | "success";
    message: string;
    reportSlug?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const canAdvance = useMemo(() => {
    if (step === 0) return selectedFile !== null && !isExtracting;
    if (step === 1) return title.trim().length > 0 && summary.trim().length > 0;
    return true;
  }, [isExtracting, selectedFile, step, summary, title]);

  async function readApiResponse<T extends Record<string, unknown>>(
    response: Response,
  ): Promise<T | null> {
    const contentType = response.headers.get("content-type") ?? "";
    const responseText = await response.text();

    if (!responseText.trim()) {
      return null;
    }

    if (contentType.includes("application/json")) {
      return JSON.parse(responseText) as T;
    }

    return null;
  }

  async function extractMetadata(file: File) {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("previewOnly", "true");

      const response = await fetch("/api/extract-from-file", {
        method: "POST",
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
        setExtractionError(
          data?.error ??
            "We could not extract document details right now. You can continue and enter them manually.",
        );
        setStep(1);
        return;
      }

      if (!data) {
        setExtractionError(
          "We could not read the extraction response. You can continue and enter the details manually.",
        );
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
    } catch {
      setExtractionError("Failed to parse document for metadata extraction.");
      setStep(1);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleFileSelection(file: File | null) {
    setSelectedFile(file);
    setResult(null);
    setExtractionError(null);
  }

  function persistDraft() {
    if (!selectedFile) {
      setResult({
        tone: "error",
        message: "Choose a source file before creating a draft.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.append("file", selectedFile);
        formData.append("title", title);
        formData.append("summary", summary);
        categories.forEach((category) =>
          formData.append("categories", category),
        );
        tags.forEach((tag) => formData.append("tags", tag));

        const response = await fetch("/api/extract-from-file", {
          body: formData,
          method: "POST",
        });

        const payload = await readApiResponse<{
          error?: string;
          message?: string;
          report?: { slug: string };
        }>(response);

        if (!response.ok) {
          setResult({
            tone: "error",
            message:
              payload?.error ??
              "We could not create the draft right now. Please try again.",
          });
          return;
        }

        if (!payload) {
          setResult({
            tone: "error",
            message:
              "We received an unexpected response while creating the draft. Please refresh the page and try again.",
          });
          return;
        }

        setResult({
          tone: "success",
          message:
            payload.message ??
            "Draft created successfully and ready for review.",
          reportSlug: payload.report?.slug,
        });
      } catch {
        setResult({
          tone: "error",
          message: "We could not create the draft right now. Please try again.",
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
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
          Upload report
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-ink sm:text-5xl">
          Create a CoSET draft from a source file
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
          Upload a document, confirm the title and summary, and save it as a
          draft for review in the admin content table.
        </p>
      </div>

      <div className="relative grid gap-5 md:grid-cols-3">
        <div className="absolute left-0 top-5 hidden h-px w-full bg-line md:block" />
        <div
          className={`absolute left-0 top-5 hidden h-px bg-ember transition-all md:block ${stepProgressClasses[step]}`}
        />
        {steps.map((label, index) => (
          <div
            key={label}
            className="relative flex flex-col items-center gap-3 text-center"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-bold ${
                index <= step
                  ? "bg-ember text-white shadow-soft"
                  : "bg-slate-200 text-muted"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-[0.18em] ${index <= step ? "text-navy" : "text-muted"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
        <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
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

              {step === 2 ? (
                <ReviewStep
                  title={title}
                  summary={summary}
                  categories={categories}
                  tags={tags}
                  selectedFile={selectedFile}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".pdf,.csv,.doc,.docx,.ppt,.pptx,.txt,.md,.json,.html,.xml"
            onChange={(event) =>
              handleFileSelection(event.target.files?.[0] ?? null)
            }
          />

          {result ? (
            <div
              className={`mt-6 rounded-2xl border px-4 py-4 text-sm ${
                result.tone === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <p>{result.message}</p>
              {result.tone === "success" ? (
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/admin/content"
                    className="font-semibold text-navy underline-offset-4 hover:underline"
                  >
                    Open content list
                  </Link>
                  {result.reportSlug ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-muted">
                      Draft slug: {result.reportSlug}
                    </span>
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

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              disabled={step === 0 || isPending || isExtracting}
              className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:border-navy hover:text-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!canAdvance}
              onClick={handleAdvance}
              className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === 0 && isExtracting
                ? "Extracting details..."
                : step === 2
                  ? isPending
                    ? "Saving draft..."
                    : "Create draft"
                  : step === 0
                    ? "Extract details"
                    : "Continue"}
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Current draft
            </p>

            <div className="mt-5 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Source file
                </p>
                <p className="mt-2 text-sm leading-7 text-navy">
                  {selectedFile?.name ?? "No file selected yet"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Title
                </p>
                <p className="mt-2 text-sm leading-7 text-navy">
                  {title.trim() || "Add a title in the details step."}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Categories
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-navy"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted">
                      No categories added yet.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.length > 0 ? (
                    tags.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-navy"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No tags added yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              What happens next
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              <li>• The file is used to generate a draft report entry.</li>
              <li>
                • You can review and update the draft in the content table.
              </li>
              <li>• Publication decisions happen after editorial review.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UploadStep({
  onBrowse,
  onFileSelected,
  selectedFile,
}: {
  onBrowse: () => void;
  onFileSelected: (file: File | null) => void;
  selectedFile: File | null;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-extrabold text-navy">
          Upload a source file
        </h2>
        <p className="mt-3 text-muted">
          Choose a report, policy brief, dataset, or presentation to begin
          creating a draft.
        </p>
      </div>

      <div
        className="rounded-[2rem] border-2 border-dashed border-line bg-mist px-6 py-12 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFileSelected(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <UploadCloud className="mx-auto mb-4 h-12 w-12 text-navy" />
        <h3 className="font-display text-2xl font-bold text-navy">
          Drop file here or browse
        </h3>
        <p className="mt-2 text-muted">
          Supported formats include PDF, CSV, DOCX, PPTX, TXT, and JSON.
        </p>

        <button
          type="button"
          onClick={onBrowse}
          className="mt-8 rounded-full bg-navy px-6 py-3 font-semibold text-white transition hover:bg-teal"
        >
          Browse files
        </button>

        {selectedFile ? (
          <div className="mx-auto mt-6 max-w-lg rounded-[1.5rem] border border-line bg-panel px-5 py-4 text-left shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
              Selected file
            </p>
            <p className="mt-2 font-display text-xl font-bold text-navy">
              {selectedFile.name}
            </p>
            <p className="mt-2 text-sm text-muted">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {supportedFileTypes.map(({ title, copy, icon: RenderedIcon }) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-panel p-4 shadow-soft"
          >
            <RenderedIcon className="mb-3 h-5 w-5 text-navy" />
            <p className="font-display text-sm font-bold text-navy">{title}</p>
            <p className="mt-1 text-xs text-muted">{copy}</p>
          </div>
        ))}
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

function MetadataStep({
  title,
  summary,
  categories,
  tags,
  setTitle,
  setSummary,
  setCategories,
  setTags,
}: MetadataStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
          Details
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">
          Review the draft details
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Update the extracted title, summary, categories, and tags before
          saving the draft.
        </p>
      </div>

      <label className="block space-y-3">
        <span className="text-sm font-semibold text-navy">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter report title"
          className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-base font-medium text-navy shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
        />
      </label>

      <label className="block space-y-3">
        <span className="text-sm font-semibold text-navy">Summary</span>
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={5}
          placeholder="Add a short summary of the report"
          className="w-full rounded-2xl border border-line bg-panel px-4 py-4 text-sm text-navy shadow-soft outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/30"
        />
      </label>

      <ChipInput
        label="Categories"
        placeholder="Add category and press Enter"
        value={categories}
        onValueChange={setCategories}
      />

      <ChipInput
        label="Tags"
        placeholder="Add tag and press Enter"
        value={tags}
        onValueChange={setTags}
        limit={5}
      />
    </div>
  );
}

type ChipInputProps = {
  label: string;
  placeholder: string;
  value: string[];
  onValueChange: (next: string[]) => void;
  limit?: number;
};

function ChipInput({
  label,
  placeholder,
  value,
  onValueChange,
  limit = 3,
}: ChipInputProps) {
  const [draft, setDraft] = useState("");

  function commitValue() {
    const cleaned = draft.trim();
    if (!cleaned || value.includes(cleaned) || value.length >= limit) {
      setDraft("");
      return;
    }

    onValueChange([...value, cleaned]);
    setDraft("");
  }

  return (
    <label className="block space-y-3">
      <span className="text-sm font-semibold text-navy">{label}</span>
      <div className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-soft transition focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/30">
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-sm font-medium text-navy"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                title={`Remove ${item}`}
                onClick={() =>
                  onValueChange(value.filter((entry) => entry !== item))
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitValue();
            }
          }}
          onBlur={commitValue}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <p className="text-xs text-muted">
        Up to {limit} values. Press Enter to add each one.
      </p>
    </label>
  );
}

function ReviewStep({
  title,
  summary,
  categories,
  tags,
  selectedFile,
}: {
  title: string;
  summary: string;
  categories: string[];
  tags: string[];
  selectedFile: File | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
          Review
        </p>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">
          Check the draft before saving
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Saving this step creates a draft report entry that can be reviewed and
          updated later in admin.
        </p>
      </div>

      <div className="rounded-[2rem] border border-line bg-mist p-6">
        <div className="mb-5 flex items-center gap-3 text-teal">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-semibold">
            The report details are ready to be saved as a draft.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Source file
            </p>
            <p className="mt-1 text-sm leading-7 text-muted">
              {selectedFile?.name ?? "No file selected yet"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Title
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-navy">
              {title || "No title added yet"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Summary
            </p>
            <p className="mt-1 text-sm leading-7 text-muted">
              {summary || "No summary added yet"}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Categories
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.length > 0 ? (
                categories.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-panel px-3 py-1 text-sm font-medium text-navy shadow-soft"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No categories added yet.</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Tags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-panel px-3 py-1 text-sm font-medium text-navy shadow-soft"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted">No tags added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
