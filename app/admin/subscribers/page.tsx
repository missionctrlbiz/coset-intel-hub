import { Users } from 'lucide-react';

import type { Database } from '@/lib/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/clients';
import { AdminResendSyncButton } from '@/components/admin-resend-sync-button';
import { AdminPagination } from '@/components/admin-pagination';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type NewsletterSubscriberRow = Database['public']['Tables']['newsletter_subscribers']['Row'];

const SUBSCRIBERS_PAGE_SIZE = 20;
const USERS_PAGE_SIZE = 20;

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

function parsePage(raw: string | string[] | undefined): number {
    const value = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

type SearchParams = {
    subsPage?: string;
    usersPage?: string;
};

export default async function AdminSubscribersPage({
    searchParams,
}: {
    searchParams?: SearchParams;
}) {
    const subsPage = parsePage(searchParams?.subsPage);
    const usersPage = parsePage(searchParams?.usersPage);

    let profiles: {
        id: string;
        email: string | null;
        full_name: string | null;
        role: string | null;
        created_at: string | null;
    }[] = [];
    let profilesTotal = 0;

    let newsletterSubscribers: {
        id: string;
        email: string;
        source: string;
        is_active: boolean;
        created_at: string | null;
    }[] = [];
    let subscribersTotal = 0;
    let subscribersActiveTotal = 0;

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

            isAdmin = myProfile?.role === 'admin' || myProfile?.role === 'editor';

            if (isAdmin) {
                // Platform users — paginated
                const usersFrom = (usersPage - 1) * USERS_PAGE_SIZE;
                const usersTo = usersFrom + USERS_PAGE_SIZE - 1;
                const { data: profilesRaw, count: profilesCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(usersFrom, usersTo);
                const profilesData = profilesRaw as ProfileRow[] | null;
                profilesTotal = profilesCount ?? 0;
                profiles = (profilesData ?? []).map((p) => ({
                    id: p.id,
                    email: p.email,
                    full_name: p.full_name,
                    role: p.role as string | null,
                    created_at: p.created_at,
                }));

                // Newsletter subscribers — paginated
                const subsFrom = (subsPage - 1) * SUBSCRIBERS_PAGE_SIZE;
                const subsTo = subsFrom + SUBSCRIBERS_PAGE_SIZE - 1;
                const { data: newsletterRaw, count: subsCount } = await supabase
                    .from('newsletter_subscribers')
                    .select('*', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(subsFrom, subsTo);
                const newsletterData = newsletterRaw as NewsletterSubscriberRow[] | null;
                subscribersTotal = subsCount ?? 0;
                newsletterSubscribers = (newsletterData ?? []).map((subscriber) => ({
                    id: subscriber.id,
                    email: subscriber.email,
                    source: subscriber.source,
                    is_active: subscriber.is_active,
                    created_at: subscriber.created_at,
                }));

                // Active totals shown in the KPI strip — separate query for
                // accuracy regardless of which page is currently being viewed.
                const { count: activeCount } = await supabase
                    .from('newsletter_subscribers')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);
                subscribersActiveTotal = activeCount ?? 0;
            }
        } else {
            authError = true;
        }
    } catch {
        authError = true;
    }

    return (
        <main className="site-shell max-w-[1520px] py-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-3xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Access Control</p>
                    <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">
                        Subscribers & Platform Users
                    </h1>
                    <p className="mt-3 text-lg text-muted">
                        View newsletter subscribers alongside registered platform users and their access roles across the CoSET Intelligence Hub.
                    </p>
                </div>
                {isAdmin ? <AdminResendSyncButton /> : null}
            </div>

            {authError ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-soft">
                    Sign in to manage platform users.
                </div>
            ) : !isAdmin ? (
                <div className="rounded-3xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-navy shadow-soft">
                    Admin role is required to view platform users.
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Newsletter Subscribers</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{subscribersTotal}</p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Active Subscribers</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{subscribersActiveTotal}</p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Platform Users</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{profilesTotal}</p>
                        </div>
                        <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
                            <p className="text-sm text-muted">Admin Accounts</p>
                            <p className="mt-3 font-display text-4xl font-extrabold tracking-[-0.05em] text-navy">{profiles.filter((profile) => profile.role === 'admin').length}</p>
                            <p className="mt-1 text-xs text-muted">on current page</p>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-soft">
                        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line bg-panel-alt px-6 py-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Audience List</p>
                                <h2 className="mt-2 font-display text-2xl font-bold text-navy">Newsletter Subscribers</h2>
                            </div>
                            <p className="text-xs text-muted">
                                {subscribersTotal} total · {subscribersActiveTotal} active
                            </p>
                        </div>
                        {newsletterSubscribers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Users className="h-10 w-10 text-muted" />
                                <p className="mt-4 text-lg font-semibold text-navy">No subscribers yet</p>
                                <p className="mt-2 text-sm text-muted">New modal signups will appear here once emails are submitted.</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                            <tr>
                                                <th className="px-6 py-5">Email</th>
                                                <th className="hidden px-6 py-5 sm:table-cell">Source</th>
                                                <th className="px-6 py-5">Status</th>
                                                <th className="hidden px-6 py-5 md:table-cell">Saved</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newsletterSubscribers.map((subscriber) => (
                                                <tr key={subscriber.id} className="border-t border-line even:bg-panel-alt/60">
                                                    <td className="px-6 py-5 text-sm font-semibold text-navy">{subscriber.email}</td>
                                                    <td className="hidden px-6 py-5 text-sm text-muted sm:table-cell">{subscriber.source}</td>
                                                    <td className="px-6 py-5">
                                                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${subscriber.is_active ? 'bg-teal/10 text-teal' : 'bg-slate-200 text-slate-600'}`}>
                                                            {subscriber.is_active ? 'active' : 'inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-6 py-5 text-sm text-muted md:table-cell">{formatDate(subscriber.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 pb-6">
                                    <AdminPagination
                                        page={subsPage}
                                        totalCount={subscribersTotal}
                                        pageSize={SUBSCRIBERS_PAGE_SIZE}
                                        basePath="/admin/subscribers"
                                        extraParams={{ subsPage: searchParams?.subsPage, usersPage }}
                                    />
                                </div>
                            </>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-soft">
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
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-panel-alt text-xs font-bold uppercase tracking-[0.18em] text-muted">
                                            <tr>
                                                <th className="px-6 py-5">Name</th>
                                                <th className="px-6 py-5">Email</th>
                                                <th className="hidden px-6 py-5 md:table-cell">Role</th>
                                                <th className="hidden px-6 py-5 md:table-cell">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profiles.map((profile) => (
                                                <tr key={profile.id} className="border-t border-line even:bg-panel-alt/60">
                                                    <td className="px-6 py-5">
                                                        <p className="font-semibold text-navy">{profile.full_name ?? '—'}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-muted">{profile.email ?? '—'}</td>
                                                    <td className="hidden px-6 py-5 md:table-cell">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${roleClasses[profile.role ?? 'viewer'] ?? 'bg-slate-200 text-slate-600'}`}
                                                        >
                                                            {profile.role ?? 'viewer'}
                                                        </span>
                                                    </td>
                                                    <td className="hidden px-6 py-5 text-sm text-muted md:table-cell">{formatDate(profile.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 pb-6">
                                    <AdminPagination
                                        page={usersPage}
                                        totalCount={profilesTotal}
                                        pageSize={USERS_PAGE_SIZE}
                                        basePath="/admin/subscribers"
                                        extraParams={{ subsPage, usersPage: searchParams?.usersPage }}
                                    />
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}
