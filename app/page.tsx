import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { type BlogCard, getPublishedBlogPosts, getPublishedReports } from '@/lib/content';
import { HeroCarousel, IntelSnapshot, ReportsGrid, MissionAndPhilosophy, PlanetPulse, LearnMoreCarousel, HubServices } from '@/components/home-sections';

export const revalidate = 300;

export default async function HomePage() {
    const reports = await getPublishedReports();
    const blogPosts: BlogCard[] = await getPublishedBlogPosts();

    const featured = reports.slice(0, 5);

    return (
        <>
            <SiteHeader />
            <main>
                <HeroCarousel featured={featured} />
                <IntelSnapshot />

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-24">
                    <ReportsGrid reports={reports} />
                    <MissionAndPhilosophy />
                    <PlanetPulse blogPosts={blogPosts} />
                    <LearnMoreCarousel />
                    <HubServices />
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
