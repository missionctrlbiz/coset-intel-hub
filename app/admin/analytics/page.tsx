import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  FolderOpen,
  UploadCloud,
} from "lucide-react";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getAdminContentReports } from "@/lib/content";

export default async function AdminAnalyticsPage() {
  const { reports, canManage, isFallback, profile, user } =
    await getAdminContentReports();

  const publishedCount = reports.filter(
    (report) => report.status === "Published",
  ).length;
  const draftCount = reports.filter(
    (report) => report.status === "Draft",
  ).length;
  const scheduledCount = reports.filter(
    (report) => report.status === "Scheduled",
  ).length;
  const archivedCount = reports.filter(
    (report) => report.status === "Archived",
  ).length;

  const categories = Array.from(
    new Set(reports.map((report) => report.category)),
  ).slice(0, 8);
  const recentReports = reports.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-[1600px]">
      <AdminSidebar pathname="/admin/analytics" />
      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
              Publishing Insights
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">
              Content operations overview
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted">
              This page focuses on the current publishing pipeline in the CoSET
              hub rather than placeholder traffic analytics.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-2 rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
            >
              Open upload flow
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-5 py-3 text-sm font-semibold text-navy shadow-soft transition hover:border-navy"
            >
              Manage content
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {!user ? (
          <section className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
            Sign in to view live admin reporting. Seeded fallback content is
            currently shown so the layout remains usable.
          </section>
        ) : null}

        {user && !canManage ? (
          <section className="mb-8 rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
            You are signed in as {profile?.email ?? user.email}, but your
            current role is `{profile?.role ?? "viewer"}`. Publishing insights
            are limited to the content you are allowed to see.
          </section>
        ) : null}

        {isFallback ? (
          <section className="mb-8 rounded-[2rem] border border-line bg-panel-alt px-5 py-4 text-sm text-muted shadow-soft">
            Live report rows were not available, so this summary is currently
            based on fallback content.
          </section>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Published reports"
            value={String(publishedCount)}
            note="Visible in the public hub"
          />
          <SummaryCard
            icon={<FolderOpen className="h-5 w-5" />}
            label="Draft queue"
            value={String(draftCount)}
            note="Needs editorial review"
          />
          <SummaryCard
            icon={<UploadCloud className="h-5 w-5" />}
            label="Scheduled / archived"
            value={String(scheduledCount + archivedCount)}
            note="Non-public workflow states"
          />
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Total tracked reports"
            value={String(reports.length)}
            note="Current admin-facing inventory"
          />
        </section>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[2rem] border border-line bg-panel shadow-soft">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  Recent report activity
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Latest reports in the current publishing flow.
                </p>
              </div>
              <Link
                href="/admin/content"
                className="text-sm font-semibold text-ember"
              >
                Open content table
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Modified</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-t border-line even:bg-panel-alt/60"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-navy">
                            {report.title}
                          </p>
                          <p className="mt-1 text-xs text-muted">
                            {report.slug}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-muted">
                        {report.category}
                      </td>
                      <td className="px-6 py-5 text-sm text-muted">
                        {report.author}
                      </td>
                      <td className="px-6 py-5 text-sm text-muted">
                        {report.modified}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            report.status === "Published"
                              ? "bg-emerald-100 text-emerald-800"
                              : report.status === "Draft"
                                ? "bg-slate-200 text-slate-700"
                                : report.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Workflow focus
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-navy">
                What this page tracks
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
                <li>
                  • How many reports are published, drafted, scheduled, or
                  archived
                </li>
                <li>• Which categories currently exist in the hub</li>
                <li>• What was most recently edited in the content pipeline</li>
                <li>• Where to go next for upload or content management</li>
              </ul>
            </section>

            <section className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Coverage snapshot
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold">
                Current report categories
              </h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white"
                    >
                      {category}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-white/70">
                    No categories are available yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                Next actions
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <Link
                  href="/admin/upload"
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  Upload a new report
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/content"
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  Review report statuses
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/reports"
                  className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3 font-medium text-navy transition hover:border-navy"
                >
                  View public reports
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-mist p-3 text-navy">{icon}</div>
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-ink">
        {value}
      </p>
      <p className="mt-3 text-sm text-muted">{note}</p>
    </div>
  );
}
