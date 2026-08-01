import { NextResponse, type NextRequest } from 'next/server';

// Surface the request pathname to Server Components. The App Router does not
// hand a layout/page its own path, so this sets `x-pathname` for any RSC that
// needs it. Nothing reads it today (it fed the parent tab highlight before
// multi-tab nav was removed); the header is cheap and kept for the next RSC
// that wants its own route.
//
// Header-only pass-through: this does not gate anything. Child-route auth
// lives in requireChildDevice(); nothing rides on middleware for access
// control. A household password gate lived here 2026-07-31 → 2026-08-01 —
// restore from git history at lib/server/household-gate.ts if it comes back.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Only the parent tree needs the path hint today. Matches /parent and every
  // route beneath it; leaves the kid app and static assets untouched.
  matcher: ['/parent', '/parent/:path*'],
};
