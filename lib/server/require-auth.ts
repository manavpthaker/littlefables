import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { CHILD_TOKEN_COOKIE, verifyChildToken, type ChildContext } from '@/lib/auth/child-token';

// PRD §4.6 / AUDIT C3 / D3. Every /api/* route MUST call one of these.
// No route is protected only by middleware, and no route accepts Origin as
// a proxy for auth (audit C5).

export interface ParentContext {
  authUserId: string;
  parentId: string;
  householdId: string;
  email: string;
}

export function unauthorized(reason: string): NextResponse {
  return NextResponse.json({ error: 'unauthorized', reason }, { status: 401 });
}

export async function requireParentSession(): Promise<ParentContext | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized('no parent session');

  // The parents row may not exist yet on very first sign-in (auth callback creates it).
  const { data: parent } = await admin()
    .from('parents')
    .select('id, household_id, email')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!parent) return unauthorized('parent not provisioned');
  return {
    authUserId: user.id,
    parentId: parent.id,
    householdId: parent.household_id,
    email: parent.email,
  };
}

export async function requireChildDevice(): Promise<ChildContext | NextResponse> {
  const store = await cookies();
  const raw = store.get(CHILD_TOKEN_COOKIE)?.value;
  const ctx = await verifyChildToken(raw);
  if (!ctx) return unauthorized('no child device session');
  return ctx;
}
