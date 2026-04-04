import Link from "next/link";
import { FileText, LayoutDashboard, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/upload", label: "Uploads", icon: UploadCloud },
];

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-line bg-panel px-5 py-6 lg:block">
      <div className="border-b border-line px-3 pb-6">
        <p className="font-display text-2xl font-extrabold text-navy">
          COSET HUB
        </p>
        <p className="mt-1 text-sm text-muted">Admin</p>
      </div>

      <nav className="mt-6 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-mist text-navy shadow-soft"
                  : "text-muted hover:bg-panel-alt hover:text-navy",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-line bg-panel-alt px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Focus
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Manage uploads, review report status, and keep CoSET publication
          content organized.
        </p>
      </div>

      <div className="mt-6 px-1">
        <Link
          href="/reports"
          className="text-sm font-semibold text-navy transition hover:text-ember"
        >
          View public hub
        </Link>
      </div>
    </aside>
  );
}
