import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SectionReveal } from "@/components/section-reveal";
import { SiteHeader } from "@/components/site-header";
import { getPublishedReports } from "@/lib/content";
import { cosetOrgLinks, filterGroups } from "@/lib/site-data";

export const revalidate = 300;

export default async function ReportsPage() {
  const reports = await getPublishedReports();

  const categoryFilters = Array.from(
    new Set(reports.flatMap((report) => report.category)),
  );
  const tagFilters = Array.from(
    new Set(reports.flatMap((report) => report.tags)),
  );

  const topics =
    categoryFilters.length > 0 ? categoryFilters : filterGroups.categories;
  const regions = filterGroups.regions;
  const tags = tagFilters.length > 0 ? tagFilters : filterGroups.tags;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionReveal className="rounded-[2rem] border border-line bg-panel px-6 py-8 shadow-soft sm:px-8 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
            Reports Directory
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-extrabold tracking-[-0.05em] text-ink sm:text-6xl">
            CoSET research, policy briefs, and socio-ecological intelligence
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            Browse reports focused on climate justice, environmental governance,
            energy transition, and socio-ecological transformation in Nigeria.
            This directory is designed to help researchers, policy makers, and
            advocates quickly locate relevant CoSET publications.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={cosetOrgLinks.positionPapers}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-white transition hover:brightness-110"
            >
              View position papers
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={cosetOrgLinks.mainSite}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-panel-alt px-5 py-3 font-semibold text-navy transition hover:border-navy"
            >
              Visit CoSET main site
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
          <SectionReveal className="h-fit rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:sticky lg:top-28">
            <p className="font-display text-2xl font-bold text-navy">
              Browse reports
            </p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Use these report themes and coverage areas as a guide to the
              content currently available in the hub.
            </p>

            <BrowseGroup title="Themes" items={topics} />
            <BrowseGroup title="Regions" items={regions} />
            <BrowseGroup title="Tags" items={tags} />
          </SectionReveal>

          <div className="space-y-6">
            <SectionReveal className="flex flex-col gap-4 rounded-[2rem] border border-line bg-panel p-6 shadow-soft md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Available publications
                </p>
                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                  {reports.length} report{reports.length === 1 ? "" : "s"} in
                  the directory
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                  Each entry includes the report summary, theme, author,
                  publication date, and related tags so you can identify the
                  most useful document quickly.
                </p>
              </div>
              <Link
                href={cosetOrgLinks.about}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-ember"
              >
                Learn more about CoSET
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </SectionReveal>

            <div className="space-y-6">
              {reports.map((report, index) => (
                <SectionReveal key={report.slug} delay={index * 0.05}>
                  <article className="grid gap-6 rounded-[2rem] border border-line bg-panel p-5 shadow-soft md:grid-cols-[220px_1fr] md:p-6">
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-mist">
                      <div className="relative aspect-[4/5]">
                        <Image
                          src={report.image}
                          alt={report.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        {report.category.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-navy"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/reports/${report.slug}`}
                        className="mt-4 block font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-navy transition hover:text-ember"
                      >
                        {report.title}
                      </Link>

                      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                        {report.description}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                        <span className="font-semibold text-navy">
                          {report.author}
                        </span>
                        <span>{report.publishedAt}</span>
                        <span>{report.readTime}</span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {report.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 pt-2">
                        <Link
                          href={`/reports/${report.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-ember transition hover:text-navy"
                        >
                          Open report
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>

            <SectionReveal
              delay={0.12}
              className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                Need broader organizational context?
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
                Continue to CoSET’s main website for campaigns, events, and
                public-facing updates
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                The intelligence hub is focused on research and report
                discovery. For CoSET’s wider organizational work, public
                statements, and advocacy activity, continue to the main site.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={cosetOrgLinks.mainSite}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal"
                >
                  Visit main site
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href={cosetOrgLinks.contact}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-navy transition hover:border-navy"
                >
                  Contact CoSET
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </main>
    </>
  );
}

function BrowseGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-mist px-3 py-2 text-sm font-medium text-navy"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
