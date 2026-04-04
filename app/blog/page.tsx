import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionReveal } from "@/components/section-reveal";
import { SiteHeader } from "@/components/site-header";
import { getPublishedBlogPosts } from "@/lib/content";
import { cosetOrgLinks } from "@/lib/site-data";

export const revalidate = 300;

export default async function BlogPage() {
  const blogPosts = await getPublishedBlogPosts();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionReveal className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
            CoSET Updates
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-extrabold leading-tight tracking-[-0.05em] text-ink sm:text-6xl">
            Updates, reflections, and policy notes from CoSET
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            Follow CoSET&apos;s latest commentary, campaign reflections, and
            climate justice updates connected to socio-ecological transformation
            in Nigeria.
          </p>
        </SectionReveal>

        <SectionReveal className="mb-10 rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                What you&apos;ll find here
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Policy responses",
                  "Field reflections",
                  "Campaign updates",
                  "Editorial notes",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-navy"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Link
              href={cosetOrgLinks.positionPapers}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy transition hover:border-navy"
            >
              View position papers
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionReveal>

        <div className="space-y-6">
          {blogPosts.length > 0 ? (
            blogPosts.map((post, index) => (
              <SectionReveal
                key={`${post.slug}-${index}`}
                delay={index * 0.05}
                className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8"
              >
                <article>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="rounded-full bg-mist px-3 py-1 font-semibold text-navy">
                      {post.category}
                    </span>
                    <span>{post.publishedAt}</span>
                    <span>By {post.author}</span>
                  </div>
                  <h2 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.04em] text-navy sm:text-4xl">
                    {post.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
                    {post.excerpt}
                  </p>
                </article>
              </SectionReveal>
            ))
          ) : (
            <SectionReveal className="rounded-[2rem] border border-line bg-panel p-8 text-center shadow-soft">
              <p className="font-display text-2xl font-bold text-navy">
                No updates published yet
              </p>
              <p className="mt-3 text-sm leading-7 text-muted">
                New editorial notes, campaign updates, and policy reflections
                will appear here as they are published.
              </p>
            </SectionReveal>
          )}
        </div>

        <SectionReveal className="mt-12 rounded-[2rem] border border-line bg-panel p-6 shadow-soft sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
            Looking for the wider CoSET context?
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">
            Visit the main CoSET site for campaigns, advocacy, and
            organizational updates
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
            The intelligence hub focuses on research and editorial content. For
            broader public-facing work, continue to CoSET&apos;s main website.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={cosetOrgLinks.mainSite}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal"
            >
              Visit CoSET Nigeria
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href={cosetOrgLinks.about}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 font-semibold text-navy transition hover:border-navy"
            >
              About CoSET
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </SectionReveal>
      </main>
    </>
  );
}
