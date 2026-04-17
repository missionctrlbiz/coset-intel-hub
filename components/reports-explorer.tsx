'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Download, Eye, Grid2X2, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { SectionReveal } from '@/components/section-reveal';
import { type Report } from '@/lib/site-data';
import { cosetOrgLinks, filterGroups } from '@/lib/site-data';

type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'title-az';

type ReportsExplorerProps = {
    initialReports: Report[];
    categoryFilters: string[];
    tagFilters: string[];
};

export function ReportsExplorer({ initialReports, categoryFilters, tagFilters }: ReportsExplorerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const initialQuery = searchParams?.get('q') || '';
    const initialCategory = searchParams?.get('category') || '';
    const initialTag = searchParams?.get('tag') || ''; // added tag
    const currentSort = normalizeSortOption(searchParams?.get('sort') ?? null);

    const displayReports = initialReports.filter(report => {
        if (initialCategory && !report.category.includes(initialCategory)) return false;
        if (initialTag && !report.tags.includes(initialTag)) return false;
        return true;
    }).sort((firstReport, secondReport) => compareReports(firstReport, secondReport, currentSort));

    const updateFilter = (type: 'category' | 'tag', value: string) => {
        const params = new URLSearchParams(searchParams?.toString() ?? '');
        if (params.get(type) === value) {
            params.delete(type);
        } else {
            params.set(type, value);
        }
        router.push(getReportsHref(params));
    };

    const updateSort = (value: string) => {
        const nextSort = normalizeSortOption(value);
        const params = new URLSearchParams(searchParams?.toString() ?? '');

        if (nextSort === 'newest') {
            params.delete('sort');
        } else {
            params.set('sort', nextSort);
        }

        router.push(getReportsHref(params));
    };

    const faqs = [
        {
            q: "What exactly is CoSET and what is its primary mission?",
            a: "The Coalition for Socio-Ecological Transformation (CoSET) is a dynamic network comprising citizens, non-governmental organizations (NGOs), civil society groups, and investigative journalists. Our primary mission is to bridge the widening gap between nature and society by fostering sustainable, equitable transformation. We advocate for policies that prioritize long-term ecological balance and social justice over short-term economic gains, ensuring that communities directly affected by environmental degradation have a powerful voice in shaping their future."
        },
        {
            q: "How does CoSET implement its advocacy and create real impact?",
            a: "We deploy a multi-faceted approach centered on evidence-based advocacy. This involves publishing comprehensive, deeply researched policy papers that provide actionable insights and alternatives to current practices. Additionally, we organize community empowerment workshops aimed at equipping local leaders and activists with the knowledge and tools they need to advocate for their rights. By acting as a nexus between grassroots movements and high-level policy making, CoSET ensures that systemic change is both inclusive and effective."
        },
        {
            q: "What is the 'Growth Model' critique often mentioned in your reports?",
            a: "The 'Growth Model' critique challenges the dominant global economic paradigm that measures national development strictly through Gross Domestic Product (GDP) growth. CoSET argues that this relentless pursuit of infinite economic expansion on a planet with finite resources is inherently unsustainable. It ignores critical ecological limits, exacerbates climate change, and systematically entrenches social inequalities by prioritizing corporate profits over community well-being and environmental health. We advocate for a 'post-growth' or 'degrowth' framework that redefines progress in terms of human flourishing, ecological regeneration, and equitable resource distribution."
        }
    ];

    return (
        <div className="grid gap-10 lg:grid-cols-[270px_1fr]">
            <aside className="h-fit rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:sticky lg:top-28">
                <p className="font-display text-2xl font-bold text-navy">Research Filters</p>
                <p className="mt-1 text-sm text-muted">Climate justice, divestment, and just transition research.</p>
                <div className="mt-8 space-y-8">
                    <FilterSection
                        title="Categories"
                        items={categoryFilters.length > 0 ? categoryFilters : filterGroups.categories}
                        selectedValue={initialCategory}
                        onChange={(val) => updateFilter('category', val)}
                    />
                    <FilterSection
                        title="Regions"
                        items={filterGroups.regions}
                        selectedValue={searchParams?.get('region') || ''}
                        onChange={() => { }}
                    />
                    <FilterSection
                        title="Tags"
                        items={tagFilters.length > 0 ? tagFilters : filterGroups.tags}
                        selectedValue={initialTag}
                        onChange={(val) => updateFilter('tag', val)}
                    />
                    <button className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">Export Data</button>
                </div>
            </aside>

            <div className="space-y-8">
                <SectionReveal>
                    <div className="relative overflow-hidden flex flex-col justify-end gap-6 rounded-[2rem] border border-line bg-panel p-8 shadow-soft md:p-12 min-h-[280px]">
                        {/* Background Effect context aware */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src="/coset-eye-banner.jpg"
                                alt="Intelligence background"
                                fill
                                className="object-cover opacity-50 mix-blend-overlay dark:opacity-30 dark:mix-blend-luminosity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/80 to-transparent dark:from-panel dark:via-panel/90 dark:to-transparent/20" />
                            <div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/90 to-transparent dark:from-panel dark:via-panel/90 dark:to-transparent" />
                        </div>

                        <div className="relative z-10 max-w-2xl">
                            <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink drop-shadow-sm">
                                {initialQuery ? `Search Results: "${initialQuery}"` : 'Intelligence Reports'}
                            </h1>
                            <p className="mt-3 text-lg leading-8 text-muted font-medium">
                                {initialQuery ? `Found ${displayReports.length} results matching your search.` : 'Position papers on economic divestment, climate-induced loss and damage, just transition frameworks, and governance reform across Nigeria.'}
                            </p>
                        </div>
                    </div>
                </SectionReveal>

                <SectionReveal delay={0.08}>
                    <div className="flex flex-col gap-4 border-b border-line pb-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3 xl:min-w-0 xl:flex-1">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                <span>{displayReports.length} reports</span>
                                {initialCategory ? <span className="text-ember">Filtered</span> : null}
                            </div>
                            <div className="rounded-[1.5rem] border border-line bg-panel/70 p-2 shadow-soft dark:bg-panel-alt/40">
                                <div className="flex flex-wrap gap-2">
                                    {(categoryFilters.length > 0 ? categoryFilters : filterGroups.categories).map((item) => (
                                        <button
                                            key={item}
                                            onClick={() => updateFilter('category', item)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${initialCategory === item ? 'bg-ember text-white shadow-soft' : 'bg-mist text-muted hover:bg-panel-alt hover:text-ink dark:bg-panel dark:hover:bg-mist dark:hover:text-white'}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex self-start rounded-[1.5rem] border border-line bg-panel px-3 py-3 shadow-soft dark:bg-panel-alt/50">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                                <div className="flex items-center gap-1 rounded-xl border border-line bg-mist p-1 dark:bg-panel">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        aria-label="Grid view"
                                        className={`rounded-lg p-2 transition ${viewMode === 'grid' ? 'bg-panel text-navy shadow-sm dark:bg-mist dark:text-white' : 'text-muted hover:bg-panel hover:text-navy dark:hover:bg-panel-alt dark:hover:text-white'}`}
                                    >
                                        <Grid2X2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        aria-label="List view"
                                        className={`rounded-lg p-2 transition ${viewMode === 'list' ? 'bg-panel text-navy shadow-sm dark:bg-mist dark:text-white' : 'text-muted hover:bg-panel hover:text-navy dark:hover:bg-panel-alt dark:hover:text-white'}`}
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="h-6 w-px bg-line" />
                                <label className="flex items-center gap-2 whitespace-nowrap">
                                    <SlidersHorizontal className="h-4 w-4" />
                                    <span>Sort by:</span>
                                    <div className="relative">
                                        <select
                                            aria-label="Sort reports"
                                            value={currentSort}
                                            onChange={(event) => updateSort(event.target.value)}
                                            className="appearance-none rounded-xl border border-line bg-mist py-2 pl-3 pr-9 font-semibold text-navy transition outline-none hover:border-muted dark:bg-panel dark:text-white"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="oldest">Oldest</option>
                                            <option value="most-viewed">Most viewed</option>
                                            <option value="title-az">Title A-Z</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </SectionReveal>

                <div className={viewMode === 'grid' ? "grid gap-6 md:grid-cols-2 lg:grid-cols-2" : "space-y-6"}>
                    {displayReports.length === 0 ? (
                        <div className={`col-span-full rounded-[2rem] border-2 border-dashed border-line bg-panel/50 px-8 py-20 text-center`}>
                            <p className="font-display text-2xl font-bold text-navy">No reports found</p>
                            <p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        displayReports.map((report, index) => (
                            <SectionReveal key={report.slug} delay={index * 0.05} className={viewMode === 'grid' ? 'h-full flex' : ''}>
                                <article className={`group flex w-full rounded-[2rem] border border-line bg-panel p-5 shadow-soft transition hover:shadow-editorial ${viewMode === 'grid' ? 'flex-col gap-5' : 'flex-col gap-6 md:flex-row md:items-start md:p-6'}`}>
                                    <div className={`relative overflow-hidden rounded-[1.5rem] bg-mist shrink-0 ${viewMode === 'grid' ? 'aspect-video w-full' : 'aspect-[4/5] w-full md:w-[220px]'}`}>
                                        <Image src={report.image} alt={report.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{report.category[0]}</p>
                                                <Link href={`/reports/${report.slug}`} className={`mt-3 block font-display font-extrabold leading-tight tracking-[-0.05em] text-navy hover:text-ember dark:text-ember dark:hover:text-white transition-colors ${viewMode === 'grid' ? 'text-2xl' : 'text-3xl'}`}>
                                                    {report.title}
                                                </Link>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1 text-sm text-muted">
                                                <Eye className="h-4 w-4" />
                                                {report.views}
                                            </div>
                                        </div>
                                        <p className={`mt-4 text-sm leading-7 text-muted line-clamp-2`}>{report.description}</p>

                                        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-medium text-muted">
                                            <span className="font-bold text-navy">{report.author}</span>
                                            <span>•</span>
                                            <span>{report.publishedAt}</span>
                                            <span>•</span>
                                            <span>{report.readTime}</span>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {report.tags.map((tag: string) => (
                                                <span key={tag} className="rounded-full bg-mist px-3 py-1 text-[11px] font-semibold text-muted dark:bg-panel-alt">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                                            <Link href={`/reports/${report.slug}`} className="inline-flex items-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy transition hover:border-navy">
                                                Read
                                            </Link>
                                            {report.downloadHref ? (
                                                <Link href={report.downloadHref} className="inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                                                    <Download className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Download</span>
                                                </Link>
                                            ) : (
                                                <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-ember/50 px-4 py-3 text-sm font-semibold text-white/70">
                                                    <Download className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Download</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            </SectionReveal>
                        ))
                    )}
                </div>

                <SectionReveal delay={0.08}>
                    <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Frequently Asked Questions</p>
                            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Common Questions About CoSET</h2>
                            <p className="mt-2 text-sm text-muted">Everything you need to know about our approach and methodology.</p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className={`overflow-hidden rounded-[1.5rem] border transition-colors ${openFaq === idx ? 'border-ember bg-panel shadow-sm' : 'border-line bg-panel-alt hover:border-muted/30 dark:bg-panel/40'}`}>
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                                    >
                                        <h3 className={`font-display text-xl font-bold pr-4 transition-colors ${openFaq === idx ? 'text-ember' : 'text-navy hover:text-navy/80'}`}>{faq.q}</h3>
                                        <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-ember' : ''}`} />
                                    </button>
                                    <div className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <p className="px-6 pb-6 text-sm leading-8 text-muted">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
    );
}

function normalizeSortOption(value: string | null): SortOption {
    switch (value) {
        case 'oldest':
        case 'most-viewed':
        case 'title-az':
            return value;
        default:
            return 'newest';
    }
}

function getReportsHref(params: URLSearchParams) {
    const queryString = params.toString();
    return queryString ? `/reports?${queryString}` : '/reports';
}

function compareReports(firstReport: Report, secondReport: Report, sortOption: SortOption) {
    switch (sortOption) {
        case 'oldest':
            return getPublishedTimestamp(firstReport) - getPublishedTimestamp(secondReport);
        case 'most-viewed':
            return secondReport.viewsCount - firstReport.viewsCount;
        case 'title-az':
            return firstReport.title.localeCompare(secondReport.title);
        case 'newest':
        default:
            return getPublishedTimestamp(secondReport) - getPublishedTimestamp(firstReport);
    }
}

function getPublishedTimestamp(report: Report) {
    const timestamp = Date.parse(report.publishedAt);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function FilterSection({ title, items, selectedValue, onChange }: { title: string; items: string[]; selectedValue: string; onChange: (val: string) => void }) {
    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{title}</p>
            <div className="space-y-3 text-sm text-muted">
                {items.map((item) => (
                    <label key={item} className="flex items-center gap-3 cursor-pointer hover:text-navy transition-colors">
                        <input
                            type="checkbox"
                            checked={selectedValue === item}
                            onChange={() => onChange(item)}
                            className="accent-ember border-line/50 cursor-pointer h-4 w-4 rounded-sm"
                        />
                        {item}
                    </label>
                ))}
            </div>
        </div>
    );
}
