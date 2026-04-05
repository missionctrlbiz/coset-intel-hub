import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { type BlogCard, getPublishedBlogPosts, getPublishedReports } from '@/lib/content';
import { HeroSection, FeaturedReports, LatestReports, MissionAndPhilosophy, PlanetPulse, LearnMore, FilterSidebar } from '@/components/home-sections';

export const revalidate = 300;

export default async function HomePage() {
    const reports = await getPublishedReports();
    const blogPosts: BlogCard[] = await getPublishedBlogPosts();

    const featured = reports.slice(0, 2);
    const latest = reports;
    return (
        <>
            <SiteHeader />
            <main>
                <HeroSection />

                <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
                    <FilterSidebar />
                    <div className="space-y-16">
                        <FeaturedReports featured={featured} />
                        <LatestReports latest={latest} />
                        <MissionAndPhilosophy />
                        <PlanetPulse blogPosts={blogPosts} />
                        <LearnMore />
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}