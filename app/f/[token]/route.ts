import { NextResponse, type NextRequest } from 'next/server';
import {
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from '@/lib/auth/child-token';

// Magic-URL handler for custom-order fulfillment. Buyer opens
// `https://littlefables.app/f/<token>` on their iPad; we verify the token,
// set it as the child cookie, and drop them into /read. Same auth surface
// as /api/enter, different entry: /api/enter is single-family auto-enter;
// /f/<token> is buyer-specific and comes off scripts/new-household.ts.
//
// Anyone who has the URL has access — that's the design. The buyer shares
// it with whoever they want inside their household. Tokens expire in 90
// days (CHILD_TOKEN_TTL_DAYS) and can be re-minted by re-running the
// provisioning script.

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  const ctx = await verifyChildToken(token).catch(() => null);
  if (!ctx) {
    // Bad, expired, or revoked token — send to the polite fallback page.
    // Not-found is intentional; we don't disclose whether the token existed.
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
