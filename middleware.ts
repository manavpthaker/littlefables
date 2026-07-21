import { NextResponse, type NextRequest } from 'next/server';

// Two jobs:
//
// 1. Surface the request pathname to Server Components. The App Router does
//    not hand a layout/page its own path, so app/parent/layout.tsx reads
//    `x-pathname` to highlight the active Insights/Stories/Settings tab.
//
// 2. Parent-gate the HTML routes. When PARENT_PASSWORD is set, unauthed
//    visitors on any /parent path (except /parent/gate itself) redirect to
//    the gate. This is a first line only — every /api/parent/* route also
//    calls requireParentPassword() (CLAUDE.md rule: no route is guarded by
//    middleware alone). Middleware can't do the sha-256 comparison in the
//    Edge runtime; it only checks cookie presence and lets the API layer
//    reject with 401 if the cookie is stale (wrong hash after rotation).

const PARENT_COOKIE = 'lf_parent';
const GATE_PATH = '/parent/gate';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  const passthrough = NextResponse.next({ request: { headers: requestHeaders } });

  const gateEnabled = Boolean(process.env.PARENT_PASSWORD?.trim());
  if (!gateEnabled) return passthrough;

  const pathname = request.nextUrl.pathname;
  const isGatePage = pathname === GATE_PATH;
  const isGateApi = pathname === '/api/parent/gate';
  // API routes reject with 401 on their own (requireParentPassword) — we
  // only redirect HTML page loads here.
  const isApiRoute = pathname.startsWith('/api/');
  if (isGatePage || isGateApi || isApiRoute) return passthrough;

  const hasCookie = Boolean(request.cookies.get(PARENT_COOKIE)?.value);
  if (hasCookie) return passthrough;

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = GATE_PATH;
  gateUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  // Matches parent HTML + parent API routes. Static assets and kid routes
  // are untouched.
  matcher: ['/parent', '/parent/:path*', '/api/parent/:path*'],
};
