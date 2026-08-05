import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { requireChildDevice } from '@/lib/server/require-auth';
import { compareTitles } from '@/lib/util/sort-title';
import { Library, type ShelfBook } from './library';

// Kid Home. Pick a book, or keep the one in progress. Library controls
// (sort + view) live in the Library client component; the SSR default is
// title A-Z with the "The"/"A"/"An" article stripped so shelves read
// library-style, not literally.

const KID_VISIBLE_STATUSES = ['complete', 'published'];

export default async function ReadHome() {
  const ctx = await requireChildDevice();
  // No kid cookie — let /api/enter figure it out (mint if a parent
  // session exists, otherwise bounce to /login).
  if (ctx instanceof NextResponse) redirect('/api/enter');

  const [{ data: bookRows }, { data: progressRows }, { data: childRow }] = await Promise.all([
    admin()
      .from('books')
      .select('id, title, by_line, kind, cover_emoji, cover_bg, created_at')
      .eq('household_id', ctx.householdId)
      .in('status', KID_VISIBLE_STATUSES)
      .eq('shelf_enabled', true),
    admin()
      .from('book_progress')
      .select('book_id, chapter_idx, page_idx, updated_at')
      .eq('child_id', ctx.childId)
      .order('updated_at', { ascending: false }),
    admin()
      .from('children')
      .select('display_name')
      .eq('id', ctx.childId)
      .maybeSingle(),
  ]);

  const firstName = (childRow?.display_name ?? '').trim().split(/\s+/)[0] ?? '';
  const headerTitle = firstName ? `${firstName}'s Little Fables` : 'Little Fables';

  const latest = progressRows?.[0];
  const continueBook = latest ? (bookRows ?? []).find((b) => b.id === latest.book_id) : null;

  // Order books by most-recently-touched via book_progress.updated_at, so
  // the Library component can render a "Recently opened" ribbon without a
  // second fetch. Books never opened get null → sort last.
  const lastOpenedByBook = new Map<string, string>();
  for (const p of progressRows ?? []) {
    if (!lastOpenedByBook.has(p.book_id)) lastOpenedByBook.set(p.book_id, p.updated_at);
  }

  const books: ShelfBook[] = (bookRows ?? [])
    .map((b) => ({
      id: b.id,
      title: b.title,
      byLine: b.by_line,
      kind: b.kind as 'quick' | 'chapter',
      coverEmoji: b.cover_emoji,
      coverBg: b.cover_bg,
      coverImage: b.cover_bg?.startsWith('http') ? b.cover_bg : null,
      createdAt: b.created_at,
      lastOpenedAt: lastOpenedByBook.get(b.id) ?? null,
      progress: 0,
    }))
    // SSR default sort: title A-Z, article-stripped. The client component
    // re-sorts on hydration if the persisted user preference differs.
    .sort((a, b) => compareTitles(a.title, b.title));

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
            fontSize: 'var(--text-display-size)',
            lineHeight: 'var(--text-display-lh)',
            color: 'var(--ink)',
          }}
        >
          {headerTitle}
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
              color: 'var(--brass)',
            }}
          >
            Keep going
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              lineHeight: 1.15,
              color: 'var(--ink)',
            }}
          >
            {continueBook.title}
          </span>
        </Link>
      )}

      <Library books={books} />
    </main>
  );
}
