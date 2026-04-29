import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { FloatingChatWidget } from '@/components/floating-chat';
import { ReportsExplorer } from '@/components/reports-explorer';
import { getPublishedReports } from '@/lib/content';

export const revalidate = 300;

export default async function ReportsPage() {
    const reports = await getPublishedReports();
    const categoryFilters = Array.from(new Set(reports.flatMap((report) => report.category)));
    const tagFilters = Array.from(new Set(reports.flatMap((report) => report.tags)));
    const topReports = reports.slice(0, 5).map((report) => ({
        title: report.title,
        slug: report.slug,
        category: report.category[0] ?? 'Published report',
    }));

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
            <FloatingChatWidget mode="general" topReports={topReports} />
        </>
    );
}