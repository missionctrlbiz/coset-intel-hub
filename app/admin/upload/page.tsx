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
                };
            }
        }
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <UploadWizard initialData={initialData} />
        </main>
    );
}