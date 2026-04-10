'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ContentFiltersProps {
    categories: string[];
    currentStatus: string;
    currentCategory: string;
}

export function ContentFilters({ categories, currentStatus, currentCategory }: ContentFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function applyFilter(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
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
        <section className="mb-8 flex flex-wrap items-center gap-4 rounded-[2rem] border border-line bg-panel p-5 shadow-soft">
            <button className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-muted">
                Filters
            </button>

            <select
                aria-label="Filter by category"
                title="Filter by category"
                value={currentCategory}
                onChange={(e) => applyFilter('category', e.target.value)}
                className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted outline-none"
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
                className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted outline-none"
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
                className="ml-auto rounded-full p-2 text-muted transition hover:bg-mist hover:text-navy"
            >
                <RefreshCw className="h-4 w-4" />
            </button>
        </section>
    );
}
