import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import { loadChildProfile } from '@/lib/server/child-settings';
import type { Json } from '@/types/database';

// Start a retell (the ladder's top rung, brief §IV): creates the
// comprehension record that /retell/answer accumulates into, and returns the
// spoken prompt + the story-spine skeleton (beat texts — safe to show; they
// double as the checklist the child sees fill in).

const bodySchema = z.object({ bookId: z.string().min(1) });

const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

const DEFAULT_PROMPT = 'Can you tell me the whole story, from the very beginning?';

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const profile = await loadChildProfile(ctx.childId);
  if (!profile.settings.checksEnabled) return NextResponse.json({ skipped: true });

  const { data: bookRow } = await admin()
    .from('books')
    .select('id, title, book')
    .eq('id', body.data.bookId)
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .maybeSingle();
  if (!bookRow?.book) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) return NextResponse.json({ error: 'book_invalid' }, { status: 500 });
  const book = parsed.data;

  const prompt = book.retellPrompts[0] ?? DEFAULT_PROMPT;
  const beats = book.beats;

  const { data: record, error } = await admin()
    .from('comprehension_records')
    .insert({
      child_id: ctx.childId,
      book_id: book.id,
      chapter_idx: null,
      question: prompt,
      question_type: 'retell',
      payload: { beats, beatsHit: [] } as unknown as Json,
    })
    .select('id')
    .single();
  if (error || !record) return NextResponse.json({ error: 'record_failed' }, { status: 500 });

  return NextResponse.json({ recordId: record.id, prompt, beats });
}
