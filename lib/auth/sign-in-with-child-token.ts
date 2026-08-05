import { NextResponse, type NextRequest } from 'next/server';
import {
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from './child-token';

// Shared handler for the magic-URL entrypoints (/f/<token> legacy and
// /read/<slug>/<token> new). Verifies the raw token, and on success
// sets the child-device cookie and redirects into the reader. On
// failure returns a not-found redirect that doesn't disclose whether
// the token ever existed.

export async function signInWithChildToken(
  request: NextRequest,
  token: string,
): Promise<NextResponse> {
  const ctx = await verifyChildToken(token).catch(() => null);
  if (!ctx) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  const response = NextResponse.redirect(new URL('/read', request.url));
  response.cookies.set(CHILD_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
