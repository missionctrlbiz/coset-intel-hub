import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";

import { SectionReveal } from "@/components/section-reveal";
import { SiteHeader } from "@/components/site-header";
import {
  getPublishedReportBySlug,
  getPublishedReportSlugs,
  getPublishedReports,
} from "@/lib/content";
import { cosetOrgLinks } from "@/lib/site-data";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublishedReportSlugs();

  return slugs.map((slug) => ({ slug }));
}

export default async function ReportDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const report = await getPublishedReportBySlug(params.slug);

  if (!report) {
    notFound();
  }

  const reports = await getPublishedReports();
  const relatedReports = reports
    .filter((entry) => entry.slug !== report.slug)
    .slice(0, 3);

  return (
    <>
      <SiteHeader dark />
      <main>
        <section className="relative overflow-hidden bg-ink text-white">
          <div className="absolute inset-0">
            <Image
              src={report.image}
              alt={report.title}
              fill
              priority
              className="object-cover opacity-20"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/78" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/70">
                <Link href="/reports" className="transition hover:text-white">
                  Reports
                </Link>
                <span>›</span>
                <span>{report.category[0] ?? "Report"}</span>
              </div>

              <h1 className="max-w-5xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
                {report.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
                {report.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {report.publishedAt}
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {report.author}
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {report.readTime}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
          <SectionReveal className="space-y-8">
            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                Overview
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                About this report
              </h2>
              <p className="mt-4 text-base leading-8 text-muted">
                {report.description}
              </p>
            </section>

            {report.highlight.length > 0 ? (
              <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Key findings
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                  What stands out in this publication
                </h2>
                <ul className="mt-6 space-y-4">
                  {report.highlight.map((item, index) => (
                    <li
                      key={item}
                      className="flex gap-4 rounded-[1.5rem] border border-line bg-panel-alt px-5 py-4"
                    >
                      <span className="font-display text-lg font-bold text-ember">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-7 text-muted">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <article className="prose prose-slate prose-lg max-w-none rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8 dark:prose-invert">
              {report.html_content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: report.html_content }}
                />
              ) : (
                <>
                  <h2>Report summary</h2>
                  <p>
                    This report is currently available in the hub as a
                    structured summary with metadata, highlights, and key
                    figures. Full long-form body content has not yet been
                    published to this page.
                  </p>
                  <p>{report.description}</p>
                  {report.quote ? (
                    <blockquote>{report.quote}</blockquote>
                  ) : null}
                  <p>
                    For broader context on CoSET’s work, position papers, and
                    public-facing advocacy, continue to the main CoSET site.
                  </p>
                </>
              )}
            </article>

            {report.metrics.length > 0 ? (
              <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Selected figures
                </p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                  Key numbers from the report
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {report.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-[1.5rem] border border-line bg-panel-alt p-5"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                        {metric.label}
                      </p>
                      <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">
                        {metric.value}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {metric.note}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {relatedReports.length > 0 ? (
              <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                      Related reports
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                      Continue exploring CoSET research
                    </h2>
                  </div>
                  <Link
                    href="/reports"
                    className="text-sm font-semibold text-navy transition hover:text-ember"
                  >
                    View all reports
                  </Link>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {relatedReports.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/reports/${related.slug}`}
                      className="overflow-hidden rounded-[1.5rem] border border-line bg-panel-alt transition hover:-translate-y-1 hover:shadow-soft"
                    >
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={related.image}
                          alt={related.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                          {related.category[0] ?? "Report"}
                        </p>
                        <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.04em] text-navy">
                          {related.title}
                        </h3>
                        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted">
                          Open report
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </SectionReveal>

          <SectionReveal className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Report details
              </p>
              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-[1.25rem] border border-line bg-panel-alt px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Published
                  </p>
                  <p className="mt-2 font-semibold text-navy">
                    {report.publishedAt}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel-alt px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Author
                  </p>
                  <p className="mt-2 font-semibold text-navy">
                    {report.author}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-line bg-panel-alt px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Reading time
                  </p>
                  <p className="mt-2 font-semibold text-navy">
                    {report.readTime}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {report.category.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-navy"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {report.tags.length > 0 ? (
                <>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Tags
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-navy"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                More from CoSET
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <Link
                  href={cosetOrgLinks.positionPapers}
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  Position Papers
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href={cosetOrgLinks.mainSite}
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  CoSET Nigeria
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href={cosetOrgLinks.contact}
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  Contact CoSET
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </SectionReveal>
        </section>
      </main>
    </>
  );
}
