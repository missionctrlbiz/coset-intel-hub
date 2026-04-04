import { AdminSidebar } from "@/components/admin-sidebar";
import { UploadWizard } from "@/components/upload-wizard";

export default function AdminUploadPage() {
  return (
    <div className="mx-auto flex max-w-[1600px]">
      <AdminSidebar pathname="/admin/upload" />
      <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
        <div className="mb-10 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">
            CoSET Admin
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">
            Upload report and create draft
          </h1>
          <p className="mt-3 text-lg leading-8 text-muted">
            Add a report source file, review the extracted details, and save a
            draft for the CoSET hub. This flow is designed for report ingestion
            and metadata review, not public publishing.
          </p>
        </div>

        <UploadWizard />
      </main>
    </div>
  );
}
