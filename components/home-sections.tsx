'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, Flame, Users, Map, Download,
    Eye, Filter, SortDesc, ChevronRight, ChevronLeft, MapPin,
    MessageSquare, HelpCircle, Send, LayoutGrid, List, Mail
} from 'lucide-react';

import { EmptyBlogPosts, EmptyReports } from '@/components/loading-states';
import { SectionReveal, StaggerReveal, FadeIn } from '@/components/section-reveal';
import { type BlogCard } from '@/lib/content';
import { type Report, cosetOrgLinks } from '@/lib/site-data';

// ============================================================================
// Hero Carousel
// ============================================================================
export function HeroCarousel({ featured }: { featured: Report[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const featuredSlides = featured.slice(0, 5);

    useEffect(() => {
        if (featuredSlides.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [featuredSlides.length]);

    if (!featured || featured.length === 0) return null;

    const currentSlide = featuredSlides[currentIndex];

    return (
        <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-[#0A1421]">
            <div className="absolute inset-0">
                {featuredSlides.map((slide, index) => (
                    <motion.div
                        key={slide.slug}
                        initial={false}
                        animate={{
                            opacity: index === currentIndex ? 1 : 0,
                            scale: index === currentIndex ? 1 : 1.03,
                            pointerEvents: index === currentIndex ? 'auto' : 'none'
                        }}
                        transition={{ duration: 0.9, ease: 'easeInOut' }}
                        className="absolute inset-0"
                        aria-hidden={index !== currentIndex}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            priority={index === 0}
                            className="object-cover opacity-60 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    </motion.div>
                ))}
            </div>

            <div className="site-shell relative flex h-full flex-col justify-end pb-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`content-${currentIndex}`}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                            hidden: {},
                            exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                        }}
                        className="max-w-3xl"
                    >
                        <FadeIn>
                            <span className="mb-4 inline-block rounded-full bg-ember/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-ember border border-ember/30 backdrop-blur-md">
                                {currentSlide.category[0] || 'Featured Report'}
                            </span>
                        </FadeIn>
                        <FadeIn>
                            <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                {currentSlide.title}
                            </h1>
                        </FadeIn>
                        <FadeIn>
                            <p className="mb-8 max-w-2xl text-lg text-white/80 line-clamp-3">
                                {currentSlide.description}
                            </p>
                        </FadeIn>
                        <FadeIn>
                            <div className="flex flex-wrap items-center gap-4">
                                <Link
                                    href={`/reports/${currentSlide.slug}`}
                                    className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 font-bold text-white shadow-[0_0_20px_rgba(242,140,40,0.3)] transition hover:brightness-110"
                                >
                                    Read Post
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                {currentSlide.downloadHref ? (
                                    <Link
                                        href={currentSlide.downloadHref}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/50 backdrop-blur"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </button>
                                )}
                            </div>
                        </FadeIn>
                    </motion.div>
                </AnimatePresence>

                {/* Indicators */}
                <div className="absolute bottom-8 right-8 flex gap-2 sm:right-auto">
                    {featuredSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-ember' : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// Intel Snapshot
// ============================================================================
export function IntelSnapshot() {
    return (
        <section className="border-b border-line bg-panel shadow-sm">
            <div className="site-shell py-8">
                <div className="flex flex-wrap items-center justify-between gap-6 md:flex-nowrap">
                    <div className="w-full md:w-auto">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Intelligence Snapshot</p>
                        <h2 className="mt-1 font-display text-2xl font-bold text-ink">Operational signal at a glance</h2>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:w-auto md:flex-1 md:gap-8 lg:pl-12">
                        <div className="flex items-center gap-4 border-l-4 border-ember bg-mist p-4 rounded-r-xl">
                            <div className="rounded-full bg-ember/20 p-2 text-ember"><Flame className="h-5 w-5" /></div>
                            <div>
                                <p className="font-display text-2xl font-black text-ink">16,000+</p>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted">Gas Flaring Sites</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l-4 border-teal bg-mist p-4 rounded-r-xl">
                            <div className="rounded-full bg-teal/20 p-2 text-teal"><Users className="h-5 w-5" /></div>
                            <div>
                                <p className="font-display text-2xl font-black text-ink">45,000+</p>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted">Active Contributors</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 border-l-4 border-navy bg-mist p-4 rounded-r-xl">
                            <div className="rounded-full bg-navy/20 p-2 text-navy"><Map className="h-5 w-5" /></div>
                            <div>
                                <p className="font-display text-2xl font-black text-ink">182+</p>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted">Communities Reached</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================================================
// Report Card Image with error fallback
// ============================================================================
function ReportCardImage({ src, alt }: { src: string; alt: string }) {
    const [imgSrc, setImgSrc] = useState(src || '/community-engagement.jpg');
    return (
        <Image
            src={imgSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
            onError={() => setImgSrc('/community-engagement.jpg')}
        />
    );
}

// ============================================================================
// Reports Grid
// ============================================================================
export function ReportsGrid({ reports }: { reports: Report[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');
    const displayReports = reports.slice(0, 6);

    return (
        <StaggerReveal>
            <FadeIn>
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Intelligence Database</p>
                        <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Explore Strategic Reports</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-xl border border-line bg-panel p-1 shadow-soft">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg p-2 transition ${viewMode === 'grid' ? 'bg-mist text-ember' : 'text-muted hover:text-ink'}`}
                                aria-label="Grid view"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('row')}
                                className={`rounded-lg p-2 transition ${viewMode === 'row' ? 'bg-mist text-ember' : 'text-muted hover:text-ink'}`}
                                aria-label="List view"
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-sm font-semibold text-navy shadow-soft transition hover:border-navy">
                            <Filter className="h-4 w-4" /> Filter
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-sm font-semibold text-navy shadow-soft transition hover:border-navy">
                            <SortDesc className="h-4 w-4" /> Sort
                        </button>
                    </div>
                </div>
            </FadeIn>

            <FadeIn>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {displayReports.length === 0 ? (
                        <EmptyReports />
                    ) : displayReports.map((report) => (
                        <Link
                            key={report.slug}
                            href={`/reports/${report.slug}`}
                            className={`group flex overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft transition hover:-translate-y-1 hover:shadow-editorial dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/90 ${viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row'}`}
                        >
                            <div className={`relative overflow-hidden ${viewMode === 'row' ? 'w-full sm:w-1/3 min-h-[240px]' : 'h-56 w-full'}`}>
                                <ReportCardImage src={report.image || '/community-engagement.jpg'} alt={report.title} />
                            </div>
                            <div className="flex flex-1 flex-col p-6 sm:p-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="rounded-full bg-mist px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
                                        {report.category[0]}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted">{report.publishedAt}</span>
                                </div>
                                <h3 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink group-hover:text-ember dark:text-ember dark:group-hover:text-white transition-colors">{report.title}</h3>
                                <p className={`mt-4 flex-1 text-sm leading-relaxed text-muted ${viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-4'}`}>{report.description}</p>
                                <div className="mt-8 flex items-center justify-between border-t border-line pt-4 text-sm font-semibold text-ember">
                                    Read Report <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </FadeIn>

            <FadeIn>
                <div className="mt-12 flex justify-center">
                    <Link href="/reports" className="inline-flex items-center gap-2 rounded-full border-2 border-navy bg-transparent px-8 py-3 text-sm font-bold text-navy transition hover:bg-navy hover:text-white dark:hover:bg-navy">
                        Load More Intelligence
                    </Link>
                </div>
            </FadeIn>
        </StaggerReveal>
    );
}

// ============================================================================
// Mission & Philosophy
// ============================================================================
export function MissionAndPhilosophy() {
    return (
        <StaggerReveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-panel py-16 text-ink shadow-editorial dark:border-white/10 dark:bg-[#0A1421] dark:text-white">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-ember/10 blur-3xl pointer-events-none" />

                <div className="relative mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2 lg:px-12">
                    <div className="flex flex-col items-start space-y-6">
                        <FadeIn className="rounded-2xl bg-navy/5 p-4 backdrop-blur-md dark:bg-white/5">
                            <MapPin className="h-8 w-8 text-teal" />
                        </FadeIn>
                        <FadeIn>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">Our Mission</p>
                            <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-ink dark:text-white">Driving Socio-Ecological Transformation</h3>
                        </FadeIn>
                        <FadeIn>
                            <p className="leading-relaxed text-muted dark:text-white/70">
                                At CoSET, our mission is to drive socio-ecological transformation in Nigeria by advocating for sustainable practices, promoting social and environmental justice, and empowering communities to create a better future for all.
                            </p>
                        </FadeIn>
                    </div>

                    <div className="flex flex-col items-start space-y-6">
                        <FadeIn className="rounded-2xl bg-navy/5 p-4 backdrop-blur-md dark:bg-white/5">
                            <Users className="h-8 w-8 text-ember" />
                        </FadeIn>
                        <FadeIn>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember">Core Philosophy</p>
                            <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-ink dark:text-white">Challenging the Growth Model</h3>
                        </FadeIn>
                        <FadeIn>
                            <p className="leading-relaxed text-muted dark:text-white/70">
                                The coalition challenges the current &quot;growth-centered&quot; economic model in favor of one that prioritizes social well-being, environmental integrity, and sustainability. We argue that the total well-being of people, society, and the environment are inextricably linked.
                            </p>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </StaggerReveal>
    );
}

// ============================================================================
// Featured Perspectives
// ============================================================================
export function PlanetPulse({ blogPosts }: { blogPosts: BlogCard[] }) {
    const displayPosts = blogPosts.slice(0, 3);

    return (
        <StaggerReveal>
            <FadeIn className="flex flex-col items-center text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Featured Perspectives</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Selected Insights From Our Network</h2>
                <p className="mt-4 max-w-2xl text-muted">A rotating snapshot of recent ideas, commentary, and context shaping our research conversations.</p>
            </FadeIn>

            <FadeIn className="mt-12 grid gap-6 md:grid-cols-3">
                {displayPosts.length === 0 ? (
                    <EmptyBlogPosts />
                ) : displayPosts.map((post) => (
                    <div
                        key={post.title}
                        className="group flex flex-col rounded-[1.5rem] border border-line bg-panel p-4 shadow-soft transition hover:-translate-y-1 hover:shadow-editorial dark:bg-panel-alt/80"
                    >
                        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-[1rem]">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover transition duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-ink/10 opacity-0 transition group-hover:opacity-100" />
                        </div>
                        <div className="flex flex-1 flex-col px-2 pb-2">
                            <span className="w-fit rounded-full bg-mist px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
                                {post.category}
                            </span>
                            <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink group-hover:text-ember">{post.title}</h3>
                            <p className="mt-auto text-xs font-semibold text-muted">{post.publishedAt}</p>
                        </div>
                    </div>
                ))}
            </FadeIn>
        </StaggerReveal>
    );
}

// ============================================================================
// Learn More Carousel
// ============================================================================
export function LearnMoreCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const images = [
        '/coset-eye-banner.jpg',
        '/community-engagement.jpg',
        '/CoSET-5-600x540.png'
    ];

    const next = () => setCurrentIndex((p) => (p + 1) % images.length);
    const prev = () => setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));

    return (
        <StaggerReveal>
            <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft lg:p-12 dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <FadeIn>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Learn More</p>
                            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink lg:text-5xl">
                                Discover the Coalition
                            </h2>
                        </FadeIn>
                        <FadeIn>
                            <p className="mt-6 text-lg leading-relaxed text-muted">
                                CoSET is a network of citizens, NGOs, and journalists established in 2018 to reconnect nature and society through sustainable transformation. Explore our campaigns, position papers, and community initiatives.
                            </p>
                        </FadeIn>
                        <FadeIn className="mt-8">
                            <Link href={cosetOrgLinks.mainSite} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-8 py-4 font-bold text-white shadow-soft transition hover:brightness-110">
                                Visit Uwem Nnyin
                                <ArrowUpRight className="h-5 w-5" />
                            </Link>
                        </FadeIn>
                    </div>

                    <FadeIn className="relative">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-editorial bg-mist">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={images[currentIndex]}
                                        alt={`Slide ${currentIndex + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-panel p-2 shadow-soft dark:bg-panel-alt">
                            <button onClick={prev} aria-label="Previous slide" className="rounded-full p-2 text-ink hover:bg-mist hover:text-ember">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex gap-1 px-2">
                                {images.map((_, i) => (
                                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-navy' : 'w-1.5 bg-line'}`} />
                                ))}
                            </div>
                            <button onClick={next} aria-label="Next slide" className="rounded-full p-2 text-ink hover:bg-mist hover:text-ember">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </StaggerReveal>
    );
}

// ============================================================================
// Hub Services (Newsletter Only on Home)
// ============================================================================
export function HubServices() {
    return (
        <StaggerReveal>
            {/* Newsletter CTA Block */}
            <div className="relative w-full rounded-[2rem] border border-line bg-panel p-8 shadow-editorial dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80 overflow-hidden lg:p-12" id="subscribe">
                <div className="absolute -bottom-16 -right-16 p-6 opacity-[0.04] dark:opacity-[0.08] pointer-events-none">
                    <Mail className="h-80 w-80 text-navy dark:text-white" />
                </div>
                <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-teal/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-navy/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="flex-1 text-left">
                        <FadeIn>
                            <span className="inline-block rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy dark:bg-white/10 dark:text-white/80">Newsletter</span>
                            <h3 className="mt-4 font-display text-4xl font-extrabold text-ink lg:text-5xl">Subscribe to Hub Briefs</h3>
                        </FadeIn>
                        <FadeIn>
                            <p className="mt-4 max-w-lg text-lg text-muted">Receive weekly intelligence briefings on climate justice and transformative policies straight to your inbox.</p>
                        </FadeIn>
                    </div>

                    <FadeIn className="flex-1 w-full max-w-md lg:max-w-xl">
                        <form className="flex w-full flex-col gap-3 sm:flex-row">
                            <input
                                type="email"
                                placeholder="Enter your email address..."
                                required
                                className="w-full rounded-xl border border-line bg-mist px-4 py-4 text-sm text-ink outline-none transition focus:border-navy dark:bg-panel"
                            />
                            <button type="submit" className="shrink-0 rounded-xl bg-navy px-8 py-4 font-bold text-white transition hover:brightness-110">
                                Subscribe
                            </button>
                        </form>
                        <p className="mt-4 text-xs font-medium text-muted">We respect your privacy. Unsubscribe at any time.</p>
                    </FadeIn>
                </div>
            </div>
        </StaggerReveal>
    );
}
