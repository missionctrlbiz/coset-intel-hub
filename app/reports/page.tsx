import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ReportsExplorer } from '@/components/reports-explorer';
import { getPublishedReports } from '@/lib/content';

export const revalidate = 300;

export default async function ReportsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
    const reports = await getPublishedReports(q);
    const categoryFilters = Array.from(new Set(reports.flatMap((report) => report.category)));
    const tagFilters = Array.from(new Set(reports.flatMap((report) => report.tags)));

    return (
        <>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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