import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getAdminContentReports } from "@/lib/content";

const statusClasses: Record<string, string> = {
  Archived: "bg-slate-200 text-slate-700",
  Draft: "bg-slate-200 text-slate-700",
  Published: "bg-emerald-100 text-emerald-800",
  Scheduled: "bg-blue-100 text-blue-800",
};

function getStatusCount(
  reports: Awaited<ReturnType<typeof getAdminContentReports>>["reports"],
  status: string,
) {
  return reports.filter((report) => report.status === status).length;
}

export default async function AdminContentPage() {
  const { reports, canManage, isFallback, profile, user } =
    await getAdminContentReports();

  const publishedCount = getStatusCount(reports, "Published");
  const draftCount = getStatusCount(reports, "Draft");
  const scheduledCount = getStatusCount(reports, "Scheduled");
  const archivedCount = getStatusCount(reports, "Archived");

  return (
    <div className="mx-auto flex max-w-[1600px]">
      <AdminSidebar pathname="/admin/content" />
      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
              CoSET Admin
            </p>
            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">
              Content Management
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted">
              Review and manage the reports currently in the hub.
            </p>
          </div>

          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-ember px-5 py-3 font-semibold text-white shadow-soft transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Upload New Report
          </Link>
        </div>

        {!user ? (
          <section className="mb-8 rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
            Sign in to view live admin content. Seeded fallback data is shown
            below until an authenticated session is available.
          </section>
        ) : null}

        {user && !canManage ? (
          <section className="mb-8 rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
            You are signed in as {profile?.email ?? user.email}, but your
            profile role is `{profile?.role ?? "viewer"}`. You can view
            published content, but editor or admin role is required to manage
            all reports.
          </section>
        ) : null}

        {isFallback ? (
          <section className="mb-8 rounded-[2rem] border border-line bg-panel-alt px-5 py-4 text-sm text-muted shadow-soft">
            No live report rows were returned yet, so the table is temporarily
            showing seeded fallback content.
          </section>
        ) : null}

        <section className="mb-8 rounded-[2rem] border border-line bg-panel p-6 shadow-soft">
          <div className="grid gap-5 md:grid-cols-4">
            <StatusSummary label="All reports" value={String(reports.length)} />
            <StatusSummary label="Published" value={String(publishedCount)} />
            <StatusSummary label="Drafts" value={String(draftCount)} />
            <StatusSummary
              label="Scheduled / Archived"
              value={String(scheduledCount + archivedCount)}
            />
          </div>

          <div className="mt-6 border-t border-line pt-5 text-sm text-muted">
            {canManage
              ? "You are viewing the full report table for the hub, including unpublished content."
              : "You are viewing published content only. Editor or admin access is required for the full table."}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <div>
              <p className="font-display text-2xl font-bold text-navy">
                Reports
              </p>
              <p className="mt-1 text-sm text-muted">
                Title, category, author, last modified date, and publication
                status.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                <tr>
                  <th className="px-6 py-5">Title & Reference</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Author</th>
                  <th className="px-6 py-5">Modified</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-line even:bg-panel-alt/60"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-navy">
                          {report.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">{report.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-navy">
                        {report.category}
                      </span>
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
                          statusClasses[report.status] ??
                          "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right text-sm font-semibold text-navy">
                      Edit • Preview • Delete
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-line bg-panel-alt p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] text-navy">
        {value}
      </p>
    </div>
  );
}
