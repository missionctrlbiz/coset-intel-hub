import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/clients';

type AppRole = 'viewer' | 'editor' | 'admin';

export type AuthContext = {
  userId: string;
  role: AppRole;
};

/**
 * Verify the caller is authenticated and holds one of the required roles.
 *
 * Returns an AuthContext on success, or a NextResponse (401/403) on failure.
 * The caller must check `if (auth instanceof Response) return auth;`.
 *
 * Usage:
 *   const auth = await requireRole(['admin', 'editor']);
 *   if (auth instanceof Response) return auth;
 *   const { userId } = auth;
 */
export async function requireRole(allowedRoles: AppRole[]): Promise<AuthContext | NextResponse> {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = ((profileRow as { role?: string } | null)?.role ?? 'viewer') as AppRole;

  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { userId: user.id, role };
}
