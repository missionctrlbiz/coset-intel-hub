import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { FloatingChatWidget } from '@/components/floating-chat';
import { type BlogCard, getPublishedBlogPosts, getPublishedReports } from '@/lib/content';
import { HeroCarousel, IntelSnapshot, ReportsGrid, MissionAndPhilosophy, PlanetPulse, LearnMoreCarousel, HubServices } from '@/components/home-sections';

export const revalidate = 300;

export default async function HomePage() {
    const reports = await getPublishedReports();
    const blogPosts: BlogCard[] = await getPublishedBlogPosts();

    const featured = reports.slice(0, 5);
    const topReports = reports.slice(0, 5).map((report) => ({
        title: report.title,
        slug: report.slug,
        category: report.category[0] ?? 'Published report',
    }));

    return (
        <>
            <SiteHeader />
            <main>
                <HeroCarousel featured={featured} />
                <IntelSnapshot />

                <section className="site-shell space-y-24 py-16">
                    <ReportsGrid reports={reports} />
                    <MissionAndPhilosophy />
                    <PlanetPulse blogPosts={blogPosts} />
                    <LearnMoreCarousel />
                    <HubServices />
                </section>
            </main>
            <SiteFooter />
            <FloatingChatWidget mode="general" topReports={topReports} />
        </>
    );
}
