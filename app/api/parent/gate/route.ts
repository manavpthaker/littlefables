import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  isGateEnabled,
  parentCookieName,
  parentCookieValue,
  verifyParentPassword,
} from '@/lib/server/parent-gate';

// Submit the parent password. On success, sets the httpOnly cookie that
// middleware + requireParentPassword() check. Rate-limiting is intentionally
// not attempted here — this is a single-family deployment; the deterrent is
// the password itself + the surface not being publicly linked.

const bodySchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  if (!isGateEnabled()) {
    // With no PARENT_PASSWORD set (dev), the gate is off. Report clearly
    // rather than pretending to sign the user in.
    return NextResponse.json({ error: 'gate_disabled' }, { status: 400 });
  }
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const result = verifyParentPassword(body.data.password);
  if (!result.ok) {
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }
  const value = parentCookieValue();
  if (!value) return NextResponse.json({ error: 'gate_disabled' }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(parentCookieName(), value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

// Sign out — clear the cookie.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(parentCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
