import Image from 'next/image';
import { Mail } from 'lucide-react';

import { SectionReveal } from '@/components/section-reveal';
import { SiteHeader } from '@/components/site-header';
import { getPublishedBlogPosts } from '@/lib/content';

export const revalidate = 300;

export default async function BlogPage() {
    const blogPosts = await getPublishedBlogPosts();
    const [featured, ...rest] = blogPosts;

    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <SectionReveal className="mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">The Editorial Desk</p>
                    <h1 className="mt-3 max-w-4xl font-display text-6xl font-extrabold leading-[0.96] tracking-[-0.05em] text-ink">Planet Pulse: latest updates and reflections</h1>
                    <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">Navigating the intersection of climate intelligence, social equity, and institutional responsibility through curated narrative.</p>
                </SectionReveal>

                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1fr_300px]">
                    <div className="space-y-8 xl:col-span-1">
                        <SectionReveal className="grid overflow-hidden rounded-[2rem] border border-line bg-panel shadow-editorial md:grid-cols-[1.1fr_1fr]">
                            <div className="relative min-h-[360px]">
                                <Image src={featured.image} alt={featured.title} fill className="object-cover" />
                            </div>
                            <div className="p-8">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{featured.category}</p>
                                <p className="mt-3 text-sm text-muted">{featured.publishedAt} • {featured.author}</p>
                                <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-[-0.05em] text-navy">{featured.title}</h2>
                                <p className="mt-5 text-sm leading-7 text-muted">{featured.excerpt}</p>
                            </div>
                        </SectionReveal>

                        <div className="grid gap-8 md:grid-cols-2">
                            {rest.map((post, index) => (
                                <SectionReveal key={post.title} delay={index * 0.06} className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                                    <div className="relative aspect-[16/10]">
                                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                                    </div>
                                    <div className="p-6">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">{post.category}</p>
                                        <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.04em] text-navy">{post.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted">{post.excerpt}</p>
                                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">By {post.author}</p>
                                    </div>
                                </SectionReveal>
                            ))}
                        </div>
                    </div>

                    <SectionReveal className="space-y-6 xl:col-span-1">
                        <div className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
                            <Mail className="h-6 w-6 text-white/80" />
                            <h3 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.04em]">Stay informed</h3>
                            <p className="mt-3 text-sm leading-7 text-white/70">Weekly intelligence digests delivered directly to your inbox.</p>
                            <div className="mt-5 space-y-3">
                                <input className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40" placeholder="Email address" />
                                <button className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">Subscribe</button>
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                            <p className="font-display text-lg font-bold text-navy">Trending Topics</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Carbon Removal', 'ESG Reporting', 'Circular Design', 'Water Security', 'Scope 3 Emissions'].map((topic) => (
                                    <span key={topic} className="rounded-full bg-mist px-3 py-2 text-sm font-medium text-muted">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SectionReveal>
                </div>
            </main>
        </>
    );
}