import { NextResponse, type NextRequest } from 'next/server';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID } from '@/lib/models/seed';

// Parent approval: flips a needs-review book to published so the child can
// see it. Audio auto-generation is intentionally deferred to a follow-up
// script (`pnpm audio:generate -- --book <id>`) — running ElevenLabs inline
// here would block the response for 30-60s.

const bodySchema = z.object({
  bookId: z.string().min(1),
  action: z.enum(['publish', 'block', 'reject']),
});

export async function POST(request: NextRequest) {
  const gate = await requireParentPassword(); if (gate) return gate;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: book } = await admin()
    .from('books')
    .select('id, status, household_id')
    .eq('id', body.data.bookId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .maybeSingle();
  if (!book) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const nextStatus =
    body.data.action === 'publish' ? 'published'
    : body.data.action === 'block' ? 'blocked'
    : 'draft';

  const { error } = await admin()
    .from('books')
    .update({ status: nextStatus })
    .eq('id', body.data.bookId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: nextStatus });
}
