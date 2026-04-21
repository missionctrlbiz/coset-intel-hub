import { MessageSquare } from 'lucide-react';

import { AdminFeedbackInbox, type FeedbackItem } from '@/components/admin-feedback-inbox';
import type { Database } from '@/lib/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type FeedbackRow = Database['public']['Tables']['hub_feedback']['Row'];

type ProfileSummary = Pick<Database['public']['Tables']['profiles']['Row'], 'email' | 'full_name' | 'role'>;

export default async function AdminFeedbackPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile: ProfileSummary | null = null;
    let feedback: FeedbackItem[] = [];
    let loadError: string | null = null;

    if (user) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('email, full_name, role')
            .eq('id', user.id)
            .maybeSingle();

        profile = (profileData as ProfileSummary | null) ?? null;

        if (profile && ['admin', 'editor'].includes(profile.role)) {
            const { data, error } = await supabase
                .from('hub_feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                loadError = error.message;
            } else {
                feedback = (data as FeedbackRow[]).map((item) => ({
                    id: item.id,
                    name: item.name,
                    email: item.email,
                    topic: item.topic,
                    message: item.message,
                    is_read: item.is_read,
                    admin_reply: item.admin_reply,
                    created_at: item.created_at,
                    read_at: item.read_at,
                    replied_at: item.replied_at,
                    updated_at: item.updated_at,
                }));
            }
        }
    }

    return (
        <main className="site-shell max-w-[1520px] py-10">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Engagement Desk</p>
                    <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Hub Feedback</h1>
                    <p className="mt-3 max-w-3xl text-lg text-muted">Review public feedback, mark items as read, save internal replies, and remove resolved submissions.</p>
                </div>
                <div className="rounded-[1.5rem] border border-line bg-panel px-5 py-4 shadow-soft">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Current Inbox</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="rounded-xl bg-ember/10 p-3 text-ember">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-display text-3xl font-extrabold tracking-[-0.04em] text-ink">{feedback.length}</p>
                            <p className="text-sm text-muted">Total feedback items</p>
                        </div>
                    </div>
                </div>
            </div>

            {!user ? (
                <section className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
                    Sign in to review public feedback.
                </section>
            ) : null}

            {user && (!profile || !['admin', 'editor'].includes(profile.role)) ? (
                <section className="rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
                    You are signed in as {profile?.email ?? user.email}, but your profile role is `{profile?.role ?? 'viewer'}`. Editor or admin role is required to manage feedback.
                </section>
            ) : null}

            {loadError ? (
                <section className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 shadow-soft">
                    Could not load feedback right now: {loadError}
                </section>
            ) : null}

            {user && profile && ['admin', 'editor'].includes(profile.role) && !loadError ? (
                <AdminFeedbackInbox initialFeedback={feedback} />
            ) : null}
        </main>
    );
}
