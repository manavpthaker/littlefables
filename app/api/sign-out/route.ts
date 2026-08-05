import { NextResponse, type NextRequest } from 'next/server';
import { CHILD_TOKEN_COOKIE } from '@/lib/auth/child-token';

// Clear the child-device cookie and bounce through /api/enter, which will
// mint a fresh cookie for the first household (Azi) — the reset button for
// when someone clicked a demo /f/<token> URL on the wrong device.
//
// Does not revoke the token server-side; the raw token stays valid until
// its TTL expires or it's revoked via child_devices.revoked_at. The point
// is only to detach *this browser* from whatever household it was on.

export async function GET(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.redirect(new URL('/api/enter', request.url));
  response.cookies.set(CHILD_TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
