import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { getParentSession } from '@/lib/server/parent-session';
import {
  mintChildToken,
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from '@/lib/auth/child-token';

// Auto-enter. Three cases:
//
// 1. Valid child-device cookie → straight to /read. Kid iPad has been
//    provisioned; no re-auth needed.
// 2. No child cookie but valid parent session → mint a fresh child
//    cookie for the first child of the parent's household, then /read.
//    Covers the "parent logs in on a new device and hands it over."
// 3. Neither → /login. The old auto-mint-off-first-household behavior
//    is gone; there is no anonymous entry into a specific household
//    anymore. Buyer/gift arrivals go through /f/<token> or /gift/<code>.
//
// Root / currently redirects here. In phase B it will render a landing
// page instead, and this route only fires from explicit "open the reader"
// links.

export async function GET(request: NextRequest) {
  const existing = request.cookies.get(CHILD_TOKEN_COOKIE)?.value;
  if (existing) {
    const ctx = await verifyChildToken(existing).catch(() => null);
    if (ctx) return NextResponse.redirect(new URL('/read', request.url));
    // Stale/revoked — fall through and try parent session.
  }

  const session = await getParentSession();
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: child } = await admin()
    .from('children')
    .select('id')
    .eq('household_id', session.householdId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) {
    // Logged-in parent with no children yet — send them to add one.
    return NextResponse.redirect(new URL('/parent/settings', request.url));
  }

  const token = await mintChildToken({
    childId: child.id,
    householdId: session.householdId,
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
