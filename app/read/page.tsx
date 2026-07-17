import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { ShelfGrid, type ShelfBook } from './shelf-grid';
import { ContinueBanner, type ContinueTarget } from './continue-banner';

// Kid shelf home. Server component fetches books directly via service-role +
// household scope (child-device auth was verified in the layout AND is
// re-verified here — every route/RSC that reads child data must call it).
const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

export default async function ReadHome() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const [{ data: bookRows }, { data: progressRows }] = await Promise.all([
    admin()
      .from('books')
      .select('id, title, kind, source, status, cover_emoji, cover_bg, book')
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .order('title'),
    admin()
      .from('book_progress')
      .select('book_id, chapter_idx, page_idx, updated_at')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false })
      .limit(1),
  ]);

  const books: ShelfBook[] = (bookRows ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    kind: b.kind as 'quick' | 'chapter',
    coverEmoji: b.cover_emoji,
    coverBg: b.cover_bg,
    status: b.status,
  }));

  const latestProgress = progressRows?.[0];
  const targetBook = latestProgress
    ? (bookRows ?? []).find((b) => b.id === latestProgress.book_id)
    : null;
  const continueTarget: ContinueTarget | null =
    latestProgress && targetBook
      ? {
          id: targetBook.id,
          title: targetBook.title,
          chapterCaption: chapterCaption(targetBook, latestProgress.chapter_idx),
          progress: progressFraction(targetBook, latestProgress.chapter_idx, latestProgress.page_idx),
        }
      : null;

  return (
    <main>
      <header style={{ padding: 'var(--space-4) var(--space-4) 0', display: 'grid', gap: 'var(--space-1)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: 28 }}>Your shelf</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{books.length} stories</p>
      </header>
      {continueTarget && <ContinueBanner target={continueTarget} />}
      <ShelfGrid books={books} />
    </main>
  );
}

// Ratio of pages seen so far over pages in the book. Rough, not exact — the
// design-system's progress bar renders 0–1.
function progressFraction(
  book: { book: unknown },
  chapterIdx: number,
  pageIdx: number,
): number {
  const chapters = (book.book as { chapters?: { pages?: unknown[] }[] })?.chapters ?? [];
  let seen = 0;
  let total = 0;
  chapters.forEach((c, i) => {
    const n = c.pages?.length ?? 0;
    total += n;
    if (i < chapterIdx) seen += n;
    else if (i === chapterIdx) seen += Math.min(pageIdx + 1, n);
  });
  return total > 0 ? Math.min(1, seen / total) : 0;
}

function chapterCaption(
  book: { book: unknown; kind: string },
  chapterIdx: number,
): string | undefined {
  if (book.kind !== 'chapter') return undefined;
  const chapters = (book.book as { chapters?: { title?: string }[] })?.chapters ?? [];
  const title = chapters[chapterIdx]?.title;
  return title ? `Chapter ${chapterIdx + 1} · ${title}` : undefined;
}
