import { SiteHeader } from '@/components/site-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-mist">
            <SiteHeader />
            {children}
        </div>
    );
}