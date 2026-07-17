import { notFound, redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { bookSchema } from '@/lib/models/book';
import { toReaderBook } from '@/lib/reader/state';
import { todayIsoUtc } from '@/lib/world/dates';
import { bumpGrowth } from '@/lib/world/state';
import type { ProgressRecord } from '@/lib/models/progress';
import { Reader } from './reader';

// Reader RSC. Child-token authed. Fetches the book by id from the household
// scope, validates, adapts to ReaderBook, hands off to the client component.
// PRD F1 rule: drafts / blocked / needs-review never reach the child shelf or
// reader — the shelf query filters those out; here we treat any non-visible
// status as 404.
const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const { data } = await admin()
    .from('books')
    .select('id, book, status')
    .eq('id', id)
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .maybeSingle();

  if (!data?.book) notFound();

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) notFound();

  // Fetch existing progress so the reader can resume server-side (avoids a
  // client flicker from initial state → fetched state on mount).
  const { data: prog } = await admin()
    .from('book_progress')
    .select('book_id, chapter_idx, page_idx, updated_at')
    .eq('child_id', ctx.childId)
    .eq('book_id', id)
    .maybeSingle();
  const initialProgress: ProgressRecord | null = prog
    ? { bookId: prog.book_id, chapterIdx: prog.chapter_idx, pageIdx: prog.page_idx, updatedAt: prog.updated_at }
    : null;

  // Mark today as a reading day (PRD B3). Idempotent per (child_id, day).
  // Also bump the world's booksOpened counter — only on the first-ever open
  // for this book (checked via absence of prior progress).
  await admin()
    .from('reading_days')
    .upsert(
      { child_id: ctx.childId, day: todayIsoUtc() },
      { onConflict: 'child_id,day', ignoreDuplicates: true },
    );
  if (!prog) {
    await bumpGrowth(ctx.childId, 'booksOpened', 1);
  }

  const readerBook = toReaderBook(parsed.data);
  return <Reader book={readerBook} initialProgress={initialProgress} />;
}
