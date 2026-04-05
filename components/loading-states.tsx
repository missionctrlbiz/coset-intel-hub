export function HomepageSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Hero skeleton */}
            <section className="relative overflow-hidden bg-ink">
                <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pb-28 lg:pt-28">
                    <div className="max-w-3xl space-y-5">
                        <div className="h-3 w-40 rounded-full bg-white/10" />
                        <div className="h-14 w-full rounded-2xl bg-white/10" />
                        <div className="h-14 w-3/4 rounded-2xl bg-white/10" />
                        <div className="h-5 w-2/3 rounded-full bg-white/10" />
                        <div className="mt-8 flex gap-4">
                            <div className="h-12 w-44 rounded-full bg-white/10" />
                            <div className="h-12 w-48 rounded-full bg-white/10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Reports skeleton */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-8 space-y-3">
                    <div className="h-3 w-32 rounded-full bg-mist" />
                    <div className="h-10 w-96 rounded-xl bg-mist" />
                </div>
                <div className="grid gap-6 xl:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <div className="mb-6 flex items-start justify-between">
                                <div className="h-11 w-11 rounded-2xl bg-mist" />
                                <div className="h-4 w-24 rounded-full bg-mist" />
                            </div>
                            <div className="h-7 w-3/4 rounded-lg bg-mist" />
                            <div className="mt-3 h-4 w-full rounded-full bg-mist" />
                            <div className="mt-2 h-4 w-5/6 rounded-full bg-mist" />
                            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                                <div className="h-4 w-20 rounded-full bg-mist" />
                                <div className="flex gap-3">
                                    <div className="h-4 w-4 rounded bg-mist" />
                                    <div className="h-4 w-4 rounded bg-mist" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <div className="min-w-0 flex-1 animate-pulse px-4 py-10 sm:px-6 lg:px-10">
            {/* Header skeleton */}
            <div className="mb-10">
                <div className="h-12 w-80 rounded-xl bg-mist" />
                <div className="mt-3 h-5 w-64 rounded-full bg-mist" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`rounded-[2rem] p-6 shadow-soft ${i === 4 ? 'bg-ember/20' : 'border border-line bg-panel'}`}>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="h-11 w-11 rounded-2xl bg-mist" />
                            <div className="h-6 w-14 rounded-full bg-mist" />
                        </div>
                        <div className="h-3 w-28 rounded-full bg-mist" />
                        <div className="mt-3 h-10 w-24 rounded-xl bg-mist" />
                    </div>
                ))}
            </div>

            {/* Activity table skeleton */}
            <div className="mt-10">
                <div className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                    <div className="border-b border-line px-6 py-5">
                        <div className="h-7 w-40 rounded-lg bg-mist" />
                    </div>
                    <div className="space-y-0">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-6 border-t border-line px-6 py-5">
                                <div className="h-5 w-48 rounded-full bg-mist" />
                                <div className="h-4 w-28 rounded-full bg-mist" />
                                <div className="h-6 w-20 rounded-full bg-mist" />
                                <div className="h-4 w-24 rounded-full bg-mist" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
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
            <p className="font-display text-xl font-bold text-navy">No editorial posts yet</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-muted">
                Blog posts from the editorial desk will appear as they are published.
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
