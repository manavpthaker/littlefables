import { NextResponse, type NextRequest } from 'next/server';
import {
  CHILD_TOKEN_COOKIE,
  CHILD_TOKEN_TTL_DAYS,
  verifyChildToken,
} from '@/lib/auth/child-token';
import { admin } from '@/lib/supabase/admin';

// Public sample route.
//
//   https://littlefables.app/sample → the reader, playing "The Lantern of
//   Round Pond" from the demo household. No signup, no visible token.
//
// This is the landing page's trust path: a real book in the real reader,
// handed over before purchase. The token below is the demo household's
// device token (see content/households/demo/household.yaml, which is
// already committed to the repo — this route re-uses that fact, it
// doesn't create new exposure). It can be rotated by setting
// LF_SAMPLE_TOKEN in the environment; the constant is the fallback so
// the sample works out of the box in local dev.
//
// Security posture:
//   - We only ever hand out this specific token, and only after
//     verifyChildToken confirms it still resolves to a live device row.
//   - The token grants access to exactly one household (the demo). Every
//     other buyer household has its own token; those are untouched.
//   - If the demo token is ever revoked or expires, we fail closed — the
//     visitor sees /not-found rather than an inert reader.
//
// The route also sets `lf_sample=1` so the reader knows to swap the
// end-of-book install prompt for the sample closing card.

const DEMO_TOKEN_FALLBACK = 'C5KeWk4ej5eq3Dq_A4ck7G36y4vya-tWwbvn2CyAfVs';
const DEMO_BOOK_ID = 'lantern-round-pond';

export const SAMPLE_COOKIE = 'lf_sample';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = process.env.LF_SAMPLE_TOKEN ?? DEMO_TOKEN_FALLBACK;

  const ctx = await verifyChildToken(token).catch(() => null);
  if (!ctx) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  // Fail closed if the book isn't actually on the demo shelf. Better to
  // show /not-found than to redirect a cold visitor into the reader's
  // own 404 mid-load — the visitor typed /sample, not a book URL.
  const { data: book } = await admin()
    .from('books')
    .select('id')
    .eq('id', DEMO_BOOK_ID)
    .eq('household_id', ctx.householdId)
    .in('status', ['complete', 'published'])
    .eq('shelf_enabled', true)
    .maybeSingle();
  if (!book) {
    return NextResponse.redirect(new URL('/not-found', request.url));
  }

  const response = NextResponse.redirect(
    new URL(`/read/story/${DEMO_BOOK_ID}`, request.url),
  );
  response.cookies.set(CHILD_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  response.cookies.set(SAMPLE_COOKIE, '1', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // Match the child token TTL so the sample closing card keeps firing
    // for as long as the same browser is treated as the demo device.
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
