import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Download, Eye, Grid2X2, List, SlidersHorizontal } from 'lucide-react';

import { SectionReveal } from '@/components/section-reveal';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPublishedReports } from '@/lib/content';
import { cosetOrgLinks, filterGroups } from '@/lib/site-data';

export const revalidate = 300;

export default async function ReportsPage() {
    const reports = await getPublishedReports();
    const categoryFilters = Array.from(new Set(reports.flatMap((report) => report.category)));
    const tagFilters = Array.from(new Set(reports.flatMap((report) => report.tags)));

    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[270px_1fr]">
                    <aside className="h-fit rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:sticky lg:top-28">
                        <p className="font-display text-2xl font-bold text-navy">Research Filters</p>
                        <p className="mt-1 text-sm text-muted">Climate justice, divestment, and just transition research.</p>
                        <div className="mt-8 space-y-8">
                            <FilterSection title="Categories" items={categoryFilters.length > 0 ? categoryFilters : filterGroups.categories} />
                            <FilterSection title="Regions" items={filterGroups.regions} />
                            <FilterSection title="Tags" items={tagFilters.length > 0 ? tagFilters : filterGroups.tags} />
                            <button className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">Export Data</button>
                        </div>
                    </aside>

                    <div className="space-y-8">
                        <SectionReveal>
                            <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-line bg-panel p-8 shadow-soft md:flex-row md:items-end">
                                <div>
                                    <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Intelligence Reports</h1>
                                    <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
                                        Position papers on economic divestment, climate-induced loss and damage, just transition frameworks, and governance reform across Nigeria.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button type="button" aria-label="Grid view" title="Grid view" className="rounded-xl border border-line bg-panel-alt p-3 text-navy"><Grid2X2 className="h-4 w-4" /></button>
                                    <button type="button" aria-label="List view" title="List view" className="rounded-xl border border-line bg-panel p-3 text-muted"><List className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </SectionReveal>

                        <SectionReveal delay={0.08}>
                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div className="flex flex-wrap gap-2">
                                    {(categoryFilters.length > 0 ? categoryFilters : filterGroups.categories).map((item, index) => (
                                        <span key={item} className={`rounded-full px-4 py-2 text-sm font-medium ${index === 0 ? 'bg-blue-100 text-navy' : 'bg-panel text-muted shadow-soft'}`}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    Sort by: <span className="font-semibold text-navy">Newest</span>
                                </div>
                            </div>
                        </SectionReveal>

                        <div className="space-y-6">
                            {reports.map((report, index) => (
                                <SectionReveal key={report.slug} delay={index * 0.05}>
                                    <article className="grid gap-6 rounded-[2rem] border border-line bg-panel p-5 shadow-soft transition hover:shadow-editorial md:grid-cols-[220px_1fr] md:p-6">
                                        <div className="relative overflow-hidden rounded-[1.5rem] bg-mist">
                                            <div className="relative aspect-[4/5]">
                                                <Image src={report.image} alt={report.title} fill className="object-cover" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{report.category[0]}</p>
                                                    <Link href={`/reports/${report.slug}`} className="mt-3 block font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-navy hover:text-ember">
                                                        {report.title}
                                                    </Link>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted">
                                                    <Eye className="h-4 w-4" />
                                                    {report.views}
                                                </div>
                                            </div>
                                            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{report.description}</p>
                                            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted">
                                                <span className="font-semibold text-navy">{report.author}</span>
                                                <span>{report.publishedAt}</span>
                                                <span>{report.readTime}</span>
                                            </div>
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {report.tags.map((tag) => (
                                                    <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-muted">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                                                <Link href={`/reports/${report.slug}`} className="inline-flex items-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy transition hover:border-navy">
                                                    Read Report
                                                </Link>
                                                {report.downloadHref ? (
                                                    <Link href={report.downloadHref} className="inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                                                        <Download className="h-4 w-4" />
                                                        Download PDF
                                                    </Link>
                                                ) : (
                                                    <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-ember/50 px-4 py-3 text-sm font-semibold text-white/70">
                                                        <Download className="h-4 w-4" />
                                                        Download PDF
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                </SectionReveal>
                            ))}
                        </div>

                        <SectionReveal delay={0.08}>
                            <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Frequently Asked Questions</p>
                                    <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Common Questions About CoSET</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="rounded-[1.5rem] border border-line bg-panel-alt p-6 dark:bg-panel/60">
                                        <h3 className="font-display text-xl font-bold text-navy">What is CoSET?</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted">
                                            A network of citizens, NGOs, and journalists established to reconnect nature and society through sustainable transformation.
                                        </p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-line bg-panel-alt p-6 dark:bg-panel/60">
                                        <h3 className="font-display text-xl font-bold text-navy">How does it work?</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted">
                                            Through evidence-based advocacy, policy papers, and community empowerment workshops.
                                        </p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-line bg-panel-alt p-6 dark:bg-panel/60">
                                        <h3 className="font-display text-xl font-bold text-navy">What is the &quot;Growth Model&quot; critique?</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted">
                                            CoSET argues that defining development solely through GDP growth ignores ecological limits and entrenches social inequalities.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SectionReveal>

                        <SectionReveal delay={0.12}>
                            <div className="grid gap-6 rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:p-8 dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Need The Full Organization Context?</p>
                                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">Continue to CoSET’s main publications and advocacy site</h2>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                                        This hub curates report discovery. For CoSET’s live position papers, public campaigns, events, and direct organizational updates, continue to the main site.
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Link href={cosetOrgLinks.positionPapers} className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-white transition hover:brightness-110">
                                            Open Position Papers
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                        <Link href={cosetOrgLinks.mainSite} className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-navy transition hover:border-navy">
                                            Visit Main Site
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="rounded-[1.5rem] border border-line bg-panel-alt p-5 dark:bg-panel/80">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Live CoSET Links</p>
                                    <div className="mt-4 space-y-3 text-sm">
                                        <Link href={cosetOrgLinks.about} className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 font-medium text-navy transition hover:border-navy dark:bg-panel-alt/40">
                                            About CoSET
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                        <Link href={cosetOrgLinks.contact} className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 font-medium text-navy transition hover:border-navy dark:bg-panel-alt/40">
                                            Contact The Team
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                        <Link href={cosetOrgLinks.donate} className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-3 font-medium text-navy transition hover:border-navy dark:bg-panel-alt/40">
                                            Support CoSET
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SectionReveal>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}

function FilterSection({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{title}</p>
            <div className="space-y-3 text-sm text-muted">
                {items.map((item, index) => (
                    <label key={item} className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked={index === 0} className="accent-ember" />
                        {item}
                    </label>
                ))}
            </div>
        </div>
    );
}