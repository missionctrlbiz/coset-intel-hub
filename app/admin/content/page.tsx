import { Plus, Pencil, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { ContentFilters } from '@/components/content-filters';
import { getAdminContentReports } from '@/lib/content';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

const statusClasses: Record<string, string> = {
    Archived: 'bg-slate-200 text-slate-700',
    Draft: 'bg-slate-200 text-slate-700',
    Published: 'bg-emerald-100 text-emerald-800',
    Scheduled: 'bg-blue-100 text-blue-800',
};

export default async function AdminContentPage({
    searchParams,
}: {
    searchParams: { status?: string; category?: string; page?: string };
}) {
    const currentStatus = searchParams.status ?? '';
    const currentCategory = searchParams.category ?? '';
    const currentPage = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
    const limit = 10;

    const { reports, canManage, isFallback, profile, user, totalCount } = await getAdminContentReports({
        status: currentStatus || undefined,
        category: currentCategory || undefined,
        page: currentPage,
        limit,
    });

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    let distinctCategories: string[] = [];
    try {
        const supabase = await createSupabaseServerClient();
        const { data: catData } = await supabase.from('reports').select('category');
        if (catData) {
            distinctCategories = [...new Set((catData as { category: string[] | null }[]).flatMap((r) => r.category ?? []))].sort();
        }
    } catch {
        // categories unavailable — filter will render without options
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Curation Hub</p>
                    <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Content Management</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted">Review, edit, and organize intelligence reports and editorial posts driving the platform.</p>
                </div>
                <Link
                    href="/admin/upload"
                    className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 font-semibold text-white shadow-soft transition hover:brightness-110"
                >
                    <Plus className="h-4 w-4" />
                    Create New Report
                </Link>
            </div>

            {!user ? (
                <section className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
                    Sign in to view live admin content. Static fallback data is shown below until an authenticated session is available.
                </section>
            ) : null}

            {user && !canManage ? (
                <section className="mb-8 rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
                    You are signed in as {profile?.email ?? user.email}, but your profile role is `{profile?.role ?? 'viewer'}`. You can see published content, but editor or admin role is required for full content management.
                </section>
            ) : null}

            {isFallback ? (
                <section className="mb-8 rounded-[2rem] border border-line bg-panel-alt px-5 py-4 text-sm text-muted shadow-soft">
                    No live report rows were returned yet, so the table is temporarily showing seeded fallback content.
                </section>
            ) : null}

            <ContentFilters
                categories={distinctCategories}
                currentStatus={currentStatus}
                currentCategory={currentCategory}
            />

            <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="sticky top-0 bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                            <tr>
                                <th className="px-6 py-5">Title & Reference</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Author</th>
                                <th className="px-6 py-5">Modified</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="border-t border-line even:bg-panel-alt/60">
                                    <td className="px-6 py-5">
                                        <div>
                                            <p className="font-semibold text-navy">{report.title}</p>
                                            <p className="mt-1 text-xs text-muted">{report.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-navy">{report.category}</span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-muted">{report.author}</td>
                                    <td className="px-6 py-5 text-sm text-muted">{report.modified}</td>
                                    <td className="px-6 py-5">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClasses[report.status] ?? 'bg-slate-200 text-slate-700'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                href={`/admin/upload?edit=${report.slug}`}
                                                title="Edit report"
                                                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted transition hover:bg-mist hover:text-navy"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/reports/${report.slug}`}
                                                target="_blank"
                                                title="Preview report"
                                                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted transition hover:bg-mist hover:text-navy"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                disabled
                                                aria-disabled="true"
                                                title="Delete (coming soon)"
                                                className="flex items-center justify-center h-8 w-8 rounded-lg text-muted/30 cursor-not-allowed"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-line px-6 py-4">
                        <p className="text-sm text-muted">
                            Page <span className="font-semibold text-navy">{currentPage}</span> of{' '}
                            <span className="font-semibold text-navy">{totalPages}</span>
                            {' '}· {totalCount} total
                        </p>
                        <div className="flex items-center gap-2">
                            {currentPage > 1 ? (
                                <Link
                                    href={`?status=${currentStatus}&category=${currentCategory}&page=${currentPage - 1}`}
                                    className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-navy transition hover:border-ember hover:text-ember"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Link>
                            ) : (
                                <span className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted/50 cursor-not-allowed">
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </span>
                            )}
                            {currentPage < totalPages ? (
                                <Link
                                    href={`?status=${currentStatus}&category=${currentCategory}&page=${currentPage + 1}`}
                                    className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-navy transition hover:border-ember hover:text-ember"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="flex items-center gap-1 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted/50 cursor-not-allowed">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}