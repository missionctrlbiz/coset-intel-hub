import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, ChevronRight, Clock3, Download, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';

import { FloatingChatWidget } from '@/components/floating-chat';
import { ReportViewTracker } from '@/components/report-view-tracker';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { getPublishedReportBySlug, getPublishedReportSlugs } from '@/lib/content';
import { sanitizeHtml } from '@/lib/sanitize';

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
    return (
        <>
            <ReportViewTracker reportId={report.id} />
            <SiteHeader dark />
            <main>
                <section className="site-shell py-5 sm:py-6">
                    <div className="rounded-[1.35rem] border border-white/10 bg-[#08111d] px-4 py-3 shadow-[0_16px_36px_rgb(2_6_23/0.28)] sm:px-5">
                        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/72">
                            <Link href="/" className="font-medium transition hover:text-white">Home</Link>
                            <ChevronRight className="h-4 w-4 opacity-45" />
                            <Link href="/reports" className="font-medium transition hover:text-white">Reports</Link>
                            <ChevronRight className="h-4 w-4 opacity-45" />
                            <span className="max-w-[34rem] truncate font-semibold text-white">{report.title}</span>
                        </nav>
                    </div>
                </section>

                <section className="site-shell pb-8 sm:pb-10">
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1626] text-white shadow-editorial dark:bg-[#0d1828]">
                        <div className="absolute inset-0">
                            <Image src={report.image} alt={report.title} fill priority className="object-cover opacity-22" />
                        </div>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,18,0.5)_0%,rgba(5,10,18,0.78)_100%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,18,0.78)_0%,rgba(5,10,18,0.72)_36%,rgba(5,10,18,0.44)_62%,rgba(5,10,18,0.18)_100%)]" />
                        <div className="relative px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
                            <div className="max-w-4xl rounded-[1.75rem] bg-black/25 px-5 py-5 backdrop-blur-[2px] sm:px-6 sm:py-6 lg:bg-black/15">
                                <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                                    {report.title}
                                </h1>
                                {report.description ? (
                                    <p className="mt-5 max-w-3xl text-base leading-8 text-white/96 sm:text-lg">
                                        {report.description}
                                    </p>
                                ) : null}
                                {report.category.length > 0 ? (
                                    <div className="mt-6 flex flex-wrap gap-2.5">
                                        {report.category.map((category) => (
                                            <span
                                                key={category}
                                                className="rounded-full border border-white/18 bg-black/20 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                <div className="mt-7 flex flex-wrap items-center gap-6 text-sm text-white/92">
                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-ember" /> {report.publishedAt}</div>
                                    <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-ember" /> Lead: {report.author}</div>
                                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-ember" /> {report.readTime}</div>
                                </div>
                                {report.downloadHref ? (
                                    <div className="mt-8">
                                        <Link
                                            href={report.downloadHref}
                                            className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download report
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="site-shell py-10 sm:py-12">
                    <div className="space-y-10">
                        <article className="report-prose prose prose-slate prose-lg max-w-none rounded-[2.2rem] border border-line p-6 shadow-editorial backdrop-blur-sm sm:p-8 lg:p-10 lg:px-12">
                            {report.html_content ? (
                                <div className="report-prose__content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(report.html_content) }} />
                            ) : (
                                <div className="rounded-[1.5rem] border border-dashed border-line bg-mist px-6 py-12 text-center text-muted not-prose">
                                    This report is published, but the formatted body is still being prepared.
                                </div>
                            )}
                        </article>
                        <div className="flex justify-center pt-1 text-center">
                            <Link href="/reports" className="text-sm font-semibold text-navy underline decoration-ember/45 underline-offset-4 transition hover:text-ember dark:text-white dark:decoration-white/35 dark:hover:text-ember">
                                Back to all reports
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
            <FloatingChatWidget mode="report" slug={report.slug} reportTitle={report.title} />
        </>
    );
}