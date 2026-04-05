import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, LogOut, Search } from 'lucide-react';

import { logout } from '@/app/login/actions';

import { Suspense } from 'react';
import { SearchForm } from '@/components/search-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { createSupabaseServerClient as createClient, isSupabaseConfigured } from '@/lib/supabase/clients';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
    dark?: boolean;
};

export async function SiteHeader({ dark = false }: SiteHeaderProps) {
    let user: { email?: string | null } | null = null;

    if (isSupabaseConfigured()) {
        try {
            const supabase = createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            user = authUser;
        } catch {
            user = null;
        }
    }

    return (
        <header
            className={cn(
                'sticky top-0 z-50 border-b backdrop-blur-xl',
                dark ? 'border-white/10 bg-ink/70 text-white' : 'border-line/70 bg-white/78 text-ink'
            )}
        >
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-5">
                    <Link href="/" aria-label="Go to CoSET homepage" className="inline-flex items-center">
                        <Image src="/logo.png" alt="CoSET" width={640} height={256} priority className="w-[98px] h-auto sm:w-[118px]" />
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                        <Link href="/reports" className="transition hover:text-ember">
                            Reports
                        </Link>
                        <Link href="/blog" className="transition hover:text-ember">
                            Blog
                        </Link>
                        <Link href="/admin" className="transition hover:text-ember">
                            Admin
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Suspense fallback={<div className="h-9 w-48 rounded-full bg-mist lg:block hidden" />}>
                        <SearchForm dark={dark} />
                    </Suspense>

                    {user ? (
                        <details className="group relative">
                            <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-panel px-3 py-2 shadow-soft transition hover:bg-panel-alt list-none">
                                <Image src="/favicon.png" alt="User" width={20} height={20} className="rounded-full" />
                                <ChevronDown className="h-3.5 w-3.5 text-muted transition group-open:rotate-180" />
                            </summary>
                            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-line bg-panel p-4 shadow-lg">
                                <div className="mb-3 flex items-center gap-3">
                                    <Image src="/favicon.png" alt="User" width={32} height={32} className="rounded-full" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-ink">{user.email}</p>
                                        <p className="text-xs text-muted">Admin</p>
                                    </div>
                                </div>
                                <form action={logout} className="mt-3 pt-3 border-t border-line">
                                    <button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-mist hover:text-ink">
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </details>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:brightness-110"
                        >
                            Sign In
                        </Link>
                    )}

                    <ThemeToggle darkSurface={dark} />
                </div>
            </div>
        </header>
    );
}
