import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { loadWorldState, updateWorldState } from '@/lib/world/state';
import type { ChoiceEvent } from '@/lib/world/types';

// A choice made on an interactive page (PRD A4). Appends to the world's
// choice_log so the buddy's callback greeting can reference it later.
// Kept in the world jsonb blob (last 20 choices) — no separate table.
//
// Idempotency: the client sends a stable `choiceId` per choice; a retried
// outbox send matching an existing id is a no-op. Previously this route did
// updateWorldState + a direct admin() update, racing with itself and any
// concurrent writer. Folded into a single updateWorldState now.

const bodySchema = z.object({
  choiceId: z.string().min(6).max(64),
  bookId: z.string().min(1),
  chapterIdx: z.number().int().min(0),
  label: z.string().max(80),
  summary: z.string().max(200),
});

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const world = await loadWorldState(ctx.childId);
  const log = world.choiceLog ?? [];

  // Idempotency short-circuit: same choiceId already recorded → return the
  // current log as-is. Keeps the outbox at-least-once delivery safe.
  if (log.some((e) => e.id === body.data.choiceId)) {
    return NextResponse.json({ ok: true, choiceLog: log, idempotent: true });
  }

  const nextLog: ChoiceEvent[] = [
    {
      id: body.data.choiceId,
      bookId: body.data.bookId,
      chapterIdx: body.data.chapterIdx,
      label: body.data.label,
      summary: body.data.summary,
      at: new Date().toISOString(),
    },
    ...log,
  ].slice(0, 20);

  const next = await updateWorldState(ctx.childId, {
    latestCallback: `You chose "${body.data.label}"`,
    choiceLog: nextLog,
  });

  return NextResponse.json({ ok: true, choiceLog: next.choiceLog });
}
