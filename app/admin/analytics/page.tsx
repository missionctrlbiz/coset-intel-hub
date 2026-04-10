import type { Database } from '@/lib/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type ReportRow = Database['public']['Tables']['reports']['Row'];

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}

export default async function AdminAnalyticsPage() {
    let totalViews = 0;
    let totalDownloads = 0;
    let publishedCount = 0;
    let topDownloaded: { title: string; slug: string; downloads: number; updated_at: string | null }[] = [];
    let categoryDist: { name: string; count: number; percent: number }[] = [];
    let distinctDomains = 0;

    try {
        const supabase = await createSupabaseServerClient();

        const { data: reportsRaw } = await supabase
            .from('reports')
            .select('*');
        const reports = reportsRaw as ReportRow[] | null;

        if (reports) {
            totalViews = reports.reduce((sum, r) => sum + (r.views ?? 0), 0);
            totalDownloads = reports.reduce((sum, r) => sum + (r.downloads ?? 0), 0);
            publishedCount = reports.filter((r) => r.status === 'published').length;

            // Category distribution
            const catCount: Record<string, number> = {};
            for (const r of reports) {
                for (const cat of r.category ?? []) {
                    catCount[cat] = (catCount[cat] ?? 0) + 1;
                }
            }
            const total = Object.values(catCount).reduce((a, b) => a + b, 0) || 1;
            categoryDist = Object.entries(catCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }));
            distinctDomains = Object.keys(catCount).length;

            // Top downloaded reports for activity table
            topDownloaded = reports
                .filter((r) => (r.downloads ?? 0) > 0)
                .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
                .slice(0, 5)
                .map((r) => ({
                    title: r.title,
                    slug: r.slug,
                    downloads: r.downloads ?? 0,
                    updated_at: r.updated_at,
                }));
        }
    } catch {
        // Supabase unavailable — page renders with zeros
    }

    return (
        <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                    <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Performance Intelligence</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted">Curated analytics reflecting real-time engagement, export behavior, and reader growth across the CoSET ecosystem.</p>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-[1.5rem] bg-panel-alt p-5">
                            <p className="text-sm text-muted">Total Views</p>
                            <div className="mt-3">
                                <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{formatCount(totalViews)}</p>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] bg-panel-alt p-5">
                            <p className="text-sm text-muted">Total Downloads</p>
                            <div className="mt-3">
                                <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{formatCount(totalDownloads)}</p>
                            </div>
                        </div>
                        <div className="rounded-[1.5rem] bg-panel-alt p-5">
                            <p className="text-sm text-muted">Published Reports</p>
                            <div className="mt-3">
                                <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{publishedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.75rem] bg-mist p-6">
                        <p className="font-display text-2xl font-bold text-navy">Download Momentum</p>
                        <p className="mt-2 text-sm text-muted">Cumulative exports across all published reports.</p>
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
                                    <p className="font-display text-5xl font-extrabold">{distinctDomains}</p>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">Key domains</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3 text-sm text-white/75">
                            {categoryDist.length > 0 ? (
                                categoryDist.map(({ name, percent }) => (
                                    <div key={name} className="flex justify-between">
                                        <span>{name}</span>
                                        <span>{percent}%</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white/50">No category data yet.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                        <p className="font-display text-2xl font-bold text-navy">Top Downloaded Reports</p>
                        <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-line">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                    <tr>
                                        <th className="px-4 py-3">Report</th>
                                        <th className="px-4 py-3 text-right">Downloads</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topDownloaded.length > 0 ? (
                                        topDownloaded.map((r) => (
                                            <tr key={r.slug} className="border-t border-line">
                                                <td className="px-4 py-4 text-muted">{r.title}</td>
                                                <td className="px-4 py-4 text-right font-semibold text-navy">{r.downloads.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-6 text-center text-muted">
                                                No download data yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}