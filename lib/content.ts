import type { User } from '@supabase/supabase-js';

import type { Database, Json } from '@/lib/database.types';
import { blogPosts as fallbackBlogPosts, getReportBySlug as getFallbackReportBySlug, reports as fallbackReports, type Report as SeedReport } from '@/lib/site-data';
import { createSupabasePublicClient, createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/clients';

type ReportRow = Database['public']['Tables']['reports']['Row'];
type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type BlogCard = {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    publishedAt: string;
    author: string;
    image: string;
};

export type AdminContentRow = {
    id: string;
    title: string;
    slug: string;
    category: string;
    author: string;
    modified: string;
    status: string;
};

export type AdminContentResult = {
    reports: AdminContentRow[];
    canManage: boolean;
    isFallback: boolean;
    profile: Pick<ProfileRow, 'email' | 'full_name' | 'role'> | null;
    user: User | null;
};

function formatDate(value: string | null | undefined) {
    if (!value) {
        return 'Unscheduled';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Unscheduled';
    }

    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatCompactNumber(value: number) {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }

    return String(value);
}

export function resolveImagePath(candidate: string | null | undefined, fallback: string) {
    if (!candidate) return fallback;
    if (candidate.startsWith('http') || candidate.startsWith('/')) return candidate;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) return `${supabaseUrl}/storage/v1/object/public/report-images/${candidate}`;
    return fallback;
}

function parseMetrics(input: Json): SeedReport['metrics'] {
    if (!Array.isArray(input)) {
        return [];
    }

    return input
        .map((item) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
                return null;
            }

            const label = typeof item.label === 'string' ? item.label : null;
            const value = typeof item.value === 'string' ? item.value : null;
            const note = typeof item.note === 'string' ? item.note : null;

            if (!label || !value || !note) {
                return null;
            }

            return { label, value, note };
        })
        .filter((item): item is SeedReport['metrics'][number] => item !== null);
}

function normalizeHighlights(highlights: string[]) {
    if (highlights.length > 0) {
        return highlights;
    }

    return [
        'Draft uploaded for editorial review',
        'Metadata prepared for analyst validation',
        'Additional narrative content can be added by curators',
    ];
}

function normalizeMetrics(metrics: SeedReport['metrics']) {
    if (metrics.length > 0) {
        return metrics;
    }

    return [
        { label: 'Review Status', value: 'Pending', note: 'Awaiting editorial and policy review.' },
        { label: 'Content Source', value: 'Upload', note: 'Generated from the latest uploaded source asset.' },
    ];
}

export function defaultReportImage(slug: string) {
    if (slug.includes('gas') || slug.includes('flaring')) {
        return '/community-engagement.jpg';
    }

    if (slug.includes('renewable') || slug.includes('transition')) {
        return '/CoSET-5-600x540.png';
    }

    return '/coset-eye-banner.jpg';
}

function mapReportRow(row: ReportRow): SeedReport {
    const parsedMetrics = normalizeMetrics(parseMetrics(row.metrics));
    const image = resolveImagePath(row.image_path ?? row.cover_image_path, defaultReportImage(row.slug));
    const downloadHref = row.download_file_path ? `/api/reports/${row.id}?download=1` : null;

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        category: row.category,
        tags: row.tags,
        readTime: row.read_time_minutes ? `${row.read_time_minutes} min read` : '8 min read',
        publishedAt: formatDate(row.published_at ?? row.created_at),
        author: row.author || 'CoSET Research Lab',
        views: formatCompactNumber(row.views),
        viewsCount: row.views ?? 0,
        downloads: formatCompactNumber(row.downloads),
        downloadsCount: row.downloads ?? 0,
        image,
        highlight: normalizeHighlights(row.highlight),
        quote: row.quote ?? 'This report has been added to the CoSET intelligence pipeline and is ready for editorial expansion.',
        metrics: parsedMetrics,
        html_content: row.html_content,
        downloadHref,
    };
}

function mapBlogPostRow(row: BlogPostRow): BlogCard {
    return {
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        category: row.category,
        publishedAt: formatDate(row.published_at ?? row.created_at),
        author: row.author || 'CoSET Editorial Desk',
        image: resolveImagePath(row.image_path, '/coset-eye-banner.jpg'),
    };
}

function mapFallbackBlogPosts(): BlogCard[] {
    return fallbackBlogPosts.map((post, index) => ({
        slug: `seed-blog-${index + 1}`,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        author: post.author,
        image: post.image,
    }));
}

function mapAdminReportRow(row: Pick<ReportRow, 'id' | 'slug' | 'title' | 'category' | 'author' | 'published_at' | 'updated_at' | 'status'>): AdminContentRow {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category[0] ?? 'Uncategorized',
        author: row.author || 'CoSET Research Lab',
        modified: formatDate(row.updated_at ?? row.published_at),
        status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
    };
}

function mapFallbackAdminReports(): AdminContentRow[] {
    return fallbackReports.map((report) => ({
        id: report.id,
        slug: report.slug,
        title: report.title,
        category: report.category[0] ?? 'Uncategorized',
        author: report.author,
        modified: report.publishedAt,
        status: 'Published',
    }));
}

export async function getPublishedReports(searchQuery?: string) {
    try {
        const supabase = createSupabasePublicClient();
        let query = supabase
            .from('reports')
            .select('*')
            .eq('status', 'published');

        if (searchQuery) {
            query = query.textSearch('search_vector', searchQuery, { type: 'websearch' });
        }

        const { data, error } = await query
            .order('featured', { ascending: false })
            .order('published_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return fallbackReports;
        }

        return data.map(mapReportRow);
    } catch {
        return fallbackReports;
    }
}

export async function getPublishedReportSlugs() {
    const reports = await getPublishedReports();

    return reports.map((report) => report.slug);
}

export async function getPublishedReportBySlug(slug: string) {
    try {
        const supabase = createSupabasePublicClient();
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) {
            return getFallbackReportBySlug(slug) ?? null;
        }

        return mapReportRow(data);
    } catch {
        return getFallbackReportBySlug(slug) ?? null;
    }
}

export async function getRelatedReports(slug: string, categories: string[]) {
    try {
        const supabase = createSupabasePublicClient();
        let query = supabase
            .from('reports')
            .select('*')
            .eq('status', 'published')
            .neq('slug', slug)
            .limit(3);

        if (categories && categories.length > 0) {
            query = query.overlaps('category', categories);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            return fallbackReports.filter((report) => report.slug !== slug).slice(0, 3);
        }

        return data.map(mapReportRow);
    } catch {
        return fallbackReports.filter((report) => report.slug !== slug).slice(0, 3);
    }
}

export async function getPublishedBlogPosts() {
    try {
        const supabase = createSupabasePublicClient();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('featured', { ascending: false })
            .order('published_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return mapFallbackBlogPosts();
        }

        return data.map(mapBlogPostRow);
    } catch {
        return mapFallbackBlogPosts();
    }
}

export async function getPublishedBlogPostBySlug(slug: string) {
    try {
        const supabase = createSupabasePublicClient();
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (error || !data) {
            // Find in fallback
            const fallbackIndex = parseInt(slug.replace('seed-blog-', ''), 10) - 1;
            const fallback = mapFallbackBlogPosts()[fallbackIndex];

            return fallback
                ? { ...fallback, htmlContent: `<p>${fallback.excerpt}</p><p>This is a placeholder for the seed blog post content. In a production environment, this would be replaced with the full HTML content from the Supabase database.</p>` }
                : null;
        }

        // We will map row + html_content
        return {
            ...mapBlogPostRow(data),
            htmlContent: data.html_content || '<p>No content available for this post.</p>',
        };
    } catch {
        const fallbackIndex = parseInt(slug.replace('seed-blog-', ''), 10) - 1;
        const fallback = mapFallbackBlogPosts()[fallbackIndex];
        return fallback
            ? { ...fallback, htmlContent: `<p>${fallback.excerpt}</p><p>This is a placeholder for the seed blog post content. In a production environment, this would be replaced with the full HTML content from the Supabase database.</p>` }
            : null;
    }
}

export async function getAdminContentReports(options?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
}): Promise<AdminContentResult & { totalCount: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const offset = (page - 1) * limit;

    if (!isSupabaseConfigured()) {
        const fallbacks = mapFallbackAdminReports();
        return {
            reports: fallbacks.slice(offset, offset + limit),
            totalCount: fallbacks.length,
            canManage: false,
            isFallback: true,
            profile: null,
            user: null,
        };
    }

    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            const fallbacks = mapFallbackAdminReports();
            return {
                reports: fallbacks.slice(offset, offset + limit),
                totalCount: fallbacks.length,
                canManage: false,
                isFallback: true,
                profile: null,
                user: null,
            };
        }

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        const profile = profileData as Pick<ProfileRow, 'email' | 'full_name' | 'role'> | null;

        const canManage = profile?.role === 'admin' || profile?.role === 'editor';

        let query = supabase
            .from('reports')
            .select('id, slug, title, category, author, published_at, updated_at, status', { count: 'exact' });

        if (options?.status && options.status !== 'All Status') {
            query = query.eq('status', options.status.toLowerCase());
        }

        if (options?.category && options.category !== 'All Categories') {
            query = query.contains('category', [options.category]);
        }

        if (!canManage) {
            query = query.eq('status', 'published');
        }

        const { data, error, count } = await query
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error || !data) {
            const fallbacks = mapFallbackAdminReports();
            return {
                reports: fallbacks.slice(offset, offset + limit),
                totalCount: fallbacks.length,
                canManage,
                isFallback: true,
                profile: profile ?? null,
                user,
            };
        }

        return {
            reports: data.map(mapAdminReportRow),
            totalCount: count ?? data.length,
            canManage,
            isFallback: false,
            profile: profile ?? null,
            user,
        };
    } catch {
        const fallbacks = mapFallbackAdminReports();
        return {
            reports: fallbacks.slice(offset, offset + limit),
            totalCount: fallbacks.length,
            canManage: false,
            isFallback: true,
            profile: null,
            user: null,
        };
    }
}
