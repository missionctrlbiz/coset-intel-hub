import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FadeIn, SectionReveal } from '@/components/section-reveal';
import { getPublishedBlogPosts, type BlogCard } from '@/lib/content';

export const revalidate = 300;

export const metadata: Metadata = {
    title: 'Blog — CoSET Intelligence Hub',
    description:
        'Commentary, perspectives, and short-form intelligence from the CoSET network on climate justice, socio-ecological transformation, and policy in Nigeria.',
};

function formatPublishedDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function BlogCardItem({ post }: { post: BlogCard }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-soft transition hover:-translate-y-1 hover:border-ember/40 hover:shadow-editorial"
        >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-mist">
                <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
                {post.category ? (
                    <span className="w-fit rounded-full bg-ember/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ember">
                        {post.category}
                    </span>
                ) : null}
                <h3 className="font-display text-xl font-extrabold leading-tight tracking-[-0.03em] text-ink transition group-hover:text-ember">
                    {post.title}
                </h3>
                <p className="line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                    <span className="font-semibold text-ink">{post.author || 'CoSET Editorial'}</span>
                    <span>{formatPublishedDate(post.publishedAt)}</span>
                </div>
            </div>
        </Link>
    );
}

export default async function BlogIndexPage() {
    const posts = await getPublishedBlogPosts();
    const featured = posts.find((p) => p.category) ?? posts[0];
    const rest = posts.filter((p) => p.slug !== featured?.slug);

    return (
        <>
            <SiteHeader />
            <main className="site-shell py-12 sm:py-16 lg:py-20">
                <SectionReveal>
                    <header className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                            Blog
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
                            Perspectives from the CoSET Network
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                            Short-form commentary, network dispatches, and editorial framing on
                            the socio-ecological questions shaping Nigeria and the region.
                        </p>
                    </header>
                </SectionReveal>

                {posts.length === 0 ? (
                    <div className="mt-12 rounded-3xl border border-line bg-panel p-10 text-center shadow-soft">
                        <p className="text-lg font-semibold text-ink">No posts yet</p>
                        <p className="mt-2 text-sm text-muted">
                            Check back soon — the editorial team is preparing the first
                            dispatches.
                        </p>
                    </div>
                ) : (
                    <>
                        {featured ? (
                            <FadeIn className="mt-10">
                                <Link
                                    href={`/blog/${featured.slug}`}
                                    className="group grid gap-8 overflow-hidden rounded-3xl border border-line bg-panel shadow-soft transition hover:border-ember/40 hover:shadow-editorial lg:grid-cols-2"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto">
                                        <Image
                                            src={featured.image}
                                            alt=""
                                            fill
                                            priority
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center gap-4 p-6 lg:p-10">
                                        {featured.category ? (
                                            <span className="w-fit rounded-full bg-ember/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-ember">
                                                {featured.category}
                                            </span>
                                        ) : null}
                                        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-[-0.04em] text-ink transition group-hover:text-ember sm:text-3xl">
                                            {featured.title}
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted">
                                            {featured.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-muted">
                                            <span className="font-semibold text-ink">
                                                {featured.author || 'CoSET Editorial'}
                                            </span>
                                            <span>{formatPublishedDate(featured.publishedAt)}</span>
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>
                        ) : null}

                        {rest.length > 0 ? (
                            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {rest.map((post) => (
                                    <BlogCardItem key={post.slug} post={post} />
                                ))}
                            </div>
                        ) : null}
                    </>
                )}
            </main>
            <SiteFooter />
        </>
    );
}
