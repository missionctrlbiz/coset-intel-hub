import { Plus, RefreshCw } from 'lucide-react';

import { AdminSidebar } from '@/components/admin-sidebar';
import { reports } from '@/lib/site-data';

export default function AdminContentPage() {
    return (
        <div className="mx-auto flex max-w-[1600px]">
            <AdminSidebar pathname="/admin/content" />
            <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Curation Hub</p>
                        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Content Management</h1>
                        <p className="mt-3 max-w-3xl text-lg text-muted">Review, edit, and organize intelligence reports and editorial posts driving the platform.</p>
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 font-semibold text-white shadow-soft transition hover:brightness-110">
                        <Plus className="h-4 w-4" />
                        Create New Report
                    </button>
                </div>

                <section className="mb-8 flex flex-wrap items-center gap-4 rounded-[2rem] border border-line bg-panel p-5 shadow-soft">
                    <button className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-muted">Filters</button>
                    <select aria-label="Filter by category" title="Filter by category" className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted outline-none">
                        <option>All Categories</option>
                    </select>
                    <select aria-label="Filter by status" title="Filter by status" className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted outline-none">
                        <option>All Status</option>
                    </select>
                    <input aria-label="Filter by date range" className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted outline-none" placeholder="Date Range" />
                    <button type="button" aria-label="Refresh content list" title="Refresh content list" className="ml-auto rounded-full p-2 text-muted transition hover:bg-mist hover:text-navy">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </section>

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
                                {reports.map((report, index) => (
                                    <tr key={report.id} className="border-t border-line even:bg-panel-alt/60">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-semibold text-navy">{report.title}</p>
                                                <p className="mt-1 text-xs text-muted">ID: REP-88{index + 10}10</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-navy">{report.category[0]}</span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-muted">{report.author}</td>
                                        <td className="px-6 py-5 text-sm text-muted">{report.publishedAt}</td>
                                        <td className="px-6 py-5">
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${index === 0 ? 'bg-emerald-100 text-emerald-800' : index === 1 ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                                                {index === 0 ? 'Published' : index === 1 ? 'Scheduled' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right text-sm font-semibold text-navy">Edit • Preview • Delete</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}