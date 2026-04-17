import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { SectionReveal } from '@/components/section-reveal';
import { MapPin, HelpCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { CosetMap } from '@/components/coset-map';
import { FeedbackForm } from '@/components/feedback-form';
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
                            {/* Left Column: Map */}
                            <div className="space-y-8 flex flex-col h-full">
                                {/* Map Card */}
                                <div className="flex-1 flex flex-col rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="rounded-xl bg-teal/10 p-3 text-teal"><MapPin className="h-6 w-6" /></div>
                                        <h3 className="font-display text-2xl font-bold text-ink">Headquarters</h3>
                                    </div>
                                    <div className="relative h-[550px] w-full overflow-hidden rounded-2xl border border-line bg-mist dark:bg-panel">
                                        <CosetMap />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Feedback Form */}
                            <div className="space-y-8 flex flex-col h-full">
                                <div className="flex-1 rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="rounded-xl bg-ember/10 p-3 text-ember"><MessageSquare className="h-6 w-6" /></div>
                                        <h3 className="font-display text-2xl font-bold text-ink">Submit Hub Feedback</h3>
                                    </div>
                                    <FeedbackForm />
                                </div>
                            </div>

                            {/* FAQ Section Full Row */}
                            <div className="lg:col-span-2 rounded-[2rem] border border-line bg-panel p-8 shadow-soft dark:bg-panel-alt/80">
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="rounded-xl bg-navy/10 p-3 text-navy"><HelpCircle className="h-6 w-6" /></div>
                                    <h3 className="font-display text-2xl font-bold text-ink">Frequently Asked Questions</h3>
                                </div>
                                <div className="grid gap-6 md:grid-cols-3">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="flex flex-col rounded-2xl border border-line bg-mist dark:bg-panel p-6 shadow-sm">
                                            <h4 className="flex items-start gap-2 text-sm font-bold text-ink leading-relaxed">
                                                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 -ml-1" />
                                                {faq.q}
                                            </h4>
                                            <p className="mt-3 text-sm leading-relaxed text-muted font-medium">{faq.a}</p>
                                        </div>
                                    ))}
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
