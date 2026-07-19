import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';

// Parent wordbook management (PRD A9 follow-through): remove a saved word.
// Removal is deliberately a PARENT action — the child surface is additive
// only (his words never vanish under him; a parent tidies typos/mis-taps).
// The row must belong to a child in this household (scoped delete).

const bodySchema = z.object({
  entryId: z.string().uuid(),
});

export async function DELETE(request: NextRequest) {
  const gate = await requireParentPassword();
  if (gate) return gate;
  const householdId = await currentHouseholdId();

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Scope: entry → child → this household.
  const { data: children } = await admin()
    .from('children')
    .select('id')
    .eq('household_id', householdId);
  const childIds = (children ?? []).map((c) => c.id);
  if (childIds.length === 0) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data, error } = await admin()
    .from('wordbook_entries')
    .delete()
    .eq('id', body.data.entryId)
    .in('child_id', childIds)
    .select('id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
