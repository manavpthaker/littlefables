import { NextResponse, type NextRequest } from 'next/server';

// Surface the request pathname to Server Components. The App Router does not
// hand a layout/page its own path, so app/parent/layout.tsx reads `x-pathname`
// to highlight the active Insights/Stories/Settings tab. (Historically this
// also let the layout exempt /parent/gate from the auth gate; the gate was
// removed 2026-07-21 — see lib/server/parent-gate.ts.)
//
// Header-only pass-through: this does not gate anything. Child-route auth
// lives in requireChildDevice() (D3); nothing rides on middleware for access
// control.
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
