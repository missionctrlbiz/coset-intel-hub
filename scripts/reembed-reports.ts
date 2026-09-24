/**
 * Re-embed all reports with the current embeddings provider (AI_EMBEDDINGS_*).
 *
 * Part of the AI provider migration: vectors in report_embeddings were created
 * by the previous model and are dimension-incompatible, so every report is
 * re-chunked from its extracted text and re-embedded, replacing its rows.
 *
 * Usage (mirrors backfill-report-html.ts):
 *   npm run reports:reembed -- --dry-run          # default: report only, no writes
 *   npm run reports:reembed -- --write            # re-embed up to --limit reports
 *   npm run reports:reembed -- --write --slug my-report
 *   npm run reports:reembed -- --write --limit 500
 */
import { createClient } from '@supabase/supabase-js';

import { chunkReportText, embedTexts, EMBEDDING_DIMENSIONS, MODELS } from '../lib/ai/embed';

type ReportRow = {
    id: string;
    slug: string;
    title: string;
    html_content: string | null;
};

type IngestionRow = {
    report_id: string;
    extracted_text: string | null;
};

type CliOptions = {
    write: boolean;
    slug?: string;
    limit: number;
};

function parseArgs(argv: string[]): CliOptions {
    const options: CliOptions = {
        write: false,
        limit: 100,
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

/** Fall back to HTML-stripped content when no stored extracted text exists. */
function stripHtml(html: string) {
    return html
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function run() {
    const options = parseArgs(process.argv.slice(2));
    const supabase = createClient(getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    if (!process.env.AI_EMBEDDINGS_API_KEY && !process.env.JINA_API_KEY) {
        throw new Error('No embeddings key configured — set AI_EMBEDDINGS_API_KEY or JINA_API_KEY.');
    }

    console.log(`Embedding model: ${MODELS.embedding} (dim ${EMBEDDING_DIMENSIONS}), mode: ${options.write ? 'WRITE' : 'dry-run'}`);

    let query = supabase
        .from('reports')
        .select('id, slug, title, html_content')
        .order('updated_at', { ascending: false })
        .limit(options.limit);

    if (options.slug) {
        query = query.eq('slug', options.slug);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    // extracted_text lives on report_ingestions — take the newest per report
    const { data: ingestions, error: ingestionError } = await supabase
        .from('report_ingestions')
        .select('report_id, extracted_text')
        .order('created_at', { ascending: false });

    if (ingestionError) {
        throw new Error(`Failed to fetch report ingestions: ${ingestionError.message}`);
    }

    const extractedTextByReport = new Map<string, string>();
    for (const ingestion of (ingestions ?? []) as IngestionRow[]) {
        if (!extractedTextByReport.has(ingestion.report_id) && ingestion.extracted_text?.trim()) {
            extractedTextByReport.set(ingestion.report_id, ingestion.extracted_text);
        }
    }

    const reports = (data ?? []) as ReportRow[];
    console.log(`Found ${reports.length} report(s) to process.\n`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;
    let totalChunks = 0;

    for (const report of reports) {
        const sourceText = extractedTextByReport.get(report.id) ?? (report.html_content ? stripHtml(report.html_content) : '');

        if (!sourceText) {
            console.log(`- ${report.slug}: skipped (no extracted text or html content)`);
            skipped += 1;
            continue;
        }

        const chunks = chunkReportText(sourceText);

        if (chunks.length === 0) {
            console.log(`- ${report.slug}: skipped (no eligible chunks)`);
            skipped += 1;
            continue;
        }

        if (!options.write) {
            console.log(`- ${report.slug}: would re-embed ${chunks.length} chunk(s)`);
            totalChunks += chunks.length;
            continue;
        }

        const embeddings = await embedTexts(chunks);

        if (!embeddings) {
            console.error(`- ${report.slug}: FAILED (embedding request returned no vectors)`);
            failed += 1;
            continue;
        }

        const rows = chunks
            .map((content, index) => {
                const embedding = embeddings[index];
                return embedding ? { report_id: report.id, content, embedding } : null;
            })
            .filter(Boolean);

        const { error: deleteError } = await supabase
            .from('report_embeddings')
            .delete()
            .eq('report_id', report.id);

        if (deleteError) {
            console.error(`- ${report.slug}: FAILED to clear old rows: ${deleteError.message}`);
            failed += 1;
            continue;
        }

        const { error: insertError } = await supabase.from('report_embeddings').insert(rows);

        if (insertError) {
            console.error(`- ${report.slug}: FAILED to insert rows: ${insertError.message}`);
            failed += 1;
            continue;
        }

        console.log(`- ${report.slug}: re-embedded ${rows.length} chunk(s)`);
        updated += 1;
        totalChunks += rows.length;

        // Small pause between reports keeps free-tier rate limits happy
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\nDone. ${options.write ? 'Re-embedded' : 'Would re-embed'} ${totalChunks} chunk(s) across ${options.write ? updated : reports.length - skipped} report(s); ${skipped} skipped, ${failed} failed.`);
    if (!options.write) {
        console.log('Dry run only — rerun with --write to apply.');
    }
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
