import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';

// Reading-session heartbeat (brief §III.5): cumulative seconds per reader
// session. greatest() semantics make outbox retries idempotent — a replayed
// older tick can never shrink the recorded time.

const bodySchema = z.object({
  sessionId: z.string().min(8).max(64),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  seconds: z.number().int().min(0).max(24 * 60 * 60),
});

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { sessionId, day, seconds } = body.data;

  const { data: existing } = await admin()
    .from('reading_sessions')
    .select('seconds')
    .eq('child_id', ctx.childId)
    .eq('session_id', sessionId)
    .maybeSingle();

  const { error } = await admin()
    .from('reading_sessions')
    .upsert(
      {
        child_id: ctx.childId,
        session_id: sessionId,
        day,
        seconds: Math.max(existing?.seconds ?? 0, seconds),
      },
      { onConflict: 'child_id,session_id' },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
