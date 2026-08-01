import { NextResponse, type NextRequest } from 'next/server';

// Two jobs:
//
// 1. Surface x-pathname so RSCs know their route (used to be for the parent
//    tab highlight; harmless header, kept in case future RSCs need it).
//
// 2. Household password gate. When HOUSEHOLD_PASSWORD env is set, any
//    browser without a valid gate cookie is redirected to /gate before it
//    can reach the reader or the parent surface. Once unlocked, the cookie
//    lets the household return friction-free (30 days).
//
// Middleware only checks COOKIE PRESENCE — the actual sha256 comparison
// happens in the /api/gate handler and (defense-in-depth) in RSCs via
// isHouseholdAuthed(). Edge middleware can't easily do node:crypto.
//
// Bypass paths (always allowed through even when gated):
//   /gate            — the unlock page itself
//   /api/gate        — cookie mint
//   /share/[token]   — public share links carry their own auth
//   /api/enter       — the auto-enter route runs post-gate
//   /_next, /favicon, other Next.js internals — handled by matcher exclude

const COOKIE_NAME = 'lf_household';
const GATE_PATH = '/gate';

function isBypass(pathname: string): boolean {
  return (
    pathname === GATE_PATH ||
    pathname === '/api/gate' ||
    pathname.startsWith('/share/') ||
    pathname === '/api/share' // future: public share validation
  );
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  const passthrough = NextResponse.next({ request: { headers: requestHeaders } });

  const gateEnabled = Boolean(
    (process.env.HOUSEHOLD_PASSWORD ?? process.env.PARENT_PASSWORD)?.trim(),
  );
  if (!gateEnabled) return passthrough;

  const pathname = request.nextUrl.pathname;
  if (isBypass(pathname)) return passthrough;

  const hasCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  if (hasCookie) return passthrough;

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = GATE_PATH;
  // Preserve intended destination so /gate can bounce the user back after
  // unlock instead of dumping them at the root.
  gateUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  // Match everything except Next internals and static assets.
  matcher: [
    '/((?!_next/|favicon|assets/|images/|.*\\..*).*)',
  ],
};
