import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { PARENT_COOKIE, PARENT_COOKIE_TTL_DAYS, checkPassword } from '@/lib/server/parent-gate';

const bodySchema = z.object({ password: z.string().max(200) });

export async function POST(request: NextRequest) {
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const cookieValue = checkPassword(body.data.password);
  if (!cookieValue) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PARENT_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PARENT_COOKIE_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
