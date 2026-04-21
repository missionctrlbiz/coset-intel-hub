export function HomepageSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Hero skeleton - Two column grid */}
            <section className="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-teal/30 dark:from-black dark:via-ink dark:to-teal/20">
                <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-28">
                    {/* Left column - Text content */}
                    <div className="max-w-3xl space-y-5">
                        <div className="h-3 w-48 rounded-full bg-white/10" />
                        <div className="h-16 w-full rounded-2xl bg-white/10" />
                        <div className="h-16 w-4/5 rounded-2xl bg-white/10" />
                        <div className="h-5 w-full rounded-full bg-white/10" />
                        <div className="h-5 w-3/4 rounded-full bg-white/10" />
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                            <div className="h-14 w-44 rounded-full bg-white/10" />
                            <div className="h-14 w-52 rounded-full bg-white/10" />
                        </div>
                        {/* Mission/Philosophy blocks */}
                        <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                                <div className="h-3 w-24 rounded-full bg-white/20" />
                                <div className="mt-3 h-4 w-full rounded-full bg-white/20" />
                                <div className="mt-2 h-4 w-4/5 rounded-full bg-white/20" />
                            </div>
                            <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                                <div className="h-3 w-28 rounded-full bg-white/20" />
                                <div className="mt-3 h-4 w-full rounded-full bg-white/20" />
                                <div className="mt-2 h-4 w-4/5 rounded-full bg-white/20" />
                            </div>
                        </div>
                    </div>

                    {/* Right column - Stats card */}
                    <div className="self-end">
                        <div className="rounded-[2.25rem] border border-white/10 bg-black/20 p-5 shadow-editorial backdrop-blur-xl">
                            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
                                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                                    <div className="flex-1 space-y-3">
                                        <div className="h-3 w-36 rounded-full bg-white/20" />
                                        <div className="h-9 w-full rounded-lg bg-white/20" />
                                    </div>
                                    <div className="h-11 w-11 rounded-full bg-white/10" />
                                </div>
                                {/* Stats grid */}
                                <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className={`rounded-[1.6rem] border p-5 shadow-soft ${i === 2 ? 'border-white/20 bg-white' : 'border-white/10 bg-white/8'}`}>
                                            <div className={`h-3 w-24 rounded-full ${i === 2 ? 'bg-slate-200' : 'bg-white/20'}`} />
                                            <div className={`mt-3 h-10 w-28 rounded-xl ${i === 2 ? 'bg-slate-200' : 'bg-white/20'}`} />
                                            <div className={`mt-3 h-4 w-20 rounded-full ${i === 2 ? 'bg-slate-200' : 'bg-white/20'}`} />
                                        </div>
                                    ))}
                                </div>
                                {/* Bottom card */}
                                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
                                    <div className="h-3 w-40 rounded-full bg-white/20" />
                                    <div className="mt-2 h-4 w-full rounded-full bg-white/20" />
                                    <div className="mt-2 h-4 w-3/4 rounded-full bg-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter sidebar + Reports section */}
            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
                {/* Sidebar skeleton */}
                <aside className="h-fit rounded-[2rem] border border-line bg-panel p-6 shadow-soft dark:bg-panel/92">
                    <div className="h-7 w-40 rounded-lg bg-mist dark:bg-slate-700" />
                    <div className="mt-1 h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-8 space-y-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-3 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                ))}
                            </div>
                        ))}
                        <div className="h-11 w-full rounded-xl bg-mist dark:bg-slate-700" />
                    </div>
                </aside>

                <div className="space-y-16">
                    {/* Featured reports - 2 columns */}
                    <div>
                        <div className="mb-8 space-y-3">
                            <div className="h-3 w-40 rounded-full bg-mist dark:bg-slate-700" />
                            <div className="h-10 w-full max-w-lg rounded-xl bg-mist dark:bg-slate-700" />
                        </div>
                        <div className="grid gap-6 lg:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                                    <div className="relative h-[420px] bg-mist dark:bg-slate-700" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Latest reports - 3 columns */}
                    <div>
                        <div className="mb-8 flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="h-3 w-32 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-10 w-96 rounded-xl bg-mist dark:bg-slate-700" />
                            </div>
                            <div className="h-11 w-36 rounded-full bg-mist dark:bg-slate-700" />
                        </div>
                        <div className="grid gap-6 xl:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/90">
                                    <div className="mb-6 flex items-start justify-between">
                                        <div className="h-11 w-11 rounded-2xl bg-mist dark:bg-slate-700" />
                                        <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                    </div>
                                    <div className="h-7 w-3/4 rounded-lg bg-mist dark:bg-slate-700" />
                                    <div className="mt-3 h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="mt-2 h-4 w-5/6 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                                        <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                        <div className="flex gap-3">
                                            <div className="h-4 w-4 rounded bg-mist dark:bg-slate-700" />
                                            <div className="h-4 w-4 rounded bg-mist dark:bg-slate-700" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mission/Philosophy section */}
                    <div className="grid gap-8 rounded-[2rem] border border-line bg-panel p-8 shadow-soft lg:grid-cols-2 dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                        <div className="rounded-[1.75rem] bg-gradient-to-br from-navy to-teal p-8">
                            <div className="h-3 w-24 rounded-full bg-white/30" />
                            <div className="mt-4 h-9 w-3/4 rounded-xl bg-white/30" />
                            <div className="mt-6 space-y-2">
                                <div className="h-4 w-full rounded-full bg-white/30" />
                                <div className="h-4 w-full rounded-full bg-white/30" />
                                <div className="h-4 w-2/3 rounded-full bg-white/30" />
                            </div>
                        </div>
                        <div className="rounded-[1.75rem] border border-line bg-panel-alt p-8 dark:bg-panel/80">
                            <div className="h-3 w-32 rounded-full bg-mist dark:bg-slate-700" />
                            <div className="mt-4 h-9 w-4/5 rounded-xl bg-mist dark:bg-slate-700" />
                            <div className="mt-6 space-y-2">
                                <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-3/4 rounded-full bg-mist dark:bg-slate-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <main className="site-shell max-w-[1520px] animate-pulse py-10">
            {/* Header skeleton */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <div className="h-12 w-80 rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-3 h-5 w-64 rounded-full bg-mist dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-11 w-32 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="h-11 w-44 rounded-full bg-mist dark:bg-slate-700" />
                </div>
            </div>

            {/* Stats grid skeleton - 3 columns */}
            <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className={`overflow-hidden rounded-[2.5rem] border p-8 shadow-soft ${i === 1 ? 'border-line bg-panel dark:bg-panel/90' :
                        i === 2 ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/50 dark:bg-emerald-900/20' :
                            'border-amber-100 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/20'
                        }`}>
                        <div className="mb-8 flex items-center justify-between">
                            <div className={`h-14 w-14 rounded-2xl ${i === 1 ? 'bg-mist dark:bg-slate-700' :
                                i === 2 ? 'bg-emerald-100 dark:bg-emerald-800/50' :
                                    'bg-amber-100 dark:bg-amber-800/50'
                                }`} />
                            <div className={`h-6 w-16 rounded-full ${i === 1 ? 'bg-mist dark:bg-slate-700' :
                                i === 2 ? 'bg-emerald-100/50 dark:bg-emerald-800/30' :
                                    'bg-amber-100/50 dark:bg-amber-800/30'
                                }`} />
                        </div>
                        <div className={`h-3 w-32 rounded-full ${i === 1 ? 'bg-mist dark:bg-slate-700' :
                            i === 2 ? 'bg-emerald-200 dark:bg-emerald-800/50' :
                                'bg-amber-200 dark:bg-amber-800/50'
                            }`} />
                        <div className={`mt-4 h-12 w-28 rounded-xl ${i === 1 ? 'bg-mist dark:bg-slate-700' :
                            i === 2 ? 'bg-emerald-200 dark:bg-emerald-800/50' :
                                'bg-amber-200 dark:bg-amber-800/50'
                            }`} />
                    </div>
                ))}
            </div>

            {/* Activity table skeleton */}
            <section className="mt-10 overflow-hidden rounded-[2.5rem] border border-line bg-panel shadow-soft dark:bg-panel/90">
                <div className="flex items-center justify-between border-b border-line px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-ember" />
                        <div className="h-7 w-52 rounded-lg bg-mist dark:bg-slate-700" />
                    </div>
                    <div className="h-5 w-48 rounded-full bg-mist dark:bg-slate-700" />
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Table header */}
                        <div className="grid grid-cols-4 gap-4 bg-panel-alt/50 px-8 py-5 dark:bg-slate-800/30">
                            <div className="h-3 w-24 rounded-full bg-mist dark:bg-slate-700" />
                            <div className="h-3 w-20 rounded-full bg-mist dark:bg-slate-700" />
                            <div className="h-3 w-16 rounded-full bg-mist dark:bg-slate-700" />
                            <div className="h-3 w-28 rounded-full bg-mist dark:bg-slate-700" />
                        </div>
                        {/* Table rows */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="grid grid-cols-4 gap-4 border-t border-line/50 px-8 py-5 dark:border-slate-700/50">
                                <div className="h-5 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-6 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-32 rounded-full bg-mist dark:bg-slate-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

export function EmptyReports() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line bg-panel/50 px-8 py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mist">
                <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
            </div>
            <p className="font-display text-2xl font-bold text-navy">No reports published yet</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-muted">
                Intelligence reports will appear here once they are published through the admin upload workflow.
            </p>
        </div>
    );
}

export function EmptyBlogPosts() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-line bg-panel/50 px-8 py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-mist">
                <svg className="h-7 w-7 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
                </svg>
            </div>
            <p className="font-display text-xl font-bold text-navy">No featured insights yet</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-muted">
                Selected perspectives will appear here as new material is prepared.
            </p>
        </div>
    );
}

export function EmptyAdminActivity() {
    return (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-mist">
                <svg className="h-6 w-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="font-display text-lg font-bold text-navy">No recent activity</p>
            <p className="mt-2 max-w-xs text-sm text-muted">Upload your first report to see pipeline activity here.</p>
        </div>
    );
}

export function ReportsPageSkeleton() {
    return (
        <main className="site-shell py-12">
            <div className="grid gap-10 lg:grid-cols-[270px_1fr] animate-pulse">
                {/* Sidebar Skeleton */}
                <aside className="h-fit rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:sticky lg:top-28">
                    <div className="h-7 w-36 rounded-lg bg-mist dark:bg-slate-700" />
                    <div className="mt-1 h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-8 space-y-8">
                        {/* Filter sections */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="space-y-2">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="h-12 w-full rounded-xl bg-mist dark:bg-slate-700" />
                    </div>
                </aside>

                <div className="space-y-8">
                    {/* Header Section Skeleton */}
                    <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft">
                        <div className="h-12 w-80 rounded-xl bg-mist dark:bg-slate-700" />
                        <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-mist dark:bg-slate-700" />
                        <div className="mt-2 h-5 w-3/4 rounded-full bg-mist dark:bg-slate-700" />
                    </div>

                    {/* Filter Pills Skeleton */}
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-9 w-24 rounded-full bg-mist dark:bg-slate-700" />
                        ))}
                    </div>

                    {/* Report Cards Skeleton */}
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid gap-6 rounded-[2rem] border border-line bg-panel p-6 shadow-soft md:grid-cols-[220px_1fr]">
                                {/* Image skeleton */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-mist dark:bg-slate-700 aspect-[4/5]" />
                                {/* Content skeleton */}
                                <div className="flex flex-col space-y-4">
                                    <div className="h-3 w-32 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="h-8 w-full rounded-lg bg-mist dark:bg-slate-700" />
                                    <div className="h-8 w-3/4 rounded-lg bg-mist dark:bg-slate-700" />
                                    <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="h-4 w-2/3 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="mt-2 flex gap-4">
                                        <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                        <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((j) => (
                                            <div key={j} className="h-6 w-16 rounded-full bg-mist dark:bg-slate-700" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export function BlogPageSkeleton() {
    return (
        <main className="site-shell py-12">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="mb-10">
                    <div className="h-3 w-32 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-3 h-14 w-full max-w-4xl rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-2 h-14 w-3/4 max-w-3xl rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-5 h-5 w-full max-w-3xl rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-2 h-5 w-2/3 max-w-2xl rounded-full bg-mist dark:bg-slate-700" />
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1fr_300px]">
                    <div className="space-y-8 xl:col-span-1">
                        {/* Featured Post Skeleton */}
                        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-panel shadow-editorial md:grid-cols-[1.1fr_1fr]">
                            <div className="min-h-[360px] bg-mist dark:bg-slate-700" />
                            <div className="p-8 space-y-4">
                                <div className="h-3 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-32 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-9 w-full rounded-lg bg-mist dark:bg-slate-700" />
                                <div className="h-9 w-3/4 rounded-lg bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-2/3 rounded-full bg-mist dark:bg-slate-700" />
                            </div>
                        </div>

                        {/* Blog Grid Skeleton */}
                        <div className="grid gap-8 md:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                                    <div className="aspect-[16/10] bg-mist dark:bg-slate-700" />
                                    <div className="p-6 space-y-3">
                                        <div className="h-3 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                        <div className="h-7 w-full rounded-lg bg-mist dark:bg-slate-700" />
                                        <div className="h-7 w-2/3 rounded-lg bg-mist dark:bg-slate-700" />
                                        <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                        <div className="h-4 w-full rounded-full bg-mist dark:bg-slate-700" />
                                        <div className="h-3 w-28 rounded-full bg-mist dark:bg-slate-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6 xl:col-span-1">
                        <div className="rounded-[2rem] bg-ink p-6">
                            <div className="h-6 w-6 rounded bg-white/10" />
                            <div className="mt-5 h-8 w-40 rounded-lg bg-white/10" />
                            <div className="mt-3 h-4 w-full rounded-full bg-white/10" />
                            <div className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
                            <div className="mt-5 space-y-3">
                                <div className="h-10 w-full rounded-xl bg-white/10" />
                                <div className="h-10 w-full rounded-xl bg-white/10" />
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <div className="h-6 w-32 rounded-lg bg-mist dark:bg-slate-700" />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-7 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export function ContentManagementSkeleton() {
    return (
        <main className="site-shell max-w-[1520px] animate-pulse py-10">
            {/* Header skeleton */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <div className="h-4 w-36 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-2 h-12 w-72 rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-3 h-5 w-96 rounded-full bg-mist dark:bg-slate-700" />
                </div>
                <div className="h-14 w-44 rounded-full bg-mist dark:bg-slate-700" />
            </div>

            {/* Filters + Table skeleton */}
            <div className="overflow-hidden rounded-[2.5rem] border border-line bg-panel shadow-soft dark:bg-panel/90">
                {/* Filters bar */}
                <div className="flex flex-col gap-4 border-b border-line px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-3">
                        <div className="h-11 w-36 rounded-xl bg-mist dark:bg-slate-700" />
                        <div className="h-11 w-40 rounded-xl bg-mist dark:bg-slate-700" />
                        <div className="h-11 w-32 rounded-xl bg-mist dark:bg-slate-700" />
                    </div>
                    <div className="h-11 w-64 rounded-xl bg-mist dark:bg-slate-700" />
                </div>

                {/* Table skeleton */}
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Table header */}
                        <div className="grid grid-cols-6 gap-4 bg-panel-alt/50 px-8 py-5 dark:bg-slate-800/30">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-3 w-20 rounded-full bg-mist dark:bg-slate-700" />
                            ))}
                        </div>
                        {/* Table rows */}
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="grid grid-cols-6 gap-4 border-t border-line/50 px-8 py-5 dark:border-slate-700/50">
                                <div className="h-5 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-6 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-28 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-8 w-8 rounded-lg bg-mist dark:bg-slate-700" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination skeleton */}
                <div className="flex items-center justify-between border-t border-line px-8 py-6">
                    <div className="h-4 w-32 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-xl bg-mist dark:bg-slate-700" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export function AnalyticsSkeleton() {
    return (
        <main className="site-shell max-w-[1520px] animate-pulse py-10">
            {/* Header skeleton */}
            <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                    <div className="h-12 w-96 rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-mist dark:bg-slate-700" />
                </div>
                <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-11 w-28 rounded-2xl bg-mist dark:bg-slate-700" />
                    ))}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
                {/* Left column */}
                <div className="space-y-6">
                    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft dark:bg-panel/90">
                        {/* Traffic stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-[1.5rem] bg-panel-alt p-5 dark:bg-slate-800/50">
                                    <div className="h-4 w-28 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="h-10 w-24 rounded-xl bg-mist dark:bg-slate-700" />
                                        <div className="h-6 w-14 rounded-full bg-mist dark:bg-slate-700" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chart section */}
                        <div className="mt-6 rounded-[1.75rem] bg-mist p-6 dark:bg-slate-800/50">
                            <div className="h-7 w-48 rounded-lg bg-panel-alt dark:bg-slate-700" />
                            <div className="mt-2 h-4 w-64 rounded-full bg-panel-alt dark:bg-slate-700" />
                            <div className="mt-8 h-[320px] rounded-[1.5rem] bg-panel p-6 shadow-soft dark:bg-slate-900/50" />
                        </div>
                    </section>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Sector interest card */}
                    <section className="rounded-[2rem] bg-ink p-6 shadow-editorial">
                        <div className="h-7 w-40 rounded-lg bg-white/10" />
                        <div className="mt-6 flex justify-center">
                            <div className="h-56 w-56 rounded-full bg-white/10" />
                        </div>
                        <div className="mt-8 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="h-4 w-32 rounded-full bg-white/10" />
                                    <div className="h-4 w-12 rounded-full bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Export activity table */}
                    <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft dark:bg-panel/90">
                        <div className="flex items-center justify-between">
                            <div className="h-7 w-48 rounded-lg bg-mist dark:bg-slate-700" />
                            <div className="h-5 w-32 rounded-full bg-mist dark:bg-slate-700" />
                        </div>
                        <div className="mt-5 space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4 rounded-[1.25rem] border border-line p-4 dark:border-slate-700">
                                    <div className="h-4 w-32 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                    <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export function SubscribersSkeleton() {
    return (
        <main className="site-shell max-w-[1520px] animate-pulse py-10">
            {/* Header skeleton */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <div className="h-4 w-40 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="mt-2 h-12 w-64 rounded-xl bg-mist dark:bg-slate-700" />
                    <div className="mt-3 h-5 w-96 rounded-full bg-mist dark:bg-slate-700" />
                </div>
                <div className="flex gap-3">
                    <div className="h-12 w-32 rounded-full bg-mist dark:bg-slate-700" />
                    <div className="h-12 w-44 rounded-full bg-mist dark:bg-slate-700" />
                </div>
            </div>

            {/* Stats cards skeleton */}
            <div className="mb-10 grid gap-6 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft dark:bg-panel/90">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-12 w-12 rounded-2xl bg-mist dark:bg-slate-700" />
                        </div>
                        <div className="h-3 w-28 rounded-full bg-mist dark:bg-slate-700" />
                        <div className="mt-4 h-10 w-20 rounded-xl bg-mist dark:bg-slate-700" />
                        <div className="mt-3 h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                    </div>
                ))}
            </div>

            {/* Automation card skeleton */}
            <div className="mb-10 rounded-[2.5rem] border border-line bg-ink p-8 shadow-editorial">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="h-4 w-48 rounded-full bg-white/10" />
                        <div className="mt-4 h-9 w-64 rounded-xl bg-white/10" />
                        <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-white/10" />
                    </div>
                    <div className="h-7 w-40 rounded-full bg-white/10" />
                </div>
            </div>

            {/* Table skeleton */}
            <div className="overflow-hidden rounded-[2.5rem] border border-line bg-panel shadow-soft dark:bg-panel/90">
                <div className="flex items-center justify-between border-b border-line px-8 py-6">
                    <div className="flex gap-4">
                        <div className="h-9 w-48 rounded-full bg-mist dark:bg-slate-700" />
                        <div className="h-9 w-28 rounded-full bg-mist dark:bg-slate-700" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Table header */}
                        <div className="grid grid-cols-7 gap-4 bg-panel-alt/50 px-8 py-5 dark:bg-slate-800/30">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="h-3 w-20 rounded-full bg-mist dark:bg-slate-700" />
                            ))}
                        </div>
                        {/* Table rows */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="grid grid-cols-7 gap-4 border-t border-line/50 px-8 py-5 dark:border-slate-700/50">
                                <div className="h-5 w-full rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-24 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-28 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-4 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-6 w-16 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-6 w-20 rounded-full bg-mist dark:bg-slate-700" />
                                <div className="h-8 w-8 rounded-lg bg-mist dark:bg-slate-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
