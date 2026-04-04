import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminAnalyticsPage() {
    return (
        <div className="mx-auto flex max-w-[1600px]">
            <AdminSidebar pathname="/admin/analytics" />
            <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
                <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Performance Intelligence</h1>
                        <p className="mt-3 max-w-3xl text-lg text-muted">Curated analytics reflecting real-time engagement, export behavior, and reader growth across the CoSET ecosystem.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {['Last 30 Days', 'Last Quarter', 'Year to Date', 'Custom Range'].map((label, index) => (
                            <button key={label} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${index === 0 || index === 3 ? 'border border-line bg-panel text-navy shadow-soft' : 'text-muted'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                ['Total Traffic', '142.8k', '+12%'],
                                ['Unique Visitors', '38.4k', '+8%'],
                                ['Avg. Time on Report', '06:42', '-2%'],
                            ].map(([label, value, delta], index) => (
                                <div key={label} className="rounded-[1.5rem] bg-panel-alt p-5">
                                    <p className="text-sm text-muted">{label}</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{value}</p>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${index === 2 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{delta}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-[1.75rem] bg-mist p-6">
                            <p className="font-display text-2xl font-bold text-navy">Download Momentum</p>
                            <p className="mt-2 text-sm text-muted">Daily aggregate of technical report exports.</p>
                            <div className="mt-8 h-[320px] rounded-[1.5rem] bg-panel p-6 shadow-soft">
                                <svg viewBox="0 0 600 240" className="h-full w-full" fill="none">
                                    <path d="M0 170 C80 160, 100 110, 180 120 S300 200, 380 140 S520 80, 600 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-navy" />
                                    <circle cx="140" cy="122" r="5" fill="rgb(var(--color-panel))" stroke="rgb(var(--color-navy))" strokeWidth="3" />
                                    <circle cx="450" cy="108" r="5" fill="rgb(var(--color-panel))" stroke="rgb(var(--color-navy))" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </section>

                    <div className="space-y-6">
                        <section className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                            <p className="font-display text-2xl font-bold">Sector Interest</p>
                            <div className="mt-6 flex justify-center">
                                <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-[18px] border-blue-200/80 border-r-ember border-t-ember">
                                    <div className="text-center">
                                        <p className="font-display text-5xl font-extrabold">5</p>
                                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">Key domains</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 space-y-3 text-sm text-white/75">
                                <div className="flex justify-between"><span>Urban Resilience</span><span>70%</span></div>
                                <div className="flex justify-between"><span>Agri-Social Impact</span><span>25%</span></div>
                                <div className="flex justify-between"><span>Other Sectors</span><span>5%</span></div>
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <div className="flex items-center justify-between">
                                <p className="font-display text-2xl font-bold text-navy">Recent Export Activity</p>
                                <button className="text-sm font-semibold text-ember">View complete log</button>
                            </div>
                            <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-line">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                        <tr>
                                            <th className="px-4 py-3">Report</th>
                                            <th className="px-4 py-3">Organization</th>
                                            <th className="px-4 py-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ['Biotech Ethics Framework v2', 'Helsinki BioCenter', 'Today, 14:22'],
                                            ['Urban Heat Island Analysis', 'Sydney Municipal Council', 'Today, 11:05'],
                                            ['Clean Energy Adoption Trends', 'Renewable Watch Intl.', 'Yesterday, 17:48'],
                                        ].map((row) => (
                                            <tr key={row[0]} className="border-t border-line">
                                                {row.map((cell) => (
                                                    <td key={cell} className="px-4 py-4 text-muted">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}