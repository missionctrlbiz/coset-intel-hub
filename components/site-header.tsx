import Image from 'next/image';
import Link from 'next/link';
import { Bell, LogOut, Search, User } from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { createSupabaseServerClient as createClient } from '@/lib/supabase/clients';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
    dark?: boolean;
};

export async function SiteHeader({ dark = false }: SiteHeaderProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
                    <div className={cn('hidden items-center gap-2 rounded-full px-4 py-2 lg:flex', dark ? 'bg-white/10' : 'bg-mist')}>
                        <Search className="h-4 w-4" />
                        <input
                            aria-label="Search intelligence"
                            className="w-48 bg-transparent text-sm outline-none placeholder:text-current/50"
                            placeholder="Search intelligence..."
                        />
                    </div>
                    
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className={cn('hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold md:flex', dark ? 'border-white/10 bg-white/5 text-white/70' : 'border-line bg-mist text-muted')}>
                                <User className="h-3 w-3" />
                                {user.email?.split('@')[0]}
                            </div>
                            <Link 
                                href="/login" 
                                className={cn('rounded-full p-2 transition', dark ? 'hover:bg-white/10' : 'hover:bg-mist')}
                                title="Admin Desk"
                            >
                                <Bell className="h-4 w-4" />
                            </Link>
                        </div>
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