import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { BUDDY_ROSTER, findBuddy } from '@/lib/world/buddy-roster';
import { updateWorldState } from '@/lib/world/state';

// Change the active buddy. Whitelist against the roster (audit C4 pattern —
// never trust an unvalidated identifier).
const bodySchema = z.object({
  buddyId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  if (!findBuddy(body.data.buddyId)) {
    return NextResponse.json({ error: 'unknown_buddy' }, { status: 404 });
  }

  await updateWorldState(ctx.childId, { activeBuddyId: body.data.buddyId });
  return NextResponse.json({ ok: true, roster: BUDDY_ROSTER, activeBuddyId: body.data.buddyId });
}
