import { NextResponse, type NextRequest } from 'next/server';
import { clearParentSessionCookies } from '@/lib/server/parent-session';

// Clear the parent session cookies and bounce to /login. Does not
// revoke the Supabase session server-side; the tokens stay valid until
// their TTL. If a token leak requires hard revocation, use the Supabase
// dashboard (Auth → Users → Sign out user).

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/login', request.url));
  clearParentSessionCookies(response);
  return response;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true, redirect: '/login' });
  clearParentSessionCookies(response);
  return response;
}
