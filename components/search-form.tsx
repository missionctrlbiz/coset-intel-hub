'use client';

import { Search, FileText, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type SearchResult = {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string[];
    score: number;
};

export function SearchForm({ dark }: { dark?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams?.get('q') || '');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setQuery(searchParams?.get('q') || '');
    }, [searchParams]);

    const fetchResults = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.results || []);
            setShowDropdown(true);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchResults(value), 350);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowDropdown(false);
        if (query.trim()) {
            router.push(`/reports?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/reports');
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative hidden lg:block">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 transition-all',
                    dark ? 'bg-white/10 text-white' : 'bg-mist text-ink',
                    showDropdown && 'ring-2 ring-ember/40'
                )}
            >
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                    aria-label="Search CoSET Intelligence Hub"
                    className="w-56 bg-transparent text-sm outline-none placeholder:text-muted/60"
                    placeholder="Search CoSET Intelligence Hub..."
                    value={query}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                />
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                {query && !isLoading && (
                    <button type="button" onClick={() => { setQuery(''); setResults([]); setShowDropdown(false); }} aria-label="Clear search" className="text-muted hover:text-ink transition">
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </form>

            {showDropdown && results.length > 0 && (
                <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-line bg-panel p-2 shadow-editorial">
                    <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    <div className="max-h-80 overflow-y-auto">
                        {results.map((r) => (
                            <Link
                                key={r.id}
                                href={`/reports/${r.slug}`}
                                onClick={() => setShowDropdown(false)}
                                className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-mist"
                            >
                                <div className="mt-0.5 rounded-lg bg-navy/10 p-2">
                                    <FileText className="h-4 w-4 text-navy" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-ink">{r.title}</p>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{r.description}</p>
                                    {r.category?.[0] && (
                                        <span className="mt-1 inline-block rounded-full bg-ember/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ember">
                                            {r.category[0]}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-line pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowDropdown(false); router.push(`/reports?q=${encodeURIComponent(query)}`); }}
                            className="w-full rounded-xl px-3 py-2 text-center text-sm font-semibold text-navy transition hover:bg-mist"
                        >
                            View all results ΓåÆ
                        </button>
                    </div>
                </div>
            )}

            {showDropdown && results.length === 0 && query.length >= 2 && !isLoading && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-line bg-panel p-6 text-center shadow-editorial">
                    <Search className="mx-auto h-8 w-8 text-muted/40" />
                    <p className="mt-3 text-sm font-semibold text-ink">No results found</p>
                    <p className="mt-1 text-xs text-muted">Try adjusting your search query</p>
                </div>
            )}
        </div>
    );
}
