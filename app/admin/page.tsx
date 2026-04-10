import { Activity, FileText, Globe, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { EmptyAdminActivity } from '@/components/loading-states';
import { getDashboardData } from '@/lib/admin-stats';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function AdminDashboardPage() {
    const { stats, activity, isFallback } = await getDashboardData();

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h1 className="font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Admin Dashboard</h1>
                    <p className="mt-3 text-lg text-muted">A consolidated overview of your operational and publication performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isFallback && (
                        <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 border border-amber-200 shadow-sm animate-pulse">
                            Development Mode: Sample Data
                        </span>
                    )}
                    <Link
                        href="/admin/upload"
                        className="rounded-full bg-ember px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:brightness-110 active:scale-95"
                    >
                        Create New Report
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {stats.slice(0, 3).map((stat, index) => (
                    <div
                        key={stat.label}
                        className={cn(
                            "group overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-soft transition-all hover:shadow-editorial hover:-translate-y-1",
                            index === 1 && "border-emerald-100 bg-emerald-50/30",
                            index === 2 && "border-amber-100 bg-amber-50/30"
                        )}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div className={cn(
                                "rounded-xl p-3 transition-transform group-hover:scale-110",
                                index === 0 ? "bg-navy/10 text-navy" :
                                    index === 1 ? "bg-emerald-100 text-emerald-700" :
                                        "bg-amber-100 text-amber-700"
                            )}>
                                {index === 0 && <Activity className="h-5 w-5" />}
                                {index === 1 && <Globe className="h-5 w-5" />}
                                {index === 2 && <FileText className="h-5 w-5" />}
                            </div>
                            <span className={cn(
                                "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                                index === 0 ? "bg-navy/5 text-navy/60" :
                                    index === 1 ? "bg-emerald-100/50 text-emerald-800" :
                                        "bg-amber-100/50 text-amber-800"
                            )}>
                                {stat.delta}
                            </span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted">{stat.label}</p>
                        <p className="mt-3 font-display text-4xl font-black tracking-[-0.05em] text-ink">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity - Full Width */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-panel shadow-soft">
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-ember animate-pulse" />
                        <h2 className="font-display text-2xl font-bold text-navy">Recent Publication Activity</h2>
                    </div>
                    <Link href="/admin/content" className="flex items-center gap-2 text-sm font-bold text-ember transition hover:gap-3">
                        View Content Management
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-panel-alt/50 text-[10px] font-black uppercase tracking-[0.25em] text-muted">
                            <tr>
                                <th className="px-6 py-4">Report Asset</th>
                                <th className="px-6 py-4 text-center">Curator</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Last Modified</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line/50">
                            {activity.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>
                                        <EmptyAdminActivity />
                                    </td>
                                </tr>
                            ) : activity.slice(0, 5).map((item) => (
                                <tr key={item.title} className="group transition hover:bg-white/40">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-ember transition group-hover:bg-ember group-hover:text-white">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="max-w-md truncate font-bold text-navy">{item.title}</p>
                                                <p className="text-xs font-semibold text-muted">{item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-sm font-bold text-navy">{item.author}</p>
                                            <p className="text-[10px] text-muted uppercase tracking-wider font-semibold">Editorial Team</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider",
                                                item.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                                                    item.status === 'Draft' ? 'bg-slate-200 text-slate-700' :
                                                        'bg-amber-100 text-amber-800'
                                            )}>
                                                <div className={cn(
                                                    "h-1 w-1 rounded-full",
                                                    item.status === 'Published' ? 'bg-emerald-600' :
                                                        item.status === 'Draft' ? 'bg-slate-600' :
                                                            'bg-amber-600'
                                                )} />
                                                {item.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-sm text-muted">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="font-semibold">{item.modified}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}