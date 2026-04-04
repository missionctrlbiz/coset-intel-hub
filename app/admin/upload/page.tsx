import { AdminSidebar } from '@/components/admin-sidebar';
import { UploadWizard } from '@/components/upload-wizard';

export default function AdminUploadPage() {
    return (
        <div className="mx-auto flex max-w-[1600px]">
            <AdminSidebar pathname="/admin/upload" />
            <main className="min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10">
                <UploadWizard />
            </main>
        </div>
    );
}