'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

type ChipInputProps = {
    label: string;
    placeholder: string;
    value: string[];
    onChange: (next: string[]) => void;
    limit?: number;
};

export function ChipInput({ label, placeholder, value, onChange, limit = 3 }: ChipInputProps) {
    const [draft, setDraft] = useState('');

    function commitValue() {
        const cleaned = draft.trim();
        if (!cleaned || value.includes(cleaned) || value.length >= limit) {
            setDraft('');
            return;
        }

        onChange([...value, cleaned]);
        setDraft('');
    }

    return (
        <label className="block space-y-3">
            <span className="text-sm font-semibold text-navy dark:text-white">{label}</span>
            <div className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-soft transition focus-within:border-ember focus-within:ring-2 focus-within:ring-ember/30">
                <div className="mb-3 flex flex-wrap gap-2">
                    {value.map((item) => (
                        <span key={item} className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-sm font-medium text-navy dark:bg-white/10 dark:text-white">
                            {item}
                            <button
                                type="button"
                                aria-label={`Remove ${item}`}
                                title={`Remove ${item}`}
                                onClick={() => onChange(value.filter((entry) => entry !== item))}
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
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            commitValue();
                        }
                    }}
                    onBlur={commitValue}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
            </div>
            <p className="text-xs text-muted">Up to {limit} values. Press Enter to add each one.</p>
        </label>
    );
}