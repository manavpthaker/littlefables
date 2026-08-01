import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  householdCookieMaxAge,
  householdCookieName,
  householdCookieValue,
  isHouseholdGateEnabled,
  verifyHouseholdPassword,
} from '@/lib/server/household-gate';

// Household unlock. POST { password } → sets the httpOnly cookie middleware
// checks. DELETE clears it (parent sign-out on a shared browser).

const bodySchema = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: NextRequest) {
  if (!isHouseholdGateEnabled()) {
    return NextResponse.json({ error: 'gate_disabled' }, { status: 400 });
  }
  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const result = verifyHouseholdPassword(body.data.password);
  if (!result.ok) return NextResponse.json({ error: 'wrong_password' }, { status: 401 });

  const value = householdCookieValue();
  if (!value) return NextResponse.json({ error: 'gate_disabled' }, { status: 400 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(householdCookieName(), value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: householdCookieMaxAge(),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(householdCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return res;
}
