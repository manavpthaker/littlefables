import { notFound, redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { bookSchema } from '@/lib/models/book';
import { toReaderBook } from '@/lib/reader/state';
import { loadChildProfile } from '@/lib/server/child-settings';
import type { ProgressRecord } from '@/lib/models/progress';
import { Reader } from './reader';

// Reader RSC. Fetches the book by id from the household scope, validates,
// hands off to the client component. Kid-visible statuses only.
const KID_VISIBLE_STATUSES = ['complete', 'published'];

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const { data } = await admin()
    .from('books')
    .select('id, book, status, cover_bg')
    .eq('id', id)
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .eq('shelf_enabled', true)
    .maybeSingle();

  if (!data?.book) notFound();

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) notFound();

  if (!parsed.data.coverImage && data.cover_bg?.startsWith('http')) {
    parsed.data.coverImage = data.cover_bg;
  }

  const { data: prog } = await admin()
    .from('book_progress')
    .select('book_id, chapter_idx, page_idx, updated_at')
    .eq('child_id', ctx.childId)
    .eq('book_id', id)
    .maybeSingle();
  const initialProgress: ProgressRecord | null = prog
    ? { bookId: prog.book_id, chapterIdx: prog.chapter_idx, pageIdx: prog.page_idx, updatedAt: prog.updated_at }
    : null;

  const profile = await loadChildProfile(ctx.childId);
  const readerBook = toReaderBook(parsed.data);

  return (
    <Reader
      book={readerBook}
      initialProgress={initialProgress}
      bedtimeWindow={profile.settings.bedtime}
    />
  );
}
