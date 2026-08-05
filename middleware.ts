import { NextResponse, type NextRequest } from 'next/server';

// Duplicated from lib/server/parent-session to keep this Edge-runtime
// module free of Node-only imports (supabase-js, node:crypto). Kept in
// sync by hand — the constant only appears in three places.
const PARENT_ACCESS_COOKIE = 'lf_parent_access';

// Two jobs:
// 1. Surface the request pathname to Server Components via x-pathname.
// 2. Gate /parent/* HTML routes: if no parent session cookie, redirect
//    to /login?next=<pathname>. This is defense-in-depth only — every
//    /api/parent/* handler AND the /parent layout re-check server-side.
//    Nothing rides on middleware alone (CLAUDE.md rule). Middleware
//    can't verify the JWT (no Node crypto in edge without setup), so
//    it only checks cookie presence — a real check happens downstream.
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const hasAccessCookie = Boolean(request.cookies.get(PARENT_ACCESS_COOKIE)?.value);
  if (!hasAccessCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Only /parent HTML routes. /api/parent/* handlers re-check server-side,
  // and the reader (/read, /f, /gift, /login, /) stays unrestricted.
  matcher: ['/parent', '/parent/:path*'],
};
