import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ReportsPageSkeleton } from '@/components/loading-states';

export default function ReportsLoading() {
    return (
        <>
            <SiteHeader />
            <ReportsPageSkeleton />
            <SiteFooter />
        </>
    );
}
