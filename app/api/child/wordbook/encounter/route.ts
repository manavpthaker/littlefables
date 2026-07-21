import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';

// Record a re-encounter with an already-saved word (PRD B5): the child tapped
// or replayed a kept word inside a story or the Word Book. Feeds the spaced
// scheduler's lastEncounterAt/encounterCount. Ownership is NOT granted here —
// that takes understanding at a checkpoint (word-ownership.ts).

const bodySchema = z.object({
  word: z.string().min(1).max(40),
  kind: z.enum(['tap', 'heard']),
});

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: entry } = await admin()
    .from('wordbook_entries')
    .select('id, encounter_count')
    .eq('child_id', ctx.childId)
    .ilike('word', body.data.word)
    .maybeSingle();
  // Not a kept word — nothing to track. 200 keeps the outbox quiet.
  if (!entry) return NextResponse.json({ ok: true, tracked: false });

  const { error } = await admin()
    .from('wordbook_entries')
    .update({
      encounter_count: (entry.encounter_count ?? 0) + 1,
      last_encounter_at: new Date().toISOString(),
    })
    .eq('id', entry.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, tracked: true });
}
