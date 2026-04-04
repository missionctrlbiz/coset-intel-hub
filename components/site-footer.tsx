import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

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
            { href: 'mailto:hello@coset.ng', label: 'hello@coset.ng' },
            { href: 'https://missionctrl.com.ng', label: 'missionctrl.com.ng' },
            { href: '#', label: 'Privacy Policy' },
            { href: '#', label: 'Methodology' },
        ],
    },
];

const socialLinks = [
    { href: 'https://www.linkedin.com', label: 'LinkedIn', icon: Linkedin },
    { href: 'https://www.twitter.com', label: 'Twitter', icon: Twitter },
    { href: 'https://www.instagram.com', label: 'Instagram', icon: Instagram },
    { href: 'https://www.facebook.com', label: 'Facebook', icon: Facebook },
];

export function SiteFooter() {
    return (
        <footer className="mt-20 border-t border-line bg-panel/95 text-ink backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-6">
                        <Link href="/" aria-label="Go to CoSET homepage" className="inline-flex w-max items-center">
                            <Image src="/logo.png" alt="CoSET" width={640} height={256} className="w-[124px] h-auto sm:w-[148px]" />
                        </Link>
                        <div className="max-w-xl space-y-3">
                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-ember">Climate Justice Intelligence</p>
                            <p className="text-base leading-8 text-muted">CoSET Intelligence Hub curates premium research, policy analysis, and socio-ecological reporting for institutions shaping equitable transition pathways in Nigeria.</p>
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
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Quick Line</p>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Use the hub as a public-facing intelligence layer, an editorial desk, and a structured operations surface for report ingestion, curation, and analysis.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Email</p>
                            <p className="mt-2 text-sm font-semibold text-navy">hello@coset.ng</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-line bg-panel p-4">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Support</p>
                            <p className="mt-2 text-sm font-semibold text-navy">Editorial and platform inquiries</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
                    <p>© 2026 CoSET Intelligence Hub. All rights reserved.</p>
                    <p>
                        Made with ❤️ by <Link href="https://missionctrl.com.ng" className="font-semibold text-navy transition hover:text-ember">MissionCTRL</Link>. missionctrl.com.ng
                    </p>
                </div>
            </div>
        </footer>
    );
}