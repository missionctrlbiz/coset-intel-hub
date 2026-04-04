import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  createSupabaseServerClient as createClient,
  isSupabaseConfigured,
} from "@/lib/supabase/clients";
import { cosetOrgLinks } from "@/lib/site-data";
import { cn } from "@/lib/utils";

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
        "sticky top-0 z-50 border-b backdrop-blur-xl",
        dark
          ? "border-white/10 bg-ink/70 text-white"
          : "border-line/70 bg-white/78 text-ink",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            aria-label="Go to CoSET homepage"
            className="inline-flex items-center"
          >
            <Image
              src="/logo.png"
              alt="CoSET"
              width={640}
              height={256}
              priority
              className="h-auto w-[98px] sm:w-[118px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/reports" className="transition hover:text-ember">
              Reports
            </Link>
            <Link href="/blog" className="transition hover:text-ember">
              Updates
            </Link>
            <Link
              href={cosetOrgLinks.positionPapers}
              className="transition hover:text-ember"
            >
              Position Papers
            </Link>
            <Link
              href={cosetOrgLinks.about}
              className="transition hover:text-ember"
            >
              About CoSET
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/admin"
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                dark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-mist text-navy hover:bg-panel-alt",
              )}
            >
              Open Admin
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
