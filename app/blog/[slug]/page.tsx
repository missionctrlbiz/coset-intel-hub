import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, SectionReveal } from '@/components/section-reveal';
import { SubscribeForm } from '@/components/subscribe-form';
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from '@/lib/content';

type PageProps = {
    params: { slug: string };
};

export const revalidate = 300;

function formatPublishedDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPublishedBlogPostBySlug(params.slug);
    if (!post) {
        return { title: 'Post not found — CoSET Intelligence Hub' };
    }
    return {
        title: `${post.title} — CoSET Intelligence Hub`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.image ? [post.image] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const post = await getPublishedBlogPostBySlug(params.slug);
    if (!post) {
        notFound();
    }

    const related = (await getPublishedBlogPosts())
        .filter((p) => p.slug !== post.slug)
        .slice(0, 3);

    return (
        <>
            <SiteHeader />
            <main className="bg-panel">
                <article>
                    <header className="site-shell pt-10 sm:pt-14">
                        <SectionReveal>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-ember"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to all posts
                            </Link>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                {post.category ? (
                                    <span className="rounded-full bg-ember/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ember">
                                        {post.category}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="mt-4 max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                                {post.author ? (
                                    <span className="inline-flex items-center gap-2 font-semibold text-ink">
                                        <User className="h-4 w-4" />
                                        {post.author}
                                    </span>
                                ) : null}
                                {post.publishedAt ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatPublishedDate(post.publishedAt)}
                                    </span>
                                ) : null}
                            </div>
                        </SectionReveal>
                    </header>

                    {post.image ? (
                        <FadeIn className="mt-10">
                            <div className="site-shell">
                                <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-line bg-mist shadow-editorial">
                                    <Image
                                        src={post.image}
                                        alt=""
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 960px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </FadeIn>
                    ) : null}

                    <FadeIn className="site-shell">
                        <div
                            className="prose prose-slate prose-lg mx-auto mt-12 max-w-3xl dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                        />
                    </FadeIn>

                    {related.length > 0 ? (
                        <SectionReveal className="site-shell mt-16">
                            <div className="border-t border-line pt-12">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                                    Keep reading
                                </p>
                                <h2 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink">
                                    More from the blog
                                </h2>
                                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {related.map((p) => (
                                        <Link
                                            key={p.slug}
                                            href={`/blog/${p.slug}`}
                                            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-soft transition hover:-translate-y-1 hover:border-ember/40 hover:shadow-editorial"
                                        >
                                            <div className="relative aspect-[16/9] overflow-hidden bg-mist">
                                                <Image
                                                    src={p.image}
                                                    alt=""
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2 p-5">
                                                {p.category ? (
                                                    <span className="w-fit rounded-full bg-ember/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ember">
                                                        {p.category}
                                                    </span>
                                                ) : null}
                                                <h3 className="font-display text-lg font-extrabold leading-tight tracking-[-0.03em] text-ink transition group-hover:text-ember">
                                                    {p.title}
                                                </h3>
                                                <p className="line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </SectionReveal>
                    ) : null}

                    <SectionReveal className="site-shell mt-16">
                        <div className="rounded-3xl border border-line bg-mist p-8 shadow-soft dark:bg-panel-alt/60 sm:p-10">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                                Subscribe to Hub Briefs
                            </p>
                            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-[-0.04em] text-ink sm:text-3xl">
                                Get the next post in your inbox
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                                We publish new intelligence and commentary every week. Subscribe
                                and we'll send it straight to you.
                            </p>
                            <div className="mt-6 max-w-md">
                                <SubscribeForm tone="auto" submitLabel="Subscribe me" />
                            </div>
                        </div>
                    </SectionReveal>
                </article>
            </main>
            <SiteFooter />
        </>
    );
}
