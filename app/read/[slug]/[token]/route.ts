import { NextResponse, type NextRequest } from 'next/server';
import { signInWithChildToken } from '@/lib/auth/sign-in-with-child-token';

// Readable magic-URL handler — the buyer-facing form.
//
//   https://littlefables.app/read/lantern-of-round-pond/C5Ke…
//
// The slug is purely decorative; auth is entirely by the token, and the
// same token opens every book in that household. See
// docs/commerce/delivery-flow.md for the design rationale (URLs that
// read like a book, not like an account).
//
// One collision to be careful of: `/read/story/[id]` is a real route
// (the reader's per-book page). If a well-meaning slug ever ends up as
// "story", Next.js would route the literal segment there and this
// handler never runs. We reject that slug at provisioning time in
// scripts/new-household.ts; this handler mirrors the guard defensively.

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; token: string }> },
) {
  const { slug, token } = await context.params;
  if (slug === 'story') {
    // Would never reach here (Next.js routes to /read/story/[id] first)
    // but if the framework's precedence ever changes, this fails closed.
    return NextResponse.redirect(new URL('/not-found', request.url));
  }
  return signInWithChildToken(request, token);
}
