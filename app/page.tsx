import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SectionReveal } from "@/components/section-reveal";
import { SiteHeader } from "@/components/site-header";
import { getPublishedBlogPosts, getPublishedReports } from "@/lib/content";
import { cosetOrgLinks, filterGroups } from "@/lib/site-data";

export const revalidate = 300;

export default async function HomePage() {
  const reports = await getPublishedReports();
  const updates = await getPublishedBlogPosts();

  const featuredReports = reports.slice(0, 2);
  const latestUpdates = updates.slice(0, 3);
  const themes = filterGroups.categories.slice(0, 4);
  const regions = filterGroups.regions;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-hero-radial">
          <div className="absolute inset-0 bg-grid-fade bg-grid opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/70 to-teal/25" />
          <div className="absolute inset-0">
            <Image
              src="/coset-eye-banner.jpg"
              alt="CoSET banner"
              fill
              priority
              className="object-cover opacity-[0.22] mix-blend-screen"
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-24 lg:pt-24">
            <SectionReveal className="max-w-3xl">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-ember">
                CoSET Intelligence Hub
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Research and policy intelligence for socio-ecological
                transformation in Nigeria.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                Access CoSET reports, policy briefs, and editorial updates
                focused on climate justice, environmental governance, and
                equitable transition pathways.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-semibold text-navy shadow-editorial transition hover:bg-sky-100"
                >
                  Browse reports
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={cosetOrgLinks.positionPapers}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-4 font-semibold text-white shadow-soft backdrop-blur transition hover:bg-white/15"
                >
                  View position papers
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.12}>
              <div className="rounded-[2rem] border border-white/10 bg-black/20 p-6 shadow-editorial backdrop-blur-xl">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                    What you can find here
                  </p>

                  <div className="mt-6 space-y-5">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                        Reports
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/78">
                        Long-form research and evidence-based analysis on
                        climate justice and socio-ecological change.
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                        Policy briefs
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/78">
                        Concise material for advocates, institutions, and
                        decision-makers working on governance and transition
                        pathways.
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                        CoSET updates
                      </p>
                      <p className="mt-2 text-sm leading-7 text-white/78">
                        Editorial notes, reflections, and organizational context
                        connected to CoSET’s wider public work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="grid gap-8 rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:grid-cols-[1fr_auto] lg:items-start lg:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Browse by focus
                </p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">
                  CoSET content organized around real themes and regions
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
                  Use the hub to quickly move through CoSET’s research areas and
                  regional focus. For deeper campaign, organizational, and
                  advocacy information, continue to the main CoSET website.
                </p>
              </div>

              <Link
                href={cosetOrgLinks.mainSite}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-alt px-5 py-3 text-sm font-semibold text-navy transition hover:border-navy"
              >
                Visit CoSET Nigeria
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Themes
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-navy"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Regions
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {regions.map((region) => (
                    <span
                      key={region}
                      className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-navy"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Featured reports
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">
                  Recent research and policy analysis from the hub
                </h2>
              </div>
              <Link
                href="/reports"
                className="hidden rounded-full border border-line bg-panel px-5 py-3 text-sm font-semibold text-navy shadow-soft transition hover:border-navy md:inline-flex"
              >
                View all reports
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {featuredReports.map((report) => (
                <article
                  key={report.slug}
                  className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft transition hover:shadow-editorial"
                >
                  <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                    <div className="relative min-h-[260px] bg-mist">
                      <Image
                        src={report.image}
                        alt={report.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                        {report.category[0]}
                      </p>
                      <h3 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-navy">
                        {report.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-muted">
                        {report.description}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted">
                        <span className="font-semibold text-navy">
                          {report.author}
                        </span>
                        <span>{report.publishedAt}</span>
                        <span>{report.readTime}</span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {report.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-6">
                        <Link
                          href={`/reports/${report.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition hover:text-ember"
                        >
                          Open report
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </SectionReveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Latest updates
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">
                  CoSET editorial notes and organizational context
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden rounded-full border border-line bg-panel px-5 py-3 text-sm font-semibold text-navy shadow-soft transition hover:border-navy md:inline-flex"
              >
                View all updates
              </Link>
            </div>

            <div className="rounded-[2rem] border border-line bg-panel shadow-soft">
              <div className="divide-y divide-line">
                {latestUpdates.map((post) => (
                  <article
                    key={post.slug}
                    className="grid gap-5 px-6 py-6 md:grid-cols-[1fr_auto] md:items-start"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                        {post.category}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-navy">
                        {post.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="text-sm text-muted md:text-right">
                      <p className="font-semibold text-navy">{post.author}</p>
                      <p className="mt-1">{post.publishedAt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </SectionReveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="grid gap-6 rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                  Beyond the hub
                </p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">
                  Explore CoSET’s wider organizational work
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                  The intelligence hub is focused on research and publication
                  discovery. For CoSET’s campaigns, public statements, events,
                  and broader organizational information, continue to the main
                  website.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href={cosetOrgLinks.about}
                  className="rounded-[1.5rem] border border-line bg-panel-alt p-5 transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    About CoSET
                  </p>
                  <p className="mt-3 text-lg font-semibold text-navy">
                    Mission, values, and socio-ecological transformation agenda.
                  </p>
                </Link>

                <Link
                  href={cosetOrgLinks.positionPapers}
                  className="rounded-[1.5rem] border border-line bg-panel-alt p-5 transition hover:-translate-y-1 hover:shadow-soft"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                    Position papers
                  </p>
                  <p className="mt-3 text-lg font-semibold text-navy">
                    Explore CoSET’s published positions and public-facing
                    advocacy material.
                  </p>
                </Link>
              </div>
            </div>
          </SectionReveal>
        </section>
      </main>
    </>
  );
}
