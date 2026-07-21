import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { deriveLayerTag, type LayerTag } from '@/lib/models/layer-tags';
import { ShelfGrid, type ShelfBook } from '../shelf-grid';

// Kid Library (redesign brief §III.2): pick a story. A cover grid of every
// book a grown-up has turned on — nothing else exists here. The link between
// parent control (shelf_enabled + status) and the child's world.

const KID_VISIBLE_STATUSES = ['complete', 'published', 'awaiting-choice'];

export default async function LibraryPage() {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) redirect('/parent');

  const [{ data: bookRows }, { data: progressRows }] = await Promise.all([
    admin()
      .from('books')
      .select('id, title, kind, status, cover_emoji, cover_bg, book, origin_note')
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .eq('shelf_enabled', true)
      .order('title'),
    admin()
      .from('book_progress')
      .select('book_id, chapter_idx, page_idx')
      .eq('child_id', ctx.childId),
  ]);

  const progressByBook = new Map<string, { chapterIdx: number; pageIdx: number }>();
  for (const p of progressRows ?? []) {
    progressByBook.set(p.book_id, { chapterIdx: p.chapter_idx, pageIdx: p.page_idx });
  }

  const books: ShelfBook[] = (bookRows ?? []).map((b) => {
    const payload = b.book as { layerTag?: LayerTag; teachingGoals?: string[]; chapters?: { pages?: unknown[] }[] } | null;
    const p = progressByBook.get(b.id);
    return {
      id: b.id,
      title: b.title,
      kind: b.kind as 'quick' | 'chapter',
      coverEmoji: b.cover_emoji,
      coverBg: b.cover_bg,
      coverImage: b.cover_bg?.startsWith('http') ? b.cover_bg : null,
      status: b.status,
      layerTag: payload?.layerTag ?? deriveLayerTag(payload?.teachingGoals ?? [], b.origin_note),
      progress: p ? progressFraction(payload, p.chapterIdx, p.pageIdx) : 0,
    };
  });

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
        padding: 'var(--space-7) var(--page-pad) var(--space-6)',
        display: 'grid',
        alignContent: 'start',
        gap: 'var(--space-5)',
        maxWidth: 720,
        marginInline: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-1)' }}>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            color: 'var(--text-muted)',
            margin: 0,
            fontSize: 'var(--text-hand)',
          }}
        >
          Your library
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            margin: 0,
            fontSize: 'var(--text-display)',
            lineHeight: 'var(--lh-display)',
            color: 'var(--text-strong)',
          }}
        >
          Pick a story
        </h1>
      </header>

      <ShelfGrid books={books} variant="grid" />
    </main>
  );
}

function progressFraction(
  payload: { chapters?: { pages?: unknown[] }[] } | null,
  chapterIdx: number,
  pageIdx: number,
): number {
  const chapters = payload?.chapters ?? [];
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
