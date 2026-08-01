import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { loadShare, verifySharePassword } from '@/lib/server/book-shares';

// Public share-password check. Called from the share page's client form
// when the share requires a password. Success sets a per-share cookie so
// the reader can render without re-prompting on the next page turn.

const bodySchema = z.object({ password: z.string().min(1).max(200) });

const COOKIE_PREFIX = 'lf_share_';

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const share = await loadShare(token);
  if (!share) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (!share.requiresPassword || !share.passwordHash) {
    return NextResponse.json({ ok: true, alreadyOpen: true });
  }

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  if (!verifySharePassword(share.passwordHash, body.data.password)) {
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`${COOKIE_PREFIX}${share.shareId}`, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // one-week unlock per share
  });
  return res;
}

export function shareUnlockCookieName(shareId: string): string {
  return `${COOKIE_PREFIX}${shareId}`;
}
