import Link from 'next/link';
import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeLogo } from '@/components/theme-logo';
import { cn } from '@/lib/utils';
import { FileText, Info, ShieldAlert, Mail, Rocket } from 'lucide-react';
import { cosetOrgLinks } from '@/lib/site-data';

type SiteHeaderProps = {
    dark?: boolean;
};

export async function SiteHeader({ dark = false }: SiteHeaderProps) {
    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b backdrop-blur-xl transition-colors',
                dark ? 'border-white/10 bg-ink/70 text-white' : 'border-line/70 bg-white/78 text-ink'
            )}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo & Navigation - Left */}
                <div className="flex shrink-0 items-center">
                    <Link href="/" aria-label="Go to CoSET homepage" className="inline-flex items-center">
                        <ThemeLogo className="w-[98px] h-auto sm:w-[118px]" />
                    </Link>
                    <nav className="hidden items-center gap-6 ml-10 text-sm font-semibold lg:flex">
                        <Link href="/reports" className="flex items-center gap-2 transition hover:text-ember">
                            <FileText className="h-4 w-4" />
                            Reports
                        </Link>
                        <Link href={cosetOrgLinks.about} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-ember">
                            <Info className="h-4 w-4" />
                            About Us
                        </Link>
                        <Link href="/contact" className="flex items-center gap-2 transition hover:text-ember">
                            <Mail className="h-4 w-4" />
                            Contact Us
                        </Link>
                    </nav>
                </div>

                {/* Actions - Right */}
                <div className="flex shrink-0 items-center gap-4">
                    <Suspense fallback={<div className="h-9 w-48 rounded-full bg-mist lg:block hidden" />}>
                        <SearchForm dark={dark} />
                    </Suspense>

                    <ThemeToggle darkSurface={dark} />

                    <div className="hidden items-center gap-2 md:flex">
                        <Link
                            href="#subscribe"
                            className="rounded-full bg-ember px-4 py-2.5 text-sm font-bold text-white shadow-soft transition hover:brightness-110"
                        >
                            Subscribe Now
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
