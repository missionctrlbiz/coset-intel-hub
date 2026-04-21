import { Plus, Pencil, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { DeleteReportButton } from '@/components/delete-report-button';

import { ContentFilters } from '@/components/content-filters';
import { getAdminContentReports } from '@/lib/content';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

const statusClasses: Record<string, string> = {
    Archived: 'border-slate-300 bg-slate-100 text-slate-700',
    Draft: 'border-slate-300 bg-slate-100 text-slate-700',
    Published: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    Scheduled: 'border-blue-200 bg-blue-100 text-blue-800',
};

function formatCategoryLabel(category: string) {
    return category
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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
        <main className="site-shell max-w-[1520px] py-10">
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
                totalCount={totalCount}
            />

            <section className="overflow-hidden rounded-[2.2rem] border border-line bg-panel shadow-soft">
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed text-left">
                        <colgroup>
                            <col className="w-[48%]" />
                            <col className="w-[18%]" />
                            <col className="w-[14%]" />
                            <col className="w-[12%]" />
                            <col className="w-[8%]" />
                        </colgroup>
                        <thead className="sticky top-0 bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                            <tr>
                                <th className="px-6 py-5">Report</th>
                                <th className="px-6 py-5">Category</th>
                                <th className="px-6 py-5">Modified</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report) => (
                                <tr key={report.id} className="group border-t border-line transition-colors hover:bg-panel-alt/70 even:bg-panel-alt/35">
                                    <td className="px-6 py-5">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ember">Intelligence Report</p>
                                                <p className="max-w-[32rem] text-lg font-semibold leading-7 text-navy transition-colors group-hover:text-ember">{report.title}</p>
                                                <p className="mt-1 text-sm text-muted">Intelligence report ready for editing and public preview.</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                                                <Link
                                                    href={`/reports/${report.slug}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-navy transition hover:border-ember hover:text-ember dark:border-white/12 dark:bg-[#132033] dark:text-ember dark:hover:border-ember/40 dark:hover:bg-[#182740] dark:hover:text-ember"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Open public report
                                                </Link>
                                                <span className="rounded-full bg-mist px-3 py-1.5 text-muted dark:bg-[#132033] dark:text-ember/80">
                                                    Ready in publishing archive
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="max-w-[14rem]">
                                            <span className="inline-flex min-h-10 w-full items-center justify-center rounded-[1rem] border border-blue-200 bg-blue-50 px-3.5 py-2 text-center text-xs font-bold uppercase leading-4 tracking-[0.14em] text-navy whitespace-normal break-words dark:border-white/12 dark:bg-[#132033] dark:text-ember">
                                                {formatCategoryLabel(report.category)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="space-y-1 text-sm text-muted">
                                            <p className="font-semibold text-ink">{report.modified}</p>
                                            <p>Last updated</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${statusClasses[report.status] ?? 'border-slate-300 bg-slate-100 text-slate-700'}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Link
                                                href={`/admin/upload?edit=${report.slug}`}
                                                title="Edit report"
                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-mist text-muted transition hover:border-ember/20 hover:bg-ember/10 hover:text-ember"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={`/reports/${report.slug}`}
                                                target="_blank"
                                                title="Preview report"
                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-mist text-muted transition hover:border-navy/15 hover:bg-white hover:text-navy"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <DeleteReportButton id={report.id} title={report.title} />
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