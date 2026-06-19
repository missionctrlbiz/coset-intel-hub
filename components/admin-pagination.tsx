import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AdminPaginationProps = {
    /** Current page (1-based). */
    page: number;
    /** Total rows across all pages. */
    totalCount: number;
    /** Rows per page. */
    pageSize: number;
    /** Base path, e.g. "/admin/subscribers". */
    basePath: string;
    /** Extra query params to preserve when navigating (e.g. filters). */
    extraParams?: Record<string, string | number | undefined>;
};

export function AdminPagination({
    page,
    totalCount,
    pageSize,
    basePath,
    extraParams,
}: AdminPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    if (totalPages <= 1) return null;

    function buildHref(targetPage: number): string {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(extraParams ?? {})) {
            if (value === undefined || value === '') continue;
            params.set(key, String(value));
        }
        if (targetPage > 1) params.set('page', String(targetPage));
        const query = params.toString();
        return query ? `${basePath}?${query}` : basePath;
    }

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    return (
        <nav
            className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6"
            aria-label="Pagination"
        >
            <p className="text-sm text-muted">
                Showing <span className="font-semibold text-ink">{from}</span>–
                <span className="font-semibold text-ink">{to}</span> of{' '}
                <span className="font-semibold text-ink">{totalCount}</span>
            </p>
            <div className="flex items-center gap-2">
                <Link
                    href={buildHref(Math.max(1, page - 1))}
                    aria-disabled={page === 1}
                    className={`inline-flex items-center gap-1 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold transition ${
                        page === 1
                            ? 'pointer-events-none opacity-40'
                            : 'hover:border-ember/40 hover:text-ember'
                    }`}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Link>
                <span className="px-2 text-sm font-semibold text-ink">
                    Page {page} of {totalPages}
                </span>
                <Link
                    href={buildHref(Math.min(totalPages, page + 1))}
                    aria-disabled={page === totalPages}
                    className={`inline-flex items-center gap-1 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold transition ${
                        page === totalPages
                            ? 'pointer-events-none opacity-40'
                            : 'hover:border-ember/40 hover:text-ember'
                    }`}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </nav>
    );
}
