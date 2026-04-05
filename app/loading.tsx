import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { HomepageSkeleton } from '@/components/loading-states';

export default function HomeLoading() {
    return (
        <>
            <SiteHeader />
            <main>
                <HomepageSkeleton />
            </main>
            <SiteFooter />
        </>
    );
}
