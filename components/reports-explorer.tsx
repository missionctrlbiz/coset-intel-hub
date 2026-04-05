'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Download, Eye, Grid2X2, List, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

import { SectionReveal } from '@/components/section-reveal';
import { type Report } from '@/lib/site-data';
import { cosetOrgLinks, filterGroups } from '@/lib/site-data';

type ReportsExplorerProps = {
    initialReports: any[];
    categoryFilters: string[];
    tagFilters: string[];
};

export function ReportsExplorer({ initialReports, categoryFilters, tagFilters }: ReportsExplorerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const initialQuery = searchParams.get('q') || '';
    const initialCategory = searchParams.get('category') || '';
    const initialTag = searchParams.get('tag') || '';
    
    // We can do real-time filtering if they are loaded, or rely on URL changes.
    // The instructions say "filter state with URL search params"
    const displayReports = initialReports.filter(report => {
        if (initialCategory && !report.category.includes(initialCategory)) return false;
        if (initialTag && !report.tags.includes(initialTag)) return false;
        return true;
    });

    const updateFilter = (type: 'category' | 'tag', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get(type) === value) {
            params.delete(type); // toggle off
        } else {
            params.set(type, value);
        }
        router.push(`/reports?${params.toString()}`);
    };

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
                    <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-line bg-panel p-8 shadow-soft md:flex-row md:items-end">
                        <div>
                            <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">
                                {initialQuery ? `Search Results: "${initialQuery}"` : 'Intelligence Reports'}
                            </h1>
                            <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
                                {initialQuery ? `Found ${displayReports.length} results matching your search.` : 'Position papers on economic divestment, climate-induced loss and damage, just transition frameworks, and governance reform across Nigeria.'}
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
                                <button 
                                    key={item}
                                    onClick={() => updateFilter('category', item)} 
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${initialCategory === item ? 'bg-blue-100 text-navy' : 'bg-panel text-muted shadow-soft hover:bg-mist'}`}>
                                    {item}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                            <SlidersHorizontal className="h-4 w-4" />
                            Sort by: <span className="font-semibold text-navy">Newest</span>
                        </div>
                    </div>
                </SectionReveal>

                <div className="space-y-6">
                    {displayReports.length === 0 ? (
                        <div className="rounded-[2rem] border-2 border-dashed border-line bg-panel/50 px-8 py-20 text-center">
                            <p className="font-display text-2xl font-bold text-navy">No reports found</p>
                            <p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        displayReports.map((report, index) => (
                            <SectionReveal key={report.slug} delay={index * 0.05}>
                                <article className="grid gap-6 rounded-[2rem] border border-line bg-panel p-5 shadow-soft transition hover:shadow-editorial md:grid-cols-[220px_1fr] md:p-6">
                                    <div className="relative overflow-hidden rounded-[1.5rem] bg-mist">
                                        <div className="relative aspect-[4/5]">
                                            <Image src={report.image} alt={report.title} fill sizes="(max-width: 768px) 100vw, 220px" className="object-cover" />
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
                                            {report.tags.map((tag: string) => (
                                                <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-muted">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                                            <Link href={`/reports/${report.slug}`} className="inline-flex items-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy transition hover:border-navy">
                                                Save
                                            </Link>
                                            <button className="inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                                                <Download className="h-4 w-4" />
                                                Download PDF
                                            </button>
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
    );
}

function FilterSection({ title, items, selectedValue, onChange }: { title: string; items: string[]; selectedValue: string; onChange: (val: string) => void }) {
    return (
        <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">{title}</p>
            <div className="space-y-3 text-sm text-muted">
                {items.map((item) => (
                    <label key={item} className="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            checked={selectedValue === item} 
                            onChange={() => onChange(item)}
                            className="accent-ember border-line/50" 
                        />
                        {item}
                    </label>
                ))}
            </div>
        </div>
    );
}
