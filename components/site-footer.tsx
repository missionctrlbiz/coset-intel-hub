import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, FileText, ChevronRight, Hash, Compass, AlertCircle } from 'lucide-react';
import { ThemeLogo } from '@/components/theme-logo';
import { cosetOrgLinks, filterGroups, reports } from '@/lib/site-data';

function getFooterCategoryLinks() {
    const categories = Array.from(
        new Set([
            ...filterGroups.categories,
            ...reports.flatMap((report) => report.category),
        ]),
    );

    const shuffled = [...categories];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled.slice(0, 5).map((category) => ({
        href: `/reports?category=${encodeURIComponent(category)}`,
        label: category,
    }));
}

const baseFooterGroups = [
    {
        heading: 'Explore',
        icon: Compass,
        links: [
            { href: '/', label: 'Home' },
            { href: '/reports', label: 'Intelligence Reports' },
            { href: '/contact', label: 'Contact Us' },
            { href: '/admin', label: 'Admin Suite' },
        ],
    },
    {
        heading: 'Research Hub',
        icon: FileText,
        links: [],
    },
    {
        heading: 'Quick Links',
        icon: Hash,
        links: [
            { href: cosetOrgLinks.about, label: 'About Uwem Nnyin' },
            { href: cosetOrgLinks.positionPapers, label: 'Position Papers' },
            { href: cosetOrgLinks.donate, label: 'Donate' },
            { href: cosetOrgLinks.contact, label: 'Contact CoSET' },
        ],
    },
];

const socialLinks = [
    { href: 'https://twitter.com/CoSETng', label: 'Twitter', icon: Twitter },
    { href: 'https://www.instagram.com/CoSETng', label: 'Instagram', icon: Instagram },
    { href: 'https://www.facebook.com/CoSETng', label: 'Facebook', icon: Facebook },
];

export function SiteFooter() {
    const footerGroups = baseFooterGroups.map((group) =>
        group.heading === 'Research Hub'
            ? { ...group, links: getFooterCategoryLinks() }
            : group,
    );

    return (
        <footer className="border-t border-line bg-panel/95 text-ink backdrop-blur dark:bg-[#08111d] dark:text-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">

                {/* Main Footer Grid */}
                <div className="grid gap-12 border-b border-line pb-12 lg:grid-cols-[1fr_2fr]">

                    {/* Brand & Social */}
                    <div className="space-y-8">
                        <Link href="/" aria-label="Go to CoSET homepage" className="inline-flex w-max items-center">
                            <ThemeLogo className="w-[124px] h-auto sm:w-[148px]" />
                        </Link>
                        <div className="max-w-md space-y-3">
                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-ember">Uwem Nnyin — Our Lives</p>
                            <p className="text-base leading-relaxed text-muted">
                                Advocating for sustainable practices, promoting social and environmental justice, and empowering communities across Nigeria.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        aria-label={item.label}
                                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-panel-alt text-navy transition hover:border-ember hover:text-ember dark:bg-white/5 dark:text-ember dark:hover:bg-white/10 dark:hover:text-white"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="grid gap-8 sm:grid-cols-3">
                        {footerGroups.map((group) => {
                            const GroupIcon = group.icon;
                            return (
                                <div key={group.heading} className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted dark:text-white/70">
                                        <GroupIcon className="h-4 w-4" />
                                        {group.heading}
                                    </h3>
                                    <ul className="space-y-4 text-sm font-medium text-navy dark:text-ember/90">
                                        {group.links.map((link) => (
                                            <li key={link.label}>
                                                <Link href={link.href} className="group flex items-center gap-2 transition hover:text-ember dark:hover:text-white">
                                                    <ChevronRight className="h-3 w-3 text-muted/50 transition-transform group-hover:translate-x-1 group-hover:text-ember dark:text-white/35 dark:group-hover:text-white" />
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Structured Contact Row */}
                <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
                    <div className="flex items-start gap-4 rounded-[1.5rem] border border-line bg-mist p-6 dark:bg-panel-alt">
                        <div className="rounded-full bg-navy/10 p-3 text-navy dark:bg-ember/10 dark:text-ember"><MapPin className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Headquarters</p>
                            <p className="mt-2 text-sm font-semibold text-ink">Marrakesh Street, Wuse 2<br />Abuja, Nigeria</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-[1.5rem] border border-line bg-mist p-6 dark:bg-panel-alt">
                        <div className="rounded-full bg-ember/10 p-3 text-ember"><Mail className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Email Us</p>
                            <a href="mailto:cosetng@gmail.com" className="mt-2 block text-sm font-semibold text-ink hover:text-ember transition">cosetng@gmail.com</a>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-[1.5rem] border border-line bg-mist p-6 dark:bg-panel-alt">
                        <div className="rounded-full bg-teal/10 p-3 text-teal"><Phone className="h-6 w-6" /></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Call Us</p>
                            <a href="tel:+2348054457460" className="mt-2 block text-sm font-semibold text-ink hover:text-teal transition">+234 805 445 7460</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} CoSET Intelligence Hub. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="https://missionctrl.com.ng" className="flex items-center gap-2 font-semibold text-navy transition hover:text-ember dark:text-ember/90 dark:hover:text-white">
                            Made with ❤️ by MissionCTRL
                        </Link>
                        <span className="hidden h-4 w-px bg-line md:block" />
                        <Link href="#" className="flex items-center gap-1 font-semibold text-navy transition hover:text-ember dark:text-ember/90 dark:hover:text-white">
                            <AlertCircle className="h-4 w-4" /> Legal
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
