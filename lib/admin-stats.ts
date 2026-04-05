import { createSupabasePublicClient, isSupabaseConfigured } from '@/lib/supabase/clients';
import { adminActivity, adminStats } from '@/lib/site-data';

export type DashboardStat = {
    label: string;
    value: string;
    delta: string;
    tone: string;
};

export type DashboardActivity = {
    title: string;
    author: string;
    status: string;
    category: string;
    modified: string;
};

export type DashboardData = {
    stats: DashboardStat[];
    activity: DashboardActivity[];
    isFallback: boolean;
};

function formatCompactNumber(value: number) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }

    if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }

    return String(value);
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return 'Unknown';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Unknown';
    }

    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export async function getDashboardData(): Promise<DashboardData> {
    if (!isSupabaseConfigured()) {
        return { stats: adminStats, activity: adminActivity, isFallback: true };
    }

    try {
        const supabase = createSupabasePublicClient();

        // Parallel queries for aggregate KPIs
        const [
            totalReportsResult,
            publishedReportsResult,
            aggregateResult,
            recentActivityResult,
            pipeline30dResult,
        ] = await Promise.all([
            // Total report count
            supabase.from('reports').select('id', { count: 'exact', head: true }),

            // Published report count
            supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'published'),

            // Sum of views & downloads across all reports
            supabase.from('reports').select('views, downloads'),

            // Latest 5 reports for the activity feed
            supabase
                .from('reports')
                .select('title, author, status, category, updated_at, published_at')
                .order('updated_at', { ascending: false })
                .limit(5),

            // Pipeline health: ingestions completed in the last 30 days
            supabase
                .from('report_ingestions')
                .select('status')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ]);

        const totalReports = totalReportsResult.count ?? 0;
        const publishedReports = publishedReportsResult.count ?? 0;

        let totalViews = 0;
        let totalDownloads = 0;

        if (aggregateResult.data) {
            for (const row of aggregateResult.data) {
                totalViews += row.views ?? 0;
                totalDownloads += row.downloads ?? 0;
            }
        }

        // Pipeline health: percentage of non-failed ingestions
        let pipelineHealth = '100%';

        if (pipeline30dResult.data && pipeline30dResult.data.length > 0) {
            const total = pipeline30dResult.data.length;
            const failed = pipeline30dResult.data.filter((r) => r.status === 'failed').length;
            const successRate = ((total - failed) / total) * 100;
            pipelineHealth = `${successRate.toFixed(1)}%`;
        }

        const stats: DashboardStat[] = [
            {
                label: 'Total Reports',
                value: formatCompactNumber(totalReports),
                delta: `${publishedReports} published`,
                tone: 'navy',
            },
            {
                label: 'Total Views',
                value: formatCompactNumber(totalViews),
                delta: 'All time',
                tone: 'teal',
            },
            {
                label: 'Total Downloads',
                value: formatCompactNumber(totalDownloads),
                delta: 'All time',
                tone: 'slate',
            },
            {
                label: 'Pipeline Health',
                value: pipelineHealth,
                delta: 'Last 30 days',
                tone: 'ember',
            },
        ];

        const activity: DashboardActivity[] = (recentActivityResult.data ?? []).map((row) => ({
            title: row.title,
            author: row.author || 'CoSET Research Lab',
            status: row.status.charAt(0).toUpperCase() + row.status.slice(1),
            category: (row.category as string[])[0] ?? 'Uncategorized',
            modified: formatDate(row.updated_at ?? row.published_at),
        }));

        return {
            stats: stats.length > 0 ? stats : adminStats,
            activity: activity.length > 0 ? activity : adminActivity,
            isFallback: false,
        };
    } catch {
        return { stats: adminStats, activity: adminActivity, isFallback: true };
    }
}
