import Link from "next/link";
import { ArrowRight, Clock3, FileText, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getAdminContentReports } from "@/lib/content";

export default async function AdminDashboardPage() {
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

  const queueCount = draftCount + scheduledCount;
  const recentReports = reports.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-[1600px]">
      <AdminSidebar pathname="/admin" />
      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
              CoSET Admin
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">
              Publishing and curation overview
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted">
              A lean view of the current report pipeline for the hub, centered
              on uploads, review status, and recently managed content.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/upload"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-white shadow-soft transition hover:brightness-110"
            >
              Upload new report
              <UploadCloud className="h-4 w-4" />
            </Link>
            <Link
              href="/admin/content"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-panel px-5 py-3 font-semibold text-navy shadow-soft transition hover:border-navy"
            >
              Open content table
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {!user ? (
          <section className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
            Sign in to view live admin content. Seeded fallback report data is
            shown below until an authenticated session is available.
          </section>
        ) : null}

        {user && !canManage ? (
          <section className="mb-8 rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
            You are signed in as{" "}
            {profile?.full_name ?? profile?.email ?? user.email}, but your
            current role does not include full publishing permissions. You can
            review published content here, while editor or admin role is
            required for full curation actions.
          </section>
        ) : null}

        {isFallback ? (
          <section className="mb-8 rounded-[2rem] border border-line bg-panel-alt px-5 py-4 text-sm text-muted shadow-soft">
            No live report rows were returned yet, so this overview is
            temporarily using seeded CoSET content.
          </section>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FileText className="h-5 w-5" />}
            label="Reports in hub"
            value={String(reports.length)}
            note="Total reports currently visible in this admin view."
          />
          <SummaryCard
            icon={<Clock3 className="h-5 w-5" />}
            label="Review queue"
            value={String(queueCount)}
            note="Draft and scheduled items that still need publishing attention."
          />
          <SummaryCard
            icon={<UploadCloud className="h-5 w-5" />}
            label="Published"
            value={String(publishedCount)}
            note="Reports already live in the public hub."
          />
          <SummaryCard
            icon={<ArrowRight className="h-5 w-5" />}
            label="Archived"
            value={String(archivedCount)}
            note="Reports retained in the system but not currently surfaced."
          />
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
            <div className="flex flex-col gap-4 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">
                  Recent report activity
                </h2>
                <p className="mt-1 text-sm text-muted">
                  The most recently updated content rows currently available in
                  the hub.
                </p>
              </div>
              <Link
                href="/admin/content"
                className="text-sm font-semibold text-ember transition hover:text-navy"
              >
                Manage content
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  <tr>
                    <th className="px-6 py-4">Report</th>
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
                                  : "bg-slate-200 text-slate-700"
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
                Current focus
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold text-navy">
                What the CoSET team should pay attention to now
              </h2>
              <div className="mt-6 space-y-4 text-sm text-muted">
                <div className="rounded-[1.5rem] border border-line bg-panel-alt p-4">
                  <p className="font-semibold text-navy">Publishing queue</p>
                  <p className="mt-2 leading-7">
                    {queueCount > 0
                      ? `${queueCount} report${queueCount === 1 ? "" : "s"} currently sit in the draft or scheduled queue and may need editorial review, metadata updates, or publication decisions.`
                      : "There are currently no draft or scheduled reports in the queue."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-line bg-panel-alt p-4">
                  <p className="font-semibold text-navy">Public hub coverage</p>
                  <p className="mt-2 leading-7">
                    {publishedCount > 0
                      ? `${publishedCount} report${publishedCount === 1 ? "" : "s"} are currently published and visible in the public hub.`
                      : "No reports are currently marked as published."}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-line bg-panel-alt p-4">
                  <p className="font-semibold text-navy">
                    Access and data mode
                  </p>
                  <p className="mt-2 leading-7">
                    {isFallback
                      ? "This dashboard is operating in fallback mode until live admin content becomes available."
                      : canManage
                        ? "You are viewing the live publishing dataset with management access."
                        : "You are viewing a limited content set based on your current access level."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-ink p-6 text-white shadow-editorial">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Next actions
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold">
                Use the admin as a publishing workflow, not a dashboard template
              </h2>
              <div className="mt-6 space-y-3 text-sm text-white/75">
                <p>• Upload new source files and begin extraction.</p>
                <p>• Review report rows in the content table.</p>
                <p>
                  • Confirm titles, categories, tags, and publication status
                  before release.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Open upload flow
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/content"
                  className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Review content table
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {scheduledCount > 0 || draftCount > 0 ? (
              <section className="rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  Status breakdown
                </p>
                <div className="mt-5 space-y-3 text-sm">
                  <StatusRow label="Draft" value={draftCount} />
                  <StatusRow label="Scheduled" value={scheduledCount} />
                  <StatusRow label="Published" value={publishedCount} />
                  <StatusRow label="Archived" value={archivedCount} />
                </div>
              </section>
            ) : null}
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
      <div className="mb-5 flex items-center justify-between">
        <div className="rounded-2xl bg-mist p-3 text-navy">{icon}</div>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-ink">
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-muted">{note}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-panel-alt px-4 py-3">
      <span className="font-medium text-navy">{label}</span>
      <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold uppercase text-muted">
        {value}
      </span>
    </div>
  );
}
