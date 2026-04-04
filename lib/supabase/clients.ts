import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import type { Database } from '@/lib/database.types';

function getSupabaseUrl() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
    }

    return supabaseUrl;
}

function getSupabaseAnonKey() {
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
    }

    return supabaseAnonKey;
}

export function createSupabasePublicClient() {
    return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export function createSupabaseAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
    }

    return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export function createSupabaseServerClient() {
    const cookieStore = cookies();

    return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                try {
                    const writableCookieStore = cookieStore as unknown as {
                        set: (name: string, value: string, options: CookieOptions) => void;
                    };

                    cookiesToSet.forEach(({ name, value, options }) => {
                        writableCookieStore.set(name, value, options);
                    });
                } catch {
                    // Cookie writes are ignored when called from server components.
                }
            },
        },
    });
}