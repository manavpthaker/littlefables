import { NextResponse } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { loadWorldState } from '@/lib/world/state';
import { loadEarnedBadges } from '@/lib/world/badges';
import { isoToWeekIdx, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';
import type { WorldBundle } from '@/lib/world/types';

// One-shot Home data. Called by the client Home once at mount.
export async function GET() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const week = weekWindowUtc();
  const [world, badges, readingDayRows, recentWordsRows, recentBooksRows] = await Promise.all([
    loadWorldState(ctx.childId),
    loadEarnedBadges(ctx.childId),
    admin()
      .from('reading_days')
      .select('day')
      .eq('child_id', ctx.childId)
      .in('day', week),
    admin()
      .from('wordbook_entries')
      .select('word, saved_at')
      .eq('child_id', ctx.childId)
      .order('saved_at', { ascending: false })
      .limit(5),
    admin()
      .from('book_progress')
      .select('book_id, updated_at, books!inner(id, title)')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false })
      .limit(3),
  ]);

  const readingDays: string[] = (readingDayRows.data ?? []).map((r) => r.day);
  const today = todayIsoUtc();
  const todayIdx = isoToWeekIdx(today);
  const todayEarned = readingDays.includes(today);

  const bundle: WorldBundle = {
    world,
    readingDays,
    todayEarned,
    todayIdx,
    badges,
    recentWords: (recentWordsRows.data ?? []).map((r) => ({ word: r.word, savedAt: r.saved_at })),
    recentBooks: ((recentBooksRows.data ?? []) as Array<{
      book_id: string;
      books: { id: string; title: string } | { id: string; title: string }[] | null;
    }>).map((r) => {
      const book = Array.isArray(r.books) ? r.books[0] : r.books;
      return { id: book?.id ?? r.book_id, title: book?.title ?? '' };
    }),
  };

  return NextResponse.json(bundle);
}
