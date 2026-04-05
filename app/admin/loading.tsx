import { AdminSidebar } from '@/components/admin-sidebar';
import { AdminDashboardSkeleton } from '@/components/loading-states';

export default function AdminLoading() {
    return (
        <div className="mx-auto flex max-w-[1600px]">
            <AdminSidebar pathname="/admin" />
            <AdminDashboardSkeleton />
        </div>
    );
}
