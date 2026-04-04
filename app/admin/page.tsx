import { Activity, ArrowUpRight, Cpu, Download, FileText } from 'lucide-react';

import { AdminSidebar } from '@/components/admin-sidebar';
import { adminActivity, adminStats } from '@/lib/site-data';

const progressWidthClasses = {
    compact: 'w-[64%]',
    broad: 'w-[72%]',
} as const;

export default function AdminDashboardPage() {
    return (
        <div className="mx-auto flex max-w-[1600px]">
            <AdminSidebar pathname="/admin" />
            <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Intelligence Dashboard</h1>
                        <p className="mt-3 text-lg text-muted">Welcome back. Here is your operational overview for the current publication cycle.</p>
                    </div>
                    <button className="rounded-full border border-line bg-panel px-5 py-3 text-sm font-semibold text-navy shadow-soft">Last 30 Days</button>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {adminStats.map((stat, index) => (
                        <div key={stat.label} className={`rounded-[2rem] p-6 shadow-soft ${index === 3 ? 'bg-ember text-white' : 'border border-line bg-panel'}`}>
                            <div className="mb-6 flex items-center justify-between">
                                <div className={`rounded-2xl p-3 ${index === 3 ? 'bg-white/20' : 'bg-mist'}`}>
                                    {index === 0 ? <Activity className="h-5 w-5" /> : null}
                                    {index === 1 ? <FileText className="h-5 w-5" /> : null}
                                    {index === 2 ? <Download className="h-5 w-5" /> : null}
                                    {index === 3 ? <Cpu className="h-5 w-5" /> : null}
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${index === 3 ? 'bg-white/15' : 'bg-emerald-50 text-emerald-700'}`}>{stat.delta}</span>
                            </div>
                            <p className={`text-xs font-bold uppercase tracking-[0.18em] ${index === 3 ? 'text-white/70' : 'text-muted'}`}>{stat.label}</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em]">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 grid gap-8 xl:grid-cols-[1.5fr_0.85fr]">
                    <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                        <div className="flex items-center justify-between border-b border-line px-6 py-5">
                            <h2 className="font-display text-2xl font-bold text-navy">Recent Activity</h2>
                            <button className="text-sm font-semibold text-ember">View all</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                    <tr>
                                        <th className="px-6 py-4">Report Title</th>
                                        <th className="px-6 py-4">Author</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminActivity.map((item) => (
                                        <tr key={item.title} className="border-t border-line even:bg-panel-alt/60">
                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-navy">{item.title}</p>
                                                <p className="text-sm text-muted">{item.category}</p>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-muted">{item.author}</td>
                                            <td className="px-6 py-5">
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Draft' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-muted">{item.modified}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="space-y-6">
                        <div className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                            <p className="font-display text-2xl font-bold">Infrastructure Health</p>
                            <div className="mt-6 space-y-4">
                                <Progress label="Server Capacity" value="72%" widthClass={progressWidthClasses.broad} />
                                <Progress label="Daily Ingest" value="12.4 GB" widthClass={progressWidthClasses.compact} />
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Curator&apos;s Note</p>
                                <ArrowUpRight className="h-4 w-4 text-ember" />
                            </div>
                            <p className="text-lg font-medium italic leading-8 text-muted">Adding metadata tags significantly increases the discoverability of environmental reports by up to 40%.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Progress({ label, value, widthClass }: { label: string; value: string; widthClass: string }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm text-white/75">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
                <div className={`h-2 rounded-full bg-ember ${widthClass}`} />
            </div>
        </div>
    );
}