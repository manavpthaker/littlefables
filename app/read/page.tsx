import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { ShelfGrid, type ShelfBook } from './shelf-grid';

// Kid Home. One purpose: pick a book. If the child is mid-way through
// something, a Continue card lands first; then the full library. No streaks,
// no badges, no vocab surfaces — the whole app is one polished reader.
const KID_VISIBLE_STATUSES = ['complete', 'published'];

export default async function ReadHome() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const [{ data: bookRows }, { data: progressRows }] = await Promise.all([
    admin()
      .from('books')
      .select('id, title, kind, cover_emoji, cover_bg')
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .eq('shelf_enabled', true)
      .order('title'),
    admin()
      .from('book_progress')
      .select('book_id, chapter_idx, page_idx, updated_at')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false }),
  ]);

  const progressByBook = new Map<string, { chapterIdx: number; pageIdx: number }>();
  for (const p of progressRows ?? []) {
    if (!progressByBook.has(p.book_id)) {
      progressByBook.set(p.book_id, { chapterIdx: p.chapter_idx, pageIdx: p.page_idx });
    }
  }

  const latest = progressRows?.[0];
  const continueBook = latest ? (bookRows ?? []).find((b) => b.id === latest.book_id) : null;

  const books: ShelfBook[] = (bookRows ?? []).map((b) => ({
    id: b.id,
    title: b.title,
    kind: b.kind as 'quick' | 'chapter',
    coverEmoji: b.cover_emoji,
    coverBg: b.cover_bg,
    coverImage: b.cover_bg?.startsWith('http') ? b.cover_bg : null,
    progress: 0,
  }));

  return (
    <main
      className="lf-frame"
      style={{
        minHeight: '100dvh',
        padding: 'var(--space-6) var(--page-pad) var(--space-8)',
        display: 'grid',
        gap: 'var(--space-6)',
        alignContent: 'start',
      }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            margin: 0,
            fontSize: 'var(--text-display)',
            lineHeight: 'var(--lh-display)',
            color: 'var(--text-strong)',
          }}
        >
          Storytime
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 15 }}>
          Pick a story to read together.
        </p>
      </header>

      {continueBook && (
        <Link
          href={`/read/story/${continueBook.id}`}
          style={{
            display: 'grid',
            gap: 'var(--space-2)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--wash-panel)',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--marigold-deep)',
            }}
          >
            Keep going
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              lineHeight: 1.15,
              color: 'var(--text-strong)',
            }}
          >
            {continueBook.title}
          </span>
        </Link>
      )}

      <ShelfGrid books={books} variant="grid" />
    </main>
  );
}
