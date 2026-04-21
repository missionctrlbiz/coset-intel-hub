'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    FilePlus,
    FolderOpen,
    Users,
    MessageSquare,
    LogOut,
    Menu,
    X,
    ChevronDown,
    UserCircle2,
} from 'lucide-react';
import { createSupabasePublicClient } from '@/lib/supabase/clients';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/upload', label: 'Add Reports', icon: FilePlus, exact: false },
    { href: '/admin/content', label: 'Manage Reports', icon: FolderOpen, exact: false },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare, exact: false },
    { href: '/admin/subscribers', label: 'Subscribers', icon: Users, exact: false },
];

type AdminNavClientProps = {
    fullName: string | null;
    email: string | null;
    dark?: boolean;
};

export function AdminNavClient({ fullName, email, dark = false }: AdminNavClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Close avatar dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setAvatarOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on navigation
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    function isActiveLink(href: string, exact: boolean) {
        if (exact) return pathname === href;
        return pathname?.startsWith(href) ?? false;
    }

    async function handleLogout() {
        const supabase = createSupabasePublicClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    const initials = fullName
        ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : email?.[0]?.toUpperCase() ?? 'A';

    const displayName = fullName ?? email ?? 'Admin';

    const linkBase = cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition',
        dark ? 'hover:bg-white/10' : 'hover:bg-mist'
    );
    const linkActive = dark ? 'text-white' : 'text-ember';
    const linkInactive = dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink';

    return (
        <>
            {/* Desktop nav links (lg+) */}
            <nav className="hidden items-center gap-1 ml-8 lg:flex">
                {adminLinks.map(({ href, label, icon: Icon, exact }) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            linkBase,
                            isActiveLink(href, exact) ? linkActive : linkInactive
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </Link>
                ))}
            </nav>

            {/* Right side: theme toggle + avatar dropdown + hamburger */}
            <div className="ml-auto flex items-center gap-2">
                {/* Theme toggle */}
                <ThemeToggle darkSurface={dark} />

                {/* Avatar dropdown */}
                <div ref={avatarRef} className="relative hidden sm:block">
                    <button
                        type="button"
                        onClick={() => setAvatarOpen((o) => !o)}
                        className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition',
                            dark
                                ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                                : 'border-line bg-mist text-navy hover:border-navy/30 hover:bg-panel'
                        )}
                        aria-label="Account menu"
                    >
                        <span className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-black',
                            dark ? 'bg-ember text-white' : 'bg-ember/10 text-ember'
                        )}>
                            {initials}
                        </span>
                        <span className="hidden max-w-[120px] truncate md:block">{displayName}</span>
                        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', avatarOpen && 'rotate-180')} />
                    </button>

                    {avatarOpen && (
                        <div className={cn(
                            'absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border shadow-editorial',
                            dark ? 'border-white/10 bg-[#0A1421]' : 'border-line bg-panel'
                        )}>
                            <div className={cn('border-b px-4 py-3', dark ? 'border-white/10' : 'border-line')}>
                                <p className={cn('text-xs font-bold uppercase tracking-[0.15em]', dark ? 'text-white/40' : 'text-muted')}>Signed in as</p>
                                <p className={cn('mt-0.5 truncate text-sm font-semibold', dark ? 'text-white' : 'text-navy')}>{email ?? displayName}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={cn(
                                        'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                                        dark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-muted hover:bg-rose-50 hover:text-rose-700'
                                    )}
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger (below lg) */}
                <button
                    type="button"
                    onClick={() => setMobileOpen((o) => !o)}
                    className={cn(
                        'flex items-center justify-center rounded-full p-2.5 transition lg:hidden',
                        dark ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-mist'
                    )}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen ? 'true' : 'false'}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile slide-down menu */}
            {mobileOpen && (
                <div className={cn(
                    'absolute inset-x-0 top-full z-40 border-b shadow-editorial lg:hidden',
                    dark ? 'border-white/10 bg-[#0A1421]/95 backdrop-blur-xl' : 'border-line bg-white/95 backdrop-blur-xl'
                )}>
                    <nav className="site-shell max-w-[1520px] py-4">
                        <div className="space-y-1">
                            {adminLinks.map(({ href, label, icon: Icon, exact }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                                        isActiveLink(href, exact)
                                            ? dark ? 'bg-white/10 text-white' : 'bg-ember/10 text-ember'
                                            : dark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-muted hover:bg-mist hover:text-navy'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className={cn('mt-4 border-t pt-4', dark ? 'border-white/10' : 'border-line')}>
                            <div className="mb-3 px-4">
                                <p className={cn('text-xs font-semibold', dark ? 'text-white/40' : 'text-muted')}>
                                    {email ?? displayName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
                                    dark ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-muted hover:bg-rose-50 hover:text-rose-700'
                                )}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
