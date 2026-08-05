import { NextResponse, type NextRequest } from 'next/server';
import { CHILD_TOKEN_COOKIE, CHILD_TOKEN_TTL_DAYS, mintChildToken } from '@/lib/auth/child-token';
import { findRedeemableGift, markGiftRedeemed } from '@/lib/models/gift-code';

// POST /api/gift/<code>/redeem
//
// Verifies the code, mints a fresh child_devices row for the recipient's
// browser, marks the code redeemed, sets the cookie, returns the reader
// URL for the client to navigate to.
//
// Single-use by DB constraint (markGiftRedeemed's guarded UPDATE returns
// false if another tab won the race). Second attempt returns 410 Gone.

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await context.params;

  const gift = await findRedeemableGift(code);
  if (!gift) {
    return NextResponse.json({ error: 'gift not available' }, { status: 410 });
  }

  const token = await mintChildToken({
    childId: gift.row.child_id,
    householdId: gift.row.household_id,
    deviceLabel: request.headers.get('user-agent')?.slice(0, 60) ?? 'gift recipient',
  }).catch(() => null);
  if (!token) {
    return NextResponse.json({ error: 'could not open the book' }, { status: 500 });
  }

  const redeemed = await markGiftRedeemed(gift.row.id, token.deviceId);
  if (!redeemed) {
    // Another tab / retry beat us. Treat as already-redeemed.
    return NextResponse.json({ error: 'gift not available' }, { status: 410 });
  }

  // Recipient lands on the reader. The URL is /read (the shelf) — the
  // slug lives in the URL only when the buyer/parent explicitly enters
  // via /read/<slug>/<token>, not after a gift redeem.
  const response = NextResponse.json({ ok: true, redirect: '/read' });
  response.cookies.set(CHILD_TOKEN_COOKIE, token.raw, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
