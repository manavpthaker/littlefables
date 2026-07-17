import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { mintChildToken, CHILD_TOKEN_COOKIE, CHILD_TOKEN_TTL_DAYS } from '@/lib/auth/child-token';

// Mint a child-device token. Single-household mode: no parent auth. The child
// must exist in the DB (a mint request for a random UUID returns 404). Add a
// PARENT_PASSWORD gate here before deploying to the internet.
const bodySchema = z.object({
  childId: z.string().uuid(),
  deviceLabel: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
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
