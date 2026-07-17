import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireParentSession } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { mintChildToken, CHILD_TOKEN_COOKIE, CHILD_TOKEN_TTL_DAYS } from '@/lib/auth/child-token';

// PRD D3 + D6. Parent-authed mint. Validates body via zod (no verbatim
// interpolation), verifies the child belongs to the parent's household, mints
// a token, sets it as an HttpOnly cookie on this device.
const bodySchema = z.object({
  childId: z.string().uuid(),
  deviceLabel: z.string().max(60).optional(),
});

export async function POST(request: NextRequest) {
  const parent = await requireParentSession();
  if (parent instanceof NextResponse) return parent;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: child } = await admin()
    .from('children')
    .select('id, household_id')
    .eq('id', body.data.childId)
    .maybeSingle();

  if (!child || child.household_id !== parent.householdId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

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
