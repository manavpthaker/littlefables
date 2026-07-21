import { notFound, redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { bookSchema } from '@/lib/models/book';
import { toReaderBook } from '@/lib/reader/state';
import { todayIsoUtc } from '@/lib/world/dates';
import { bumpGrowth, loadWorldState } from '@/lib/world/state';
import { activeBuddy } from '@/lib/world/buddy-roster';
import { loadChildProfile } from '@/lib/server/child-settings';
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
    .select('id, book, status, cover_bg')
    .eq('id', id)
    .eq('household_id', ctx.householdId)
    .in('status', KID_VISIBLE_STATUSES)
    .eq('shelf_enabled', true)
    .maybeSingle();

  if (!data?.book) notFound();

  const parsed = bookSchema.safeParse(data.book);
  if (!parsed.success) notFound();

  // Reader cover-fallback fix: the approved cover URL is written to the
  // `books.cover_bg` column, not into the jsonb `book` blob. Without this
  // hydration, `toReaderBook()` sees `book.coverImage`/`book.coverBg` empty
  // for every book except the ones seeded with an inline cover, and the
  // reader falls through to the "still being painted for you…" wash on every
  // page. Mirror the shape used by shelf and library.
  if (!parsed.data.coverImage && data.cover_bg?.startsWith('http')) {
    parsed.data.coverImage = data.cover_bg;
  }

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

  // Active buddy so the reader's companion is the child's chosen animal (its
  // emoji + pigment), consistent with Home — not a hardcoded generic blob.
  const [world, profile, { data: todaySessions }] = await Promise.all([
    loadWorldState(ctx.childId),
    loadChildProfile(ctx.childId),
    admin()
      .from('reading_sessions')
      .select('seconds')
      .eq('child_id', ctx.childId)
      .eq('day', todayIsoUtc()),
  ]);
  const buddy = activeBuddy(world.activeBuddyId);

  const readerBook = toReaderBook(parsed.data);
  return (
    <Reader
      book={readerBook}
      initialProgress={initialProgress}
      buddyEmoji={buddy.emoji}
      buddyColor={buddy.pigment}
      buddyVoiceId={buddy.voiceId}
      bedtimeWindow={profile.settings.bedtime}
      checksEnabled={profile.settings.checksEnabled}
      dailyLimitMin={profile.settings.dailyLimitMin}
      todaySeconds={(todaySessions ?? []).reduce((sum, s) => sum + (s.seconds ?? 0), 0)}
    />
  );
}
