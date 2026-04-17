import Link from 'next/link';
import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeLogo } from '@/components/theme-logo';
import { AdminNavClient } from '@/components/admin-nav-client';
import { cn } from '@/lib/utils';
import { FileText, Info, Mail, Menu } from 'lucide-react';
import { cosetOrgLinks } from '@/lib/site-data';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type SiteHeaderProps = {
    dark?: boolean;
    isAdmin?: boolean;
};

export async function SiteHeader({ dark = false, isAdmin = false }: SiteHeaderProps) {
    // Fetch user details for admin avatar — gracefully falls back if not signed in
    let adminFullName: string | null = null;
    let adminEmail: string | null = null;

    if (isAdmin) {
        try {
            const supabase = await createSupabaseServerClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                adminEmail = user.email ?? null;
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', user.id)
                    .maybeSingle();
                adminFullName = (profile as { full_name: string | null; email: string | null } | null)?.full_name ?? null;
                if (!adminEmail) adminEmail = (profile as { full_name: string | null; email: string | null } | null)?.email ?? null;
            }
        } catch {
            // silently fall through — header will show without user info
        }
    }

    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b backdrop-blur-xl transition-colors',
                dark ? 'border-white/10 bg-[#0A1421]/80 text-white' : 'border-line/70 bg-white/95 text-ink dark:border-white/10 dark:bg-panel/90 dark:text-white'
            )}
        >
            <div className={cn(
                'relative mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8',
                isAdmin ? 'w-full max-w-[1600px]' : 'max-w-7xl'
            )}>
                {/* Logo + Nav */}
                <div className="flex min-w-0 flex-1 items-center">
                    <Link href={isAdmin ? '/admin' : '/'} aria-label="Go to CoSET homepage" className="shrink-0 inline-flex items-center">
                        <ThemeLogo className="w-[98px] h-auto sm:w-[118px]" forceDark={dark} />
                    </Link>

                    {isAdmin ? (
                        <AdminNavClient fullName={adminFullName} email={adminEmail} dark={dark} />
                    ) : (
                        <nav className="hidden items-center gap-1 ml-8 lg:flex">
                            <Link href="/reports" className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:text-ember', dark ? 'text-white/80' : 'text-muted hover:bg-mist')}>
                                <FileText className="h-4 w-4" />
                                Reports
                            </Link>
                            <Link href={cosetOrgLinks.about} target="_blank" rel="noopener noreferrer" className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:text-ember', dark ? 'text-white/80' : 'text-muted hover:bg-mist')}>
                                <Info className="h-4 w-4" />
                                About Us
                            </Link>
                            <Link href="/contact" className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition hover:text-ember', dark ? 'text-white/80' : 'text-muted hover:bg-mist')}>
                                <Mail className="h-4 w-4" />
                                Contact Us
                            </Link>
                        </nav>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex shrink-0 items-center gap-3">
                    {!isAdmin && (
                        <>
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
                            <details className="relative lg:hidden">
                                <summary
                                    aria-label="Open navigation menu"
                                    className={cn(
                                        'flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border transition [&::-webkit-details-marker]:hidden',
                                        dark
                                            ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                                            : 'border-line bg-mist text-navy hover:border-ember/30 hover:bg-panel'
                                    )}
                                >
                                    <Menu className="h-5 w-5" />
                                </summary>

                                <div
                                    className={cn(
                                        'absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-b-[1.75rem] rounded-t-none border p-3 shadow-editorial',
                                        dark
                                            ? 'border-white/10 bg-[#0A1421]/95 text-white backdrop-blur-2xl'
                                            : 'border-line bg-white/95 text-ink backdrop-blur-2xl dark:border-white/10 dark:bg-panel/95 dark:text-white'
                                    )}
                                >
                                    <nav className="flex flex-col gap-1">
                                        <Link
                                            href="/reports"
                                            className={cn(
                                                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                                                dark ? 'text-white/85 hover:bg-white/5 hover:text-white' : 'text-navy hover:bg-mist'
                                            )}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Reports
                                        </Link>
                                        <Link
                                            href={cosetOrgLinks.about}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                                                dark ? 'text-white/85 hover:bg-white/5 hover:text-white' : 'text-navy hover:bg-mist'
                                            )}
                                        >
                                            <Info className="h-4 w-4" />
                                            About Us
                                        </Link>
                                        <Link
                                            href="/contact"
                                            className={cn(
                                                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                                                dark ? 'text-white/85 hover:bg-white/5 hover:text-white' : 'text-navy hover:bg-mist'
                                            )}
                                        >
                                            <Mail className="h-4 w-4" />
                                            Contact Us
                                        </Link>
                                    </nav>

                                    <div className={cn('mt-3 border-t pt-3', dark ? 'border-white/10' : 'border-line')}>
                                        <Link
                                            href="#subscribe"
                                            className="flex items-center justify-center rounded-full bg-ember px-4 py-3 text-sm font-bold text-white shadow-soft transition hover:brightness-110"
                                        >
                                            Subscribe Now
                                        </Link>
                                    </div>
                                </div>
                            </details>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}
