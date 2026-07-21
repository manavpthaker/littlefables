import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';

// Per-story shelf toggle (brief §III.5 Stories tab): flips books.shelf_enabled.
// Orthogonal to lifecycle status — a published book can rest off the shelf
// without being blocked. Household-scoped.

const bodySchema = z.object({
  bookId: z.string().min(1),
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  const gate = await requireParentPassword();
  if (gate) return gate;
  const householdId = await currentHouseholdId();

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data, error } = await admin()
    .from('books')
    .update({ shelf_enabled: body.data.enabled })
    .eq('id', body.data.bookId)
    .eq('household_id', householdId)
    .select('id, shelf_enabled')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, enabled: data.shelf_enabled });
}
