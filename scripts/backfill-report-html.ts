import { createClient } from '@supabase/supabase-js';

import { enhanceReportHtml } from '../lib/sanitize';

type ReportRow = {
    id: number;
    slug: string;
    title: string;
    html_content: string | null;
};

type CliOptions = {
    write: boolean;
    slug?: string;
    limit: number;
};

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        write: false,
        limit: 50,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index];

        if (value === '--write') {
            options.write = true;
            continue;
        }

        if (value === '--slug') {
            options.slug = argv[index + 1];
            index += 1;
            continue;
        }

        if (value === '--limit') {
            const parsed = Number.parseInt(argv[index + 1] ?? '', 10);
            if (Number.isFinite(parsed) && parsed > 0) {
                options.limit = parsed;
            }
            index += 1;
        }
    }

    return options;
}

function getRequiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing ${name} environment variable.`);
    }

    return value;
}

function summarizeDiff(before: string, after: string) {
    const repairedAnchors = (before.match(/href=(['"])#\1/g) ?? []).length - (after.match(/href=(['"])#\1/g) ?? []).length;
    const addedIds = (after.match(/<h[2-4][^>]*\sid=/g) ?? []).length - (before.match(/<h[2-4][^>]*\sid=/g) ?? []).length;
    const tocBlocks = (after.match(/data-report-toc=/g) ?? []).length - (before.match(/data-report-toc=/g) ?? []).length;

    return { repairedAnchors, addedIds, tocBlocks };
}

async function run() {
    const options = parseArgs(process.argv.slice(2));
    const supabaseUrl = getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    let query = supabase
        .from('reports')
        .select('id, slug, title, html_content')
        .not('html_content', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(options.limit);

    if (options.slug) {
        query = query.eq('slug', options.slug);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    const reports = (data ?? []) as ReportRow[];
    if (reports.length === 0) {
        console.log('No reports matched the requested filters.');
        return;
    }

    let changedCount = 0;

    for (const report of reports) {
        const currentHtml = report.html_content ?? '';
        const enhancedHtml = enhanceReportHtml(currentHtml);

        if (enhancedHtml === currentHtml) {
            console.log(`SKIP ${report.slug} - no structural changes needed.`);
            continue;
        }

        changedCount += 1;
        const summary = summarizeDiff(currentHtml, enhancedHtml);

        console.log(
            `${options.write ? 'WRITE' : 'DRY'} ${report.slug} - anchors fixed: ${summary.repairedAnchors}, heading ids added: ${summary.addedIds}, toc blocks normalized: ${summary.tocBlocks}`
        );

        if (!options.write) {
            continue;
        }

        const { error: updateError } = await supabase
            .from('reports')
            .update({
                html_content: enhancedHtml,
                updated_at: new Date().toISOString(),
            })
            .eq('id', report.id);

        if (updateError) {
            throw new Error(`Failed to update ${report.slug}: ${updateError.message}`);
        }
    }

    console.log(
        options.write
            ? `Backfill complete. Updated ${changedCount} report(s).`
            : `Dry run complete. ${changedCount} report(s) would be updated. Re-run with --write to persist changes.`
    );
}

run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});