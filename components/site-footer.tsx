import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, ArrowRight } from 'lucide-react';

const footerGroups = [
    {
        heading: 'Explore',
        links: [
            { href: '/', label: 'Home' },
            { href: '/reports', label: 'Reports' },
            { href: '/blog', label: 'Planet Pulse' },
            { href: '/admin', label: 'Admin Suite' },
        ],
    },
    {
        heading: 'Research',
        links: [
            { href: '/reports', label: 'Regional Analysis' },
            { href: '/reports', label: 'Policy Briefs' },
            { href: '/reports', label: 'Data Briefs' },
            { href: '/blog', label: 'Editorial Notes' },
        ],
    },
    {
        heading: 'Institutional',
        links: [
            { href: '/admin/upload', label: 'Upload Workflow' },
            { href: '/admin/content', label: 'Content Operations' },
            { href: '/admin/analytics', label: 'Analytics' },
            { href: '/manifest.webmanifest', label: 'Manifest' },
        ],
    },
    {
        heading: 'Contact',
        links: [
            { href: 'mailto:cosetng@gmail.com', label: 'cosetng@gmail.com' },
            { href: 'https://cosetng.org', label: 'cosetng.org' },
            { href: '#', label: 'Privacy Policy' },
            { href: '#', label: 'Methodology' },
        ],
    },
];

const socialLinks = [
    { href: 'https://twitter.com/CoSETng', label: 'Twitter', icon: Twitter },
    { href: 'https://www.instagram.com/CoSETng', label: 'Instagram', icon: Instagram },
    { href: 'https://www.facebook.com/CoSETng', label: 'Facebook', icon: Facebook },
];

export function SiteFooter() {
    return (
        <>
            {/* Newsletter CTA Section */}
            <section className="mt-20 border-y border-line bg-gradient-to-br from-ink via-[#122742] to-[#1e2a3d] py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="text-white">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-ember">Stay Informed</p>
                            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.04em] lg:text-5xl">
                                Fresh intelligence delivered to your inbox
                            </h2>
                            <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">
                                Subscribe to receive weekly editorial briefings on climate justice, governance, and transformation signals across Nigeria.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm lg:p-8">
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="newsletter-email" className="sr-only">
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                                        <input
                                            id="newsletter-email"
                                            type="email"
                                            required
                                            placeholder="Enter your email address"
                                            className="w-full rounded-full border border-white/20 bg-white/10 py-4 pl-12 pr-4 text-white placeholder-white/50 backdrop-blur transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-semibold text-navy shadow-editorial transition hover:bg-sky-100"
                                >
                                    Subscribe to Newsletter
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <p className="text-center text-xs text-white/60">
                                    We respect your privacy. Unsubscribe anytime.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-line bg-panel/95 text-ink backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.2fr_1fr]">
                        <div className="space-y-6">
                            <Link href="/" aria-label="Go to CoSET homepage" className="inline-flex w-max items-center">
                                <Image src="/logo.png" alt="CoSET" width={640} height={256} className="w-[124px] h-auto sm:w-[148px]" />
                            </Link>
                            <div className="max-w-xl space-y-3">
                                <p className="text-sm font-bold uppercase tracking-[0.22em] text-ember">Uwem Nnyin — Our Lives</p>
                                <p className="text-base leading-8 text-muted">At CoSET, our mission is to drive socio-ecological transformation in Nigeria by advocating for sustainable practices, promoting social and environmental justice, and empowering communities to create a better future for all.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            aria-label={item.label}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel-alt text-muted transition hover:border-ember hover:text-ember"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {footerGroups.map((group) => (
                                <div key={group.heading} className="space-y-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{group.heading}</p>
                                    <div className="space-y-3 text-sm text-muted">
                                        {group.links.map((link) => (
                                            <Link key={link.label} href={link.href} className="block transition hover:text-ember">
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 rounded-[2rem] border border-line bg-panel-alt/70 p-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">About CoSET</p>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">The Coalition for Socio-Ecological Transformation challenges the growth-centered economic model in favor of one that prioritizes social well-being, environmental integrity, and sustainability across Nigeria&apos;s communities.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Email</p>
                                <p className="mt-2 text-sm font-semibold text-navy">cosetng@gmail.com</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Phone</p>
                                <p className="mt-2 text-sm font-semibold text-navy">+234 805 445 7460</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
                        <p>© 2026 CoSET Intelligence Hub. All rights reserved.</p>
                        <p>
                            Made with ❤️ by <Link href="https://missionctrl.com.ng" className="font-semibold text-navy transition hover:text-ember">MissionCTRL</Link>
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}