import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ReportsExplorer } from '@/components/reports-explorer';
import { getPublishedReports } from '@/lib/content';

export const revalidate = 300;

export default async function ReportsPage() {
    const reports = await getPublishedReports();
    const categoryFilters = Array.from(new Set(reports.flatMap((report) => report.category)));
    const tagFilters = Array.from(new Set(reports.flatMap((report) => report.tags)));

    return (
        <>
            <SiteHeader />
            <main className="site-shell py-12">
                <ReportsExplorer
                    initialReports={reports}
                    categoryFilters={categoryFilters}
                    tagFilters={tagFilters}
                />
            </main>
            <SiteFooter />
        </>
    );
}