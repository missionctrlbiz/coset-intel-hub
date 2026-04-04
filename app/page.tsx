import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Download, Eye, Sparkles } from 'lucide-react';

import { SectionReveal } from '@/components/section-reveal';
import { SiteHeader } from '@/components/site-header';
import { blogPosts, cosetOrgLinks, reports } from '@/lib/site-data';

const featured = reports.slice(0, 2);
const latest = reports;

export default function HomePage() {
    return (
        <>
            <SiteHeader />
            <main>
                <section className="relative overflow-hidden bg-hero-radial">
                    <div className="absolute inset-0 bg-grid-fade bg-grid opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-br from-ink/80 via-ink/70 to-teal/30 dark:from-black/20 dark:via-ink/65 dark:to-teal/20" />
                    <div className="absolute inset-0">
                        <Image src="/coset-eye-banner.jpg" alt="CoSET banner" fill priority className="object-cover opacity-[0.24] mix-blend-screen dark:opacity-[0.22]" />
                    </div>
                    <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-28">
                        <SectionReveal className="max-w-3xl">
                            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-ember">CoSET Intelligence Hub</p>
                            <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                                Uwem Nnyin: empowering transformation through intelligence.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                                Explore premium research, policy briefs, and insight reports on socio-ecological change in Nigeria. Built for researchers,
                                policy makers, and institutional partners who need clarity, not noise.
                            </p>
                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Link href="/reports" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-semibold text-navy shadow-editorial transition hover:bg-sky-100">
                                    Explore Reports
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href="/admin/upload" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-4 font-semibold text-white shadow-soft backdrop-blur transition hover:bg-white/15">
                                    Start Upload Workflow
                                </Link>
                            </div>
                            <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Editorial Signal</p>
                                    <p className="mt-3 text-sm leading-7 text-white/72">Decision-grade reporting for climate justice, governance, and socio-ecological transformation in Nigeria.</p>
                                </div>
                                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Built For</p>
                                    <p className="mt-3 text-sm leading-7 text-white/72">Researchers, advocates, policy institutions, and funders working on equitable transition pathways.</p>
                                </div>
                            </div>
                        </SectionReveal>

                        <SectionReveal delay={0.12} className="self-end">
                            <div className="rounded-[2.25rem] border border-white/10 bg-black/20 p-5 shadow-editorial backdrop-blur-xl">
                                <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6">
                                    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Intelligence Snapshot</p>
                                            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-white">Operational signal at a glance</h2>
                                        </div>
                                        <div className="rounded-full border border-white/10 bg-white/10 p-3 text-white/75">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                                        {[
                                            ['Reports Published', '1,248', '+12% YoY'],
                                            ['Active Contributors', '45k+', 'Global expert network'],
                                            ['Communities Reached', '182', 'Across priority zones'],
                                        ].map(([label, value, note], index) => (
                                            <div key={label} className={`rounded-[1.6rem] border p-5 shadow-soft ${index === 1 ? 'border-white/20 bg-white text-navy' : 'border-white/10 bg-white/8 text-white backdrop-blur'}`}>
                                                <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${index === 1 ? 'text-muted' : 'text-white/55'}`}>{label}</p>
                                                <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em]">{value}</p>
                                                <p className={`mt-3 text-sm ${index === 1 ? 'text-muted' : 'text-white/70'}`}>{note}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/10 bg-gradient-to-r from-white/10 to-white/5 p-5 md:grid-cols-[1fr_auto] md:items-center">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Weekly Briefing</p>
                                            <p className="mt-2 text-sm leading-7 text-white/75">Monitor emerging climate, governance, and community transition signals from a single editorial command center.</p>
                                        </div>
                                        <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                                            Open editorial desk
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </SectionReveal>
                    </div>
                </section>

                <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
                    <SectionReveal className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:sticky lg:top-28 lg:h-fit dark:bg-panel/92">
                        <p className="font-display text-2xl font-bold text-navy">Filter Intelligence</p>
                        <p className="mt-1 text-sm text-muted">Refine the hub by topic, region, and report type.</p>
                        <div className="mt-8 space-y-6">
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">Categories</p>
                                <div className="space-y-3 text-sm text-muted">
                                    <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="accent-ember" /> Environment</label>
                                    <label className="flex items-center gap-3"><input type="checkbox" className="accent-ember" /> Social Justice</label>
                                    <label className="flex items-center gap-3"><input type="checkbox" className="accent-ember" /> Policy Reform</label>
                                </div>
                            </div>
                            <div>
                                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted">Keywords</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Biodiversity', 'Climate', 'Transition', 'Governance'].map((item) => (
                                        <span key={item} className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-navy">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full rounded-xl bg-navy px-4 py-3 font-semibold text-white transition hover:bg-teal">Apply Filters</button>
                        </div>
                    </SectionReveal>

                    <div className="space-y-16">
                        <SectionReveal>
                            <div className="mb-8 flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Featured Intelligence</p>
                                    <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Critical insights with institutional depth</h2>
                                </div>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-2">
                                {featured.map((report, index) => (
                                    <Link
                                        key={report.slug}
                                        href={`/reports/${report.slug}`}
                                        className="group relative overflow-hidden rounded-[2rem] border border-line bg-panel shadow-editorial"
                                    >
                                        <div className="relative h-[420px]">
                                            <Image src={index === 0 ? '/coset-eye-banner.jpg' : '/community-engagement.jpg'} alt={report.title} fill className="object-cover transition duration-700 group-hover:scale-105" />
                                            <div className={`absolute inset-0 ${index === 0 ? 'bg-gradient-to-t from-ink via-ink/40 to-transparent' : 'bg-gradient-to-t from-ember/90 via-ember/30 to-transparent'}`} />
                                            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">{report.category[0]}</span>
                                                <h3 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em]">{report.title}</h3>
                                                <p className="mt-3 max-w-md text-sm text-white/80">{report.description}</p>
                                                <div className="mt-6 flex items-center gap-2 text-sm font-semibold">
                                                    Read analysis <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </SectionReveal>

                        <SectionReveal>
                            <div className="mb-8 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Latest Intelligence</p>
                                    <h2 className="mt-2 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Fresh analysis across ecological and policy domains</h2>
                                </div>
                                <Link href="/reports" className="hidden rounded-full border border-line bg-panel px-5 py-3 text-sm font-semibold text-navy shadow-soft transition hover:border-navy md:inline-flex">
                                    View all reports
                                </Link>
                            </div>
                            <div className="grid gap-6 xl:grid-cols-3">
                                {latest.map((report) => (
                                    <article key={report.slug} className="flex flex-col rounded-[2rem] border border-line bg-panel p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-editorial dark:bg-gradient-to-b dark:from-panel dark:to-panel-alt/90">
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div className="rounded-2xl bg-mist p-3">
                                                <Sparkles className="h-5 w-5 text-navy" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{report.publishedAt}</span>
                                        </div>
                                        <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-navy">{report.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted">{report.description}</p>
                                        <div className="mt-8 flex items-center justify-between border-t border-line pt-5 text-sm">
                                            <span className="font-semibold text-ember">{report.category[0]}</span>
                                            <div className="flex items-center gap-3 text-muted">
                                                <Download className="h-4 w-4" />
                                                <Eye className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </SectionReveal>

                        <SectionReveal>
                            <div className="grid gap-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-ink via-[#122742] to-[#1e2a3d] px-6 py-8 text-white shadow-editorial lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Planet Pulse</p>
                                    <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em]">Curated global updates from the editorial desk</h2>
                                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                                        {blogPosts.map((post) => (
                                            <article key={post.title} className="rounded-[1.5rem] border border-white/8 bg-white/8 p-4 backdrop-blur-sm">
                                                <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[1.25rem]">
                                                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">{post.category}</p>
                                                <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.04em]">{post.title}</h3>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-[1.75rem] border border-white/8 bg-white/10 p-6 backdrop-blur-sm">
                                    <p className="font-display text-4xl font-extrabold tracking-[-0.04em]">Stay curated.</p>
                                    <p className="mt-3 text-sm leading-7 text-white/72">Receive a weekly briefing on the most critical socio-ecological intelligence directly in your inbox.</p>
                                    <div className="mt-6 space-y-3">
                                        <input className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40" placeholder="email@organization.org" />
                                        <button className="w-full rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">Subscribe to Hub Briefs</button>
                                    </div>
                                </div>
                            </div>
                        </SectionReveal>

                        <SectionReveal>
                            <div className="grid gap-6 rounded-[2rem] border border-line bg-panel p-6 shadow-soft lg:grid-cols-[1.15fr_0.85fr] lg:p-8 dark:bg-gradient-to-br dark:from-panel dark:to-panel-alt/80">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">CoSET Main Site</p>
                                    <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] text-ink">Explore CoSET beyond the hub</h2>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                                        The intelligence hub is the editorial surface. For the organization itself, its campaigns, events, donations, and public-facing updates, continue to the main CoSET website.
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Link href={cosetOrgLinks.mainSite} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 font-semibold text-white transition hover:bg-teal">
                                            Visit CoSET Nigeria
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                        <Link href={cosetOrgLinks.positionPapers} className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-panel-alt px-5 py-3 font-semibold text-navy transition hover:border-navy">
                                            View Position Papers
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                    <Link href={cosetOrgLinks.about} className="rounded-[1.5rem] border border-line bg-panel-alt p-5 transition hover:-translate-y-1 hover:shadow-soft dark:bg-panel/80">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">About CoSET</p>
                                        <p className="mt-3 text-lg font-semibold text-navy">Mission, values, and socioecological transformation agenda.</p>
                                    </Link>
                                    <Link href={cosetOrgLinks.contact} className="rounded-[1.5rem] border border-line bg-panel-alt p-5 transition hover:-translate-y-1 hover:shadow-soft dark:bg-panel/80">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Contact</p>
                                        <p className="mt-3 text-lg font-semibold text-navy">Collaborate, donate, or reach the CoSET team in Abuja.</p>
                                    </Link>
                                </div>
                            </div>
                        </SectionReveal>
                    </div>
                </section>
            </main>
        </>
    );
}