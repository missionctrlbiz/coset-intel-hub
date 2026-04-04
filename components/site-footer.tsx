import Image from "next/image";
import Link from "next/link";

import { cosetOrgLinks } from "@/lib/site-data";

const hubLinks = [
  { href: "/", label: "Home" },
  { href: "/reports", label: "Reports" },
  { href: "/blog", label: "Updates" },
];

const organizationLinks = [
  { href: cosetOrgLinks.mainSite, label: "CoSET Nigeria" },
  { href: cosetOrgLinks.about, label: "About CoSET" },
  { href: cosetOrgLinks.positionPapers, label: "Position Papers" },
  { href: cosetOrgLinks.contact, label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-panel/95 text-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-xl">
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
                className="h-auto w-[124px] sm:w-[144px]"
              />
            </Link>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.22em] text-ember">
              CoSET Intelligence Hub
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">
              Research, policy briefs, and socio-ecological intelligence focused
              on climate justice and transformation in Nigeria.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Hub
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {hubLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block transition hover:text-ember"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
              Organization
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              {organizationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block transition hover:text-ember"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© 2026 CoSET Intelligence Hub. All rights reserved.</p>
          <p>
            For campaigns, events, and broader organizational updates, visit{" "}
            <Link
              href={cosetOrgLinks.mainSite}
              className="font-semibold text-navy transition hover:text-ember"
            >
              cosetng.org
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
