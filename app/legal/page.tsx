import type { Metadata } from 'next';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SectionReveal } from '@/components/section-reveal';

export const metadata: Metadata = {
    title: 'Legal & Privacy — CoSET Intelligence Hub',
    description:
        'How CoSET Intelligence Hub collects, uses, and protects your data, and the legal terms governing use of this platform.',
};

const LAST_UPDATED = '19 June 2026';

export default function LegalPage() {
    return (
        <>
            <SiteHeader />
            <main className="site-shell py-12 sm:py-16 lg:py-20">
                <SectionReveal>
                    <header className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
                            Legal
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-4xl lg:text-5xl">
                            Terms, Privacy & Data Use
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
                            CoSET Intelligence Hub is operated by the Coalition for Socio-Ecological
                            Transformation (CoSET). This page explains what we collect, why, and the
                            choices you have. Last updated {LAST_UPDATED}.
                        </p>
                    </header>
                </SectionReveal>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    <SectionReveal className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
                        <h2 className="font-display text-xl font-extrabold text-ink">What we collect</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                            <li>
                                <strong className="text-ink">Newsletter email:</strong> when you
                                subscribe to Hub Briefs we store your email address, subscription
                                source, and the date you opted in.
                            </li>
                            <li>
                                <strong className="text-ink">Account data (editors / admins):</strong>{' '}
                                name, email, role, and authentication metadata from Supabase Auth.
                            </li>
                            <li>
                                <strong className="text-ink">Usage signals:</strong> aggregated page
                                views and report downloads used to improve editorial coverage. No
                                third-party advertising trackers are loaded.
                            </li>
                        </ul>
                    </SectionReveal>

                    <SectionReveal className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
                        <h2 className="font-display text-xl font-extrabold text-ink">How we use it</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                            <li>
                                To deliver the email briefings you explicitly subscribed to, and to
                                notify you when a new report or position paper is published.
                            </li>
                            <li>
                                To authenticate editors and administrators and to protect the
                                platform from abuse.
                            </li>
                            <li>
                                We do not sell, rent, or share your personal data with third parties
                                for marketing purposes.
                            </li>
                        </ul>
                    </SectionReveal>

                    <SectionReveal className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
                        <h2 className="font-display text-xl font-extrabold text-ink">Your choices</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                            <li>
                                <strong className="text-ink">Unsubscribe:</strong> every briefing
                                email contains a one-click unsubscribe link. You can also visit the{' '}
                                <a href="/unsubscribe" className="font-semibold text-ember underline-offset-4 hover:underline">
                                    unsubscribe page
                                </a>{' '}
                                to manage your subscription directly.
                            </li>
                            <li>
                                <strong className="text-ink">Access & deletion:</strong> email{' '}
                                <a href="mailto:cosetng@gmail.com" className="font-semibold text-ember underline-offset-4 hover:underline">
                                    cosetng@gmail.com
                                </a>{' '}
                                to request a copy of your data or ask us to delete it.
                            </li>
                        </ul>
                    </SectionReveal>

                    <SectionReveal className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
                        <h2 className="font-display text-xl font-extrabold text-ink">Editorial licence</h2>
                        <p className="mt-4 text-sm leading-relaxed text-muted">
                            All reports, position papers, and commentary published on CoSET
                            Intelligence Hub are released under a Creative Commons
                            Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) licence unless
                            otherwise stated on the report itself. You may quote, translate, and adapt
                            the work for non-commercial purposes with appropriate attribution to CoSET.
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-muted">
                            For commercial reuse, partnership enquiries, or media licensing, please
                            contact the editorial team at{' '}
                            <a href="mailto:cosetng@gmail.com" className="font-semibold text-ember underline-offset-4 hover:underline">
                                cosetng@gmail.com
                            </a>
                            .
                        </p>
                    </SectionReveal>
                </div>

                <SectionReveal className="mt-10 rounded-3xl border border-line bg-mist p-6 text-sm leading-relaxed text-muted shadow-soft sm:p-8 dark:bg-panel-alt/60">
                    <h2 className="font-display text-xl font-extrabold text-ink">Contact</h2>
                    <p className="mt-3">
                        Questions about these terms or our data handling can be sent to{' '}
                        <a href="mailto:cosetng@gmail.com" className="font-semibold text-ember underline-offset-4 hover:underline">
                            cosetng@gmail.com
                        </a>
                        . We respond to privacy and data requests within 14 working days.
                    </p>
                </SectionReveal>
            </main>
            <SiteFooter />
        </>
    );
}
