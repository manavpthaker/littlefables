import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { getParentSession } from '@/lib/server/parent-session';
import {
  mintChildToken,
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from '@/lib/auth/child-token';

// Explicit reader-entry helper. NOT invoked by visiting `/` — root is
// the landing page. This route only fires from:
// - The parent surface's "Open storytime →" link (session-authed parent
//   who wants to hand off to a kid iPad).
// - The PWA's start_url (/read) chain when the child cookie is stale.
//
// Three cases:
// 1. Valid child-device cookie → straight to /read.
// 2. No child cookie but valid parent session → mint a fresh child cookie
//    for the first child of the parent's household, then /read.
// 3. Neither → /login.
//
// Buyer/gift arrivals never come through here — they go directly through
// /f/<token> (soon /read/<slug>-<token>) or /gift/<code>.

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
