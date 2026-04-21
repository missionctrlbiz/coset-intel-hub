'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ContentFiltersProps {
    categories: string[];
    currentStatus: string;
    currentCategory: string;
    totalCount?: number;
}

export function ContentFilters({ categories, currentStatus, currentCategory, totalCount = 0 }: ContentFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function applyFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        if (!value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/admin/content?${params.toString()}`);
    }

    function handleReset() {
        router.push('/admin/content');
    }

    return (
        <section className="mb-8 flex flex-wrap items-center gap-4 rounded-[2rem] border border-line bg-panel p-5 shadow-soft dark:border-white/10 dark:bg-[#0d1828]">
            <div className="inline-flex items-center gap-3 rounded-full bg-mist px-4 py-2.5 text-sm font-semibold text-navy dark:bg-[#132033] dark:text-ember">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ember dark:bg-[#0b1626] dark:text-ember">Filters</span>
                <span className="text-muted dark:text-white/72">{totalCount} reports</span>
            </div>

            <select
                aria-label="Filter by category"
                title="Filter by category"
                value={currentCategory}
                onChange={(e) => applyFilter('category', e.target.value)}
                className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-navy outline-none transition hover:border-ember/40 focus:border-ember dark:border-white/12 dark:bg-[#132033] dark:text-ember"
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            <select
                aria-label="Filter by status"
                title="Filter by status"
                value={currentStatus}
                onChange={(e) => applyFilter('status', e.target.value)}
                className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-navy outline-none transition hover:border-ember/40 focus:border-ember dark:border-white/12 dark:bg-[#132033] dark:text-ember"
            >
                <option value="">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
            </select>

            <button
                type="button"
                onClick={handleReset}
                aria-label="Reset filters"
                title="Reset filters"
                className="ml-auto rounded-full border border-line bg-mist p-2.5 text-muted transition hover:border-ember/30 hover:bg-white hover:text-navy dark:border-white/12 dark:bg-[#132033] dark:text-ember dark:hover:bg-[#182740] dark:hover:text-ember"
            >
                <RefreshCw className="h-4 w-4" />
            </button>
        </section>
    );
}
