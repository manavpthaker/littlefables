import { cache } from 'react';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { admin } from '@/lib/supabase/admin';
import { publicAuth } from '@/lib/supabase/public';

// Parent session — cookie-backed Supabase Auth session.
//
// Model: parent authenticates with email OTP (see /api/parent/login/*).
// On successful verify we set two HttpOnly cookies: an access token (~1h)
// and a refresh token (~30d). requireParentSession() reads the access
// token, validates it via Supabase JWKS, resolves parents.auth_user_id
// → household_id, and returns the resolved context.
//
// Kid surface is unchanged — the child-device cookie (lf_child_token)
// coexists with these. Parent and child are two orthogonal sessions.

export const PARENT_ACCESS_COOKIE = 'lf_parent_access';
export const PARENT_REFRESH_COOKIE = 'lf_parent_refresh';
// Refresh cookie TTL — a comfortable "stays logged in for a month" window.
// The access token itself is much shorter (Supabase default ~1h) but is
// silently refreshed by getParentSession() when it expires.
const REFRESH_TTL_DAYS = 30;

export interface ParentSession {
  authUserId: string;
  parentId: string;
  parentEmail: string;
  householdId: string;
}

interface CookiePair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch seconds
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/** Set both auth cookies from a Supabase session. Called by verify-otp
 *  and on silent refresh. */
export function setParentSessionCookies(
  response: NextResponse,
  session: { access_token: string; refresh_token: string; expires_in: number | null },
): void {
  response.cookies.set(
    PARENT_ACCESS_COOKIE,
    session.access_token,
    cookieOptions(session.expires_in ?? 3600),
  );
  response.cookies.set(
    PARENT_REFRESH_COOKIE,
    session.refresh_token,
    cookieOptions(REFRESH_TTL_DAYS * 24 * 60 * 60),
  );
}

/** Clear both auth cookies. Called by logout and by getParentSession()
 *  when refresh fails. */
export function clearParentSessionCookies(response: NextResponse): void {
  response.cookies.set(PARENT_ACCESS_COOKIE, '', cookieOptions(0));
  response.cookies.set(PARENT_REFRESH_COOKIE, '', cookieOptions(0));
}

/** Read the current parent session from cookies. Returns null if no valid
 *  session (missing cookie, revoked user, no linked parent row).
 *
 *  Wrapped with React's cache() so parallel RSC callers within a single
 *  request (layout + page) share one lookup instead of two round-trips to
 *  Supabase Auth for JWT validation. Cache is per-render, not per-server.
 *
 *  Does NOT refresh — refresh happens at the route boundary so we can
 *  return the fresh cookies on the response. Callers that need refresh
 *  should use requireParentSession() from a route handler or use
 *  refreshParentSessionIfNeeded() manually. */
export const getParentSession = cache(async (): Promise<ParentSession | null> => {
  const jar = await cookies();
  const accessToken = jar.get(PARENT_ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const { data, error } = await admin().auth.getUser(accessToken);
  if (error || !data?.user) return null;

  const email = data.user.email;
  if (!email) return null;

  const { data: parent } = await admin()
    .from('parents')
    .select('id, email, household_id, auth_user_id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (!parent) return null;

  return {
    authUserId: data.user.id,
    parentId: parent.id,
    parentEmail: parent.email,
    householdId: parent.household_id,
  };
});

/** Route-handler guard. Returns the session or a NextResponse — 401 for
 *  API routes, redirect to /login for HTML routes.
 *
 *  For HTML routes call requireParentSessionForPage() below instead;
 *  it also attempts refresh. */
export async function requireParentSession(
  request: NextRequest,
): Promise<ParentSession | NextResponse> {
  const session = await getParentSession();
  if (session) return session;
  return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
}

/** Silent-refresh helper. If the access token is missing/expired but we
 *  have a refresh token, exchange it for a fresh session and re-set the
 *  cookies on `response`. Returns the refreshed ParentSession or null. */
export async function refreshParentSessionIfNeeded(
  response: NextResponse,
): Promise<ParentSession | null> {
  const jar = await cookies();
  const refreshToken = jar.get(PARENT_REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const { data, error } = await publicAuth().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    clearParentSessionCookies(response);
    return null;
  }

  setParentSessionCookies(response, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in ?? null,
  });

  const email = data.user?.email;
  if (!email) return null;

  const { data: parent } = await admin()
    .from('parents')
    .select('id, email, household_id, auth_user_id')
    .eq('auth_user_id', data.user!.id)
    .maybeSingle();

  if (!parent) return null;

  return {
    authUserId: data.user!.id,
    parentId: parent.id,
    parentEmail: parent.email,
    householdId: parent.household_id,
  };
}
