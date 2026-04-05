import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getPublishedBlogPostBySlug } from '@/lib/content';

export const revalidate = 300;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getPublishedBlogPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const cleanHtml = DOMPurify.sanitize(post.htmlContent);

    return (
        <>
            <SiteHeader />
            <main className="bg-panel pb-24 pt-12 text-ink">
                <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/blog"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-navy"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Editorial Desk
                    </Link>

                    <header className="mb-10 text-center">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ember">{post.category}</p>
                        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-[-0.04em] text-navy md:text-5xl lg:text-6xl">
                            {post.title}
                        </h1>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {post.publishedAt}
                            </div>
                        </div>
                    </header>
                </article>

                <div className="mx-auto mb-16 max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="relative aspect-[21/9] overflow-hidden rounded-[2rem] bg-mist shadow-editorial">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div 
                        className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:tracking-[-0.03em] prose-h2:text-navy prose-a:text-ember hover:prose-a:text-navy"
                        dangerouslySetInnerHTML={{ __html: cleanHtml }}
                    />
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
