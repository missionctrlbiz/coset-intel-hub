import { Users } from 'lucide-react';

import type { Database } from '@/lib/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

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

                profiles = (data ?? []).map((p) => ({
                    id: p.id,
                    email: p.email,
                    full_name: p.full_name,
                    role: p.role as string | null,
                    created_at: p.created_at,
                }));
            }
        } else {
            authError = true;
        }
    } catch {
        authError = true;
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Access Control</p>
                <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-0.05em] text-ink">Platform Users</h1>
                <p className="mt-3 max-w-3xl text-lg text-muted">
                    View all registered users and their access roles across the CoSET Intelligence Hub.
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
            ) : profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2rem] border border-line bg-panel py-20 text-center shadow-soft">
                    <Users className="h-10 w-10 text-muted" />
                    <p className="mt-4 text-lg font-semibold text-navy">No users found</p>
                    <p className="mt-2 text-sm text-muted">User profiles will appear here once accounts are created.</p>
                </div>
            ) : (
                <section className="overflow-hidden rounded-[2rem] border border-line bg-panel shadow-soft">
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
                </section>
            )}
        </main>
    );
}
