import { NextResponse, type NextRequest } from 'next/server';

// Surface the request pathname to Server Components. The App Router does not
// hand a layout/page its own path, so app/parent/layout.tsx reads `x-pathname`
// to exempt /parent/gate from its own auth gate. Nothing set that header (there
// was no middleware), so on the gate route the layout could not tell it WAS the
// gate, failed the auth check, and redirected /parent/gate → /parent/gate
// forever — ERR_TOO_MANY_REDIRECTS for any unauthenticated visitor. Set it here.
//
// Header-only pass-through: this does not gate anything. Auth still lives at the
// route/layout boundary (S4.1) and requireChildDevice() (D3); nothing rides on
// middleware for access control.
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
