import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BlogPageSkeleton } from '@/components/loading-states';

export default function BlogLoading() {
    return (
        <>
            <SiteHeader />
            <BlogPageSkeleton />
            <SiteFooter />
        </>
    );
}
