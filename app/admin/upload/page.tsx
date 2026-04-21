import { UploadWizard } from '@/components/upload-wizard';
import { createSupabaseServerClient } from '@/lib/supabase/clients';
import { Database } from '@/lib/database.types';

type ReportRow = Database['public']['Tables']['reports']['Row'];

type InitialData = {
    id: string;
    title: string;
    summary: string;
    content: string;
    categories: string[];
    tags: string[];
    status: string;
    coverImagePath: string | null;
    sourceUrl: string | null;
};

export default async function AdminUploadPage({ searchParams }: { searchParams: { edit?: string } }) {
    let initialData: InitialData | undefined = undefined;

    if (searchParams.edit) {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data } = await supabase
                .from('reports')
                .select('*')
                .eq('slug', searchParams.edit)
                .maybeSingle();

            if (data) {
                const report = data as ReportRow;
                initialData = {
                    id: report.id,
                    title: report.title,
                    summary: report.description || '',
                    content: report.html_content || '',
                    categories: report.category || [],
                    tags: report.tags || [],
                    status: report.status || 'draft',
                    coverImagePath: report.cover_image_path || null,
                    sourceUrl: report.source_url || null,
                };
            }
        }
    }

    return (
        <main className="site-shell max-w-[1520px] py-10">
            <UploadWizard initialData={initialData} />
        </main>
    );
}