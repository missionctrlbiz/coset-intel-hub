import Link from 'next/link';
import { BarChart3, FileText, HelpCircle, LayoutDashboard, UploadCloud } from 'lucide-react';

import { cn } from '@/lib/utils';

const items = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/upload', label: 'Uploads', icon: UploadCloud },
];

type AdminSidebarProps = {
    pathname: string;
};

export function AdminSidebar({ pathname }: AdminSidebarProps) {
    return (
        <aside className="hidden min-h-screen w-72 shrink-0 border-r border-line bg-panel px-5 py-6 lg:block">
            <div className="mb-8 space-y-1 px-3">
                <p className="font-display text-2xl font-extrabold text-navy">COSET HUB</p>
                <p className="text-sm text-muted">Intelligence Admin</p>
            </div>

            <nav className="space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                                active ? 'bg-mist text-navy shadow-soft' : 'text-muted hover:bg-panel-alt hover:text-navy'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-10 rounded-2xl bg-ink p-5 text-white shadow-editorial">
                <p className="mb-2 font-display text-lg font-bold">Curation Status</p>
                <p className="text-sm text-white/70">Metadata quality has improved by 18% since the last ingestion cycle.</p>
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-4 py-3 font-semibold text-white transition hover:brightness-110">
                <HelpCircle className="h-4 w-4" />
                Help Center
            </button>
        </aside>
    );
}