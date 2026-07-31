import { NextResponse, type NextRequest } from 'next/server';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { mintChildToken, CHILD_TOKEN_COOKIE, CHILD_TOKEN_TTL_DAYS } from '@/lib/auth/child-token';

// Mint a child-device token cookie so this browser can open the reader.
// Restored after the pare-back sweep — the UI (SendToDeviceButton) survived
// but the route it called was deleted. Result: opening the site on any
// device without an existing cookie landed at /parent with no way through.
//
// Single-household mode: requireParentPassword() is an always-allow stub;
// the only auth check is that the childId maps to a real row.

const bodySchema = z.object({
  childId: z.string().uuid(),
  deviceLabel: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const gate = await requireParentPassword();
  if (gate) return gate;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: child } = await admin()
    .from('children')
    .select('id, household_id')
    .eq('id', body.data.childId)
    .maybeSingle();

  if (!child) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const token = await mintChildToken({
    childId: child.id,
    householdId: child.household_id,
    deviceLabel: body.data.deviceLabel,
  });

  const response = NextResponse.json({ deviceId: token.deviceId, expiresAt: token.expiresAt });
  response.cookies.set(CHILD_TOKEN_COOKIE, token.raw, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: CHILD_TOKEN_TTL_DAYS * 24 * 60 * 60,
  });
  return response;
}
