import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { loadWorldState, updateWorldState } from '@/lib/world/state';
import type { Json } from '@/types/database';

// A choice made on an interactive page (PRD A4). Appends to the world's
// choice_log so the buddy's callback greeting can reference it later.
// Kept in the world jsonb blob (last 20 choices) — no separate table.

const bodySchema = z.object({
  bookId: z.string().min(1),
  chapterIdx: z.number().int().min(0),
  label: z.string().max(80),
  summary: z.string().max(200),
});

interface ChoiceEvent {
  bookId: string;
  chapterIdx: number;
  label: string;
  summary: string;
  at: string;
}

interface WorldWithChoiceLog {
  choiceLog?: ChoiceEvent[];
}

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const world = await loadWorldState(ctx.childId);
  const current = world as typeof world & WorldWithChoiceLog;
  const log: ChoiceEvent[] = current.choiceLog ?? [];
  const next: ChoiceEvent[] = [
    { ...body.data, at: new Date().toISOString() },
    ...log,
  ].slice(0, 20);

  // Store on the world blob via a passthrough patch. The world zod schema
  // doesn't type choice_log yet — kept loose here so it survives future
  // schema tightening without a migration.
  await updateWorldState(ctx.childId, {
    latestCallback: `You chose "${body.data.label}"`,
  });
  // Also merge choice_log directly into the row (bypasses the zod parse).
  const { admin } = await import('@/lib/supabase/admin');
  await admin()
    .from('world_states')
    .update({
      data: { ...current, choiceLog: next, latestCallback: `You chose "${body.data.label}"` } as unknown as Json,
    })
    .eq('child_id', ctx.childId);

  return NextResponse.json({ ok: true, choiceLog: next });
}
