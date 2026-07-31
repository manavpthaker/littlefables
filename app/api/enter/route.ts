import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';
import {
  mintChildToken,
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from '@/lib/auth/child-token';

// Auto-enter. Single-family posture: any browser landing here gets a
// child-device cookie for the household's first child and drops straight
// into /read. No parent-side click to sign a device in.
//
// If a valid cookie is already present, this is a no-op redirect. If the
// household has no children (fresh install), fall through to /parent so
// a grown-up can add one — that's the only case where the settings surface
// still shows.

export async function GET(request: NextRequest) {
  // Already signed in? Just go to the reader.
  const existing = request.cookies.get(CHILD_TOKEN_COOKIE)?.value;
  if (existing) {
    const ctx = await verifyChildToken(existing).catch(() => null);
    if (ctx) return NextResponse.redirect(new URL('/read', request.url));
    // Fall through to re-mint if the cookie is stale / revoked.
  }

  const householdId = await currentHouseholdId();
  const { data: child } = await admin()
    .from('children')
    .select('id')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) {
    // No child in the household yet — the parent surface is the only
    // useful destination. This is the rare case; every subsequent visit
    // to /api/enter after Add Child will get a cookie automatically.
    return NextResponse.redirect(new URL('/parent/settings', request.url));
  }

  const token = await mintChildToken({
    childId: child.id,
    householdId,
    deviceLabel: request.headers.get('user-agent')?.slice(0, 60) ?? undefined,
  }).catch(() => null);

  if (!token) {
    return NextResponse.redirect(new URL('/parent/settings', request.url));
  }

  const response = NextResponse.redirect(new URL('/read', request.url));
  response.cookies.set(CHILD_TOKEN_COOKIE, token.raw, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
