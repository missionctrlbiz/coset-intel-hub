import { Users } from 'lucide-react';

import type { Database } from '@/lib/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type NewsletterSubscriberRow = Database['public']['Tables']['newsletter_subscribers']['Row'];

const roleClasses: Record<string, string> = {
    admin: 'bg-ember/10 text-ember',
    editor: 'bg-blue-100 text-blue-700',
    viewer: 'bg-slate-200 text-slate-600',
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default async function AdminSubscribersPage() {
    let profiles: { id: string; email: string | null; full_name: string | null; role: string | null; created_at: string | null }[] = [];
    let newsletterSubscribers: { id: string; email: string; source: string; is_active: boolean; created_at: string | null }[] = [];
    let authError = false;
    let isAdmin = false;

    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data: myProfileRaw } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
            const myProfile = myProfileRaw as ProfileRow | null;

            isAdmin = myProfile?.role === 'admin';

            if (isAdmin) {
                const { data: profilesRaw } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                const data = profilesRaw as ProfileRow[] | null;

                const { data: newsletterRaw } = await supabase
                    .from('newsletter_subscribers')
                    .select('*')
                    .order('created_at', { ascending: false });
                const newsletterData = newsletterRaw as NewsletterSubscriberRow[] | null;

                profiles = (data ?? []).map((p) => ({
                    id: p.id,
                    email: p.email,
                    full_name: p.full_name,
                    role: p.role as string | null,
                    created_at: p.created_at,
                }));

                newsletterSubscribers = (newsletterData ?? []).map((subscriber) => ({
                    id: subscriber.id,
                    email: subscriber.email,
                    source: subscriber.source,
                    is_active: subscriber.is_active,
                    created_at: subscriber.created_at,
                }));
            }
        } else {
            authError = true;
        }
    } catch {
        authError = true;
    }

    return (
        <main className="site-shell max-w-[1520px] py-10">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Access Control</p>
                <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Subscribers & Platform Users</h1>
                <p className="mt-3 max-w-3xl text-lg text-muted">
                    View newsletter subscribers alongside registered platform users and their access roles across the CoSET Intelligence Hub.
                </p>
            </div>

            {authError ? (
                <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
                    Sign in to manage platform users.
                </div>
            ) : !isAdmin ? (
                <div className="rounded-[2rem] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
                    Admin role is required to view platform users.
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.6rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Newsletter Subscribers</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{newsletterSubscribers.length}</p>
                        </div>
                        <div className="rounded-[1.6rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Active Subscribers</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{newsletterSubscribers.filter((subscriber) => subscriber.is_active).length}</p>
                        </div>
                        <div className="rounded-[1.6rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Platform Users</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{profiles.length}</p>
                        </div>
                        <div className="rounded-[1.6rem] border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Admin Accounts</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{profiles.filter((profile) => profile.role === 'admin').length}</p>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                        <div className="border-b border-line bg-panel-alt px-6 py-5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Audience List</p>
                            <h2 className="mt-2 font-display text-2xl font-bold text-navy">Newsletter Subscribers</h2>
                        </div>
                        {newsletterSubscribers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="h-10 w-10 text-muted" />
                                <p className="mt-4 text-lg font-semibold text-navy">No subscribers yet</p>
                                <p className="mt-2 text-sm text-muted">New modal signups will appear here once emails are submitted.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                        <tr>
                                            <th className="px-6 py-5">Email</th>
                                            <th className="px-6 py-5">Source</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5">Saved</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newsletterSubscribers.map((subscriber) => (
                                            <tr key={subscriber.id} className="border-t border-line even:bg-panel-alt/60">
                                                <td className="px-6 py-5 text-sm font-semibold text-navy">{subscriber.email}</td>
                                                <td className="px-6 py-5 text-sm text-muted">{subscriber.source}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${subscriber.is_active ? 'bg-teal/10 text-teal' : 'bg-slate-200 text-slate-600'}`}>
                                                        {subscriber.is_active ? 'active' : 'inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-muted">{formatDate(subscriber.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
                        <div className="border-b border-line bg-panel-alt px-6 py-5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Access Control</p>
                            <h2 className="mt-2 font-display text-2xl font-bold text-navy">Platform Users</h2>
                        </div>
                        {profiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="h-10 w-10 text-muted" />
                                <p className="mt-4 text-lg font-semibold text-navy">No users found</p>
                                <p className="mt-2 text-sm text-muted">User profiles will appear here once accounts are created.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                        <tr>
                                            <th className="px-6 py-5">Name</th>
                                            <th className="px-6 py-5">Email</th>
                                            <th className="px-6 py-5">Role</th>
                                            <th className="px-6 py-5">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {profiles.map((profile) => (
                                            <tr key={profile.id} className="border-t border-line even:bg-panel-alt/60">
                                                <td className="px-6 py-5">
                                                    <p className="font-semibold text-navy">{profile.full_name ?? '—'}</p>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-muted">{profile.email ?? '—'}</td>
                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${roleClasses[profile.role ?? 'viewer'] ?? 'bg-slate-200 text-slate-600'}`}
                                                    >
                                                        {profile.role ?? 'viewer'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-muted">{formatDate(profile.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}
