import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SectionReveal } from '@/components/section-reveal';
import { Map, MapPin, HelpCircle, MessageSquare, ChevronDown } from 'lucide-react';
import React from 'react';

export const metadata = {
    title: 'Contact Us | CoSET Intelligence Hub',
    description: 'Get in touch, submit feedback, or ask questions regarding the CoSET Intelligence Hub.',
};

export default function ContactPage() {
    const faqs = [
        { q: "How can I submit intelligence reports?", a: "Registered partners can use the Admin Suite. General public can submit tips via the contact form on our main organizational hub." },
        { q: "Who has access to the full database?", a: "While many policy briefs are public, raw data and comprehensive mapping are restricted to registered coalition members and vetted researchers." },
        { q: "How is the data validated?", a: "All intelligence passes through our editorial desk and is cross-referenced with on-the-ground community reports before publication." }
    ];

    return (
        <>
            <SiteHeader />
            <main className="min-h-screen py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <span className="inline-block rounded-full bg-ember/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ember">Get in touch</span>
                        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink sm:text-5xl">Contact the Coalition</h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
                            Reach out to submit intelligence, request dataset access, or partner with Uwem Nnyin on our socio-ecological projects.
                        </p>
                    </div>

                    <SectionReveal>
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Left Column: Map & FAQ */}
                            <div className="space-y-8">
                                {/* Map Card */}
                                <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-teal/10 p-3 text-teal"><MapPin className="h-6 w-6" /></div>
                                        <h3 className="font-display text-2xl font-bold text-ink">Headquarters</h3>
                                    </div>
                                    <div className="relative h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-mist flex dark:bg-panel">
                                        <Map className="mb-3 h-12 w-12 text-muted opacity-40" />
                                        <p className="text-center text-sm font-semibold text-navy">
                                            Marrakesh Street, Wuse 2<br />Abuja, Nigeria
                                        </p>
                                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-ember px-4 py-2 text-xs font-bold text-ember transition hover:bg-ember hover:text-white">
                                            Get Directions
                                        </a>
                                    </div>
                                </div>

                                {/* Static FAQ Instead of Accordion for simplicity in SSR, or keep simple design */}
                                <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-xl bg-navy/10 p-3 text-navy"><HelpCircle className="h-6 w-6" /></div>
                                        <h3 className="font-display text-2xl font-bold text-ink">Frequently Asked Questions</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {faqs.map((faq, i) => (
                                            <div key={i} className="border-b border-line pb-4 last:border-0 last:pb-0">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
                                                    <ChevronDown className="h-4 w-4 text-emerald-500" />
                                                    {faq.q}
                                                </h4>
                                                <p className="ml-6 mt-2 text-sm text-muted">{faq.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Feedback Form */}
                            <div className="space-y-8">
                                <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-xl bg-ember/10 p-3 text-ember"><MessageSquare className="h-6 w-6" /></div>
                                        <h3 className="font-display text-2xl font-bold text-ink">Submit Hub Feedback</h3>
                                    </div>
                                    <form className="space-y-5">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted ml-2">Name</label>
                                                <input type="text" placeholder="Your Name" className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember dark:bg-panel" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted ml-2">Email</label>
                                                <input type="email" placeholder="Email Address" className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember dark:bg-panel" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted ml-2">Topic</label>
                                            <select className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember dark:bg-panel appearance-none">
                                                <option>General Inquiry</option>
                                                <option>Submit Intelligence / Tip</option>
                                                <option>Data Access Request</option>
                                                <option>Hub Features / Bug</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted ml-2">Message</label>
                                            <textarea 
                                                placeholder="How can we help?" 
                                                rows={5}
                                                className="w-full rounded-xl border border-line bg-mist px-4 py-3 text-sm outline-none transition focus:border-ember dark:bg-panel resize-none"
                                            ></textarea>
                                        </div>
                                        <button type="button" className="w-full rounded-xl bg-ember px-4 py-4 font-bold text-white shadow-soft transition hover:brightness-110">
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </SectionReveal>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
