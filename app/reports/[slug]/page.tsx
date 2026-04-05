import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, Download, Link2, Share2, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';

import { SectionReveal } from '@/components/section-reveal';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPublishedReportBySlug, getPublishedReportSlugs, getRelatedReports } from '@/lib/content';
import { sanitizeHtml } from '@/lib/sanitize';
import { FloatingChatWidget } from '@/components/floating-chat';

export const revalidate = 300;

export async function generateStaticParams() {
    const slugs = await getPublishedReportSlugs();

    return slugs.map((slug) => ({ slug }));
}

export default async function ReportDetailPage({ params }: { params: { slug: string } }) {
    const report = await getPublishedReportBySlug(params.slug);

    if (!report) {
        notFound();
    }

    const relatedReports = await getRelatedReports(report.slug, report.category);

    return (
        <>
            <SiteHeader dark />
            <main>
                <section className="relative overflow-hidden bg-ink text-white">
                    <div className="absolute inset-0">
                        <Image src={report.image} alt={report.title} fill priority sizes="100vw" className="object-cover opacity-20" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/70" />
                    <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="max-w-4xl">
                            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/65">
                                <Link href="/reports" className="hover:text-white">Reports</Link>
                                <span>›</span>
                                <span>{report.category[0]}</span>
                                <span>›</span>
                                <span className="text-white">Nigeria 2024</span>
                            </div>
                            <h1 className="max-w-5xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                                {report.title.split(' ').slice(0, -2).join(' ')} <span className="text-ember">{report.title.split(' ').slice(-2).join(' ')}</span>
                            </h1>
                            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/75">
                                <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {report.publishedAt}</div>
                                <div className="flex items-center gap-2"><UserRound className="h-4 w-4" /> Lead: {report.author}</div>
                                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> {report.readTime}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_1fr_320px] lg:px-8">
                    <SectionReveal className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
                        <div className="rounded-[1.75rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="mb-4 font-display text-lg font-bold text-navy">Report Highlights</p>
                            <ol className="space-y-4 text-sm text-muted">
                                {report.highlight.map((item, index) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="font-bold text-ember">{String(index + 1).padStart(2, '0')}.</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="rounded-[1.75rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="mb-4 font-display text-lg font-bold text-navy">Key Entities</p>
                            <div className="flex flex-wrap gap-2">
                                {report.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-navy">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SectionReveal>                    <SectionReveal className="space-y-10">
                        <div className="text-xl font-medium leading-relaxed text-ink/80">
                            {report.description}
                        </div>

                        <article className="prose prose-slate prose-lg max-w-none rounded-[2rem] border border-line bg-panel p-8 shadow-editorial dark:prose-invert">
                            <h2>Executive Findings</h2>
                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(report.html_content) }} />
                            {!report.html_content && (
                                <>
                                    <p>
                                        Our research indicates that the multi-modal stress factors are no longer seasonal anomalies. Instead, they have become systemic components of the regional ecological identity. The data, compiled over a 36-month observational period, reveals a significant decoupling between traditional ecological knowledge and the current environmental reality.
                                    </p>
                                    <blockquote>{report.quote}</blockquote>
                                    <h3>Regional Stress Mapping</h3>
                                    <div className="not-prose overflow-hidden rounded-[1.5rem] border border-line bg-mist">
                                        <div className="relative aspect-[16/10]">
                                            <Image src={report.image} alt="Regional mapping" fill sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </article>

                        <div className="grid gap-4 md:grid-cols-2">
                            {report.metrics.map((metric) => (
                                <div key={metric.label} className="rounded-[1.75rem] border border-line bg-panel p-6 shadow-soft">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{metric.label}</p>
                                    <div className="mt-4 flex items-end justify-between gap-3">
                                        <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-ember">{metric.value}</p>
                                        <div className="h-1.5 flex-1 rounded-full bg-mist">
                                            <div className="h-1.5 w-2/3 rounded-full bg-navy" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-muted">{metric.note}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[2rem] bg-panel p-8 shadow-soft">
                            <div className="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-navy">Related Research</h3>
                                    <p className="mt-2 text-sm text-muted">Extend your understanding through adjacent intelligence.</p>
                                </div>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                {relatedReports.map((related, index) => (
                                    <Link key={related.slug} href={`/reports/${related.slug}`} className="overflow-hidden rounded-[1.5rem] border border-line bg-mist transition hover:-translate-y-1 hover:shadow-soft">
                                        <div className="relative aspect-[16/10]">
                                            <Image src={related.image} alt={related.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                        </div>
                                        <div className="p-5">
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{related.category[0]}</p>
                                            <h4 className="mt-2 font-display text-xl font-bold tracking-[-0.04em] text-navy">{related.title}</h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SectionReveal>

                    <SectionReveal className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
                        <div className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                            <p className="font-display text-2xl font-bold">Report Assets</p>
                            <p className="mt-3 text-sm leading-7 text-white/70">Access the full technical analysis, methodology notes, and downloadable resources for this report.</p>
                            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </button>
                            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-white/75">
                                <span className="text-xs font-bold uppercase tracking-[0.18em]">Share Insight</span>
                                <div className="flex gap-3">
                                    <button type="button" aria-label="Share report" title="Share report"><Share2 className="h-4 w-4" /></button>
                                    <button type="button" aria-label="Copy report link" title="Copy report link"><Link2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Related Analysis</p>
                            {relatedReports.map((related) => (
                                <Link key={related.slug} href={`/reports/${related.slug}`} className="block rounded-[1.25rem] border border-line p-4 transition hover:border-ember">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{related.category[0]}</p>
                                    <p className="mt-2 font-display text-lg font-bold text-navy">{related.title}</p>
                                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-muted">
                                        <span>{related.publishedAt}</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </SectionReveal>
                </section>
            </main>
            <FloatingChatWidget slug={report.slug} />
            <SiteFooter />
        </>
    );
}