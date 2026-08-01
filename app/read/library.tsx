'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookCard } from '@ds/components/kid/BookCard.jsx';
import { compareTitles } from '@/lib/util/sort-title';

export interface ShelfBook {
  id: string;
  title: string;
  kind: 'quick' | 'chapter';
  coverEmoji: string | null;
  coverBg: string | null;
  coverImage?: string | null;
  /** ISO timestamp — used for "date added" sorting. */
  createdAt: string | null;
  progress: number;
}

type SortMode = 'title-asc' | 'title-desc' | 'added-new' | 'added-old';
type ViewMode = 'grid' | 'list';

const SORT_STORAGE = 'lf-library-sort';
const VIEW_STORAGE = 'lf-library-view';

const SORT_LABELS: Record<SortMode, string> = {
  'title-asc': 'A → Z',
  'title-desc': 'Z → A',
  'added-new': 'Newest',
  'added-old': 'Oldest',
};

function sortBooks(books: ShelfBook[], mode: SortMode): ShelfBook[] {
  const copy = [...books];
  switch (mode) {
    case 'title-asc':
      return copy.sort((a, b) => compareTitles(a.title, b.title));
    case 'title-desc':
      return copy.sort((a, b) => compareTitles(b.title, a.title));
    case 'added-new':
      return copy.sort((a, b) => timeOf(b.createdAt) - timeOf(a.createdAt));
    case 'added-old':
      return copy.sort((a, b) => timeOf(a.createdAt) - timeOf(b.createdAt));
  }
}

function timeOf(iso: string | null): number {
  if (!iso) return 0;
  const n = Date.parse(iso);
  return Number.isNaN(n) ? 0 : n;
}

function readPref<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v && (allowed as readonly string[]).includes(v)) return v as T;
  } catch {
    /* private mode etc. */
  }
  return fallback;
}

function writePref(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function Library({ books }: { books: ShelfBook[] }) {
  // SSR pre-sorted A-Z. Client hydrates and reads persisted prefs; if the
  // preferred sort differs, the memo re-sorts before paint.
  const [sort, setSort] = useState<SortMode>('title-asc');
  const [view, setView] = useState<ViewMode>('grid');

  useEffect(() => {
    setSort(readPref<SortMode>(SORT_STORAGE, ['title-asc', 'title-desc', 'added-new', 'added-old'], 'title-asc'));
    setView(readPref<ViewMode>(VIEW_STORAGE, ['grid', 'list'], 'grid'));
  }, []);

  const sorted = useMemo(() => sortBooks(books, sort), [books, sort]);

  function chooseSort(next: SortMode) {
    setSort(next);
    writePref(SORT_STORAGE, next);
  }
  function chooseView(next: ViewMode) {
    setView(next);
    writePref(VIEW_STORAGE, next);
  }

  if (books.length === 0) {
    return <p style={{ color: 'var(--text-muted)', margin: 0 }}>Add a story from the terminal to fill the shelf.</p>;
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Controls sort={sort} view={view} onSort={chooseSort} onView={chooseView} count={sorted.length} />
      {view === 'grid' ? <GridView books={sorted} /> : <ListView books={sorted} />}
    </section>
  );
}

function Controls({
  sort,
  view,
  onSort,
  onView,
  count,
}: {
  sort: SortMode;
  view: ViewMode;
  onSort: (s: SortMode) => void;
  onView: (v: ViewMode) => void;
  count: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
        {count} {count === 1 ? 'story' : 'stories'}
      </span>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <SortDropdown value={sort} onChange={onSort} />
        <ViewToggle value={view} onChange={onView} />
      </div>
    </div>
  );
}

function SortDropdown({ value, onChange }: { value: SortMode; onChange: (v: SortMode) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-soft)' }}>
      <span>Sort</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        aria-label="Sort stories"
        style={{
          fontFamily: 'inherit',
          fontSize: 13,
          padding: '4px 10px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--paper-deep)',
          background: 'var(--wash-capsule)',
          color: 'var(--ink)',
          cursor: 'pointer',
        }}
      >
        <option value="title-asc">{SORT_LABELS['title-asc']}</option>
        <option value="title-desc">{SORT_LABELS['title-desc']}</option>
        <option value="added-new">{SORT_LABELS['added-new']}</option>
        <option value="added-old">{SORT_LABELS['added-old']}</option>
      </select>
    </label>
  );
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  const base: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: 13,
    padding: '4px 10px',
    border: '1px solid var(--paper-deep)',
    cursor: 'pointer',
    background: 'var(--wash-capsule)',
    color: 'var(--ink-soft)',
  };
  return (
    <div role="group" aria-label="View" style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        style={{
          ...base,
          background: value === 'grid' ? 'var(--action)' : base.background,
          color: value === 'grid' ? 'var(--paper)' : base.color,
          borderRight: 'none',
        }}
      >
        ▦ Grid
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        style={{
          ...base,
          background: value === 'list' ? 'var(--action)' : base.background,
          color: value === 'list' ? 'var(--paper)' : base.color,
        }}
      >
        ☰ List
      </button>
    </div>
  );
}

function GridView({ books }: { books: ShelfBook[] }) {
  return (
    <div className="lf-covers">
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          utterance={book.title}
          progress={book.progress}
          cover={book.coverImage ?? undefined}
          bg={!book.coverImage && book.coverBg && !book.coverBg.startsWith('http') ? book.coverBg : undefined}
          width="100%"
          onOpen={() => {
            window.location.href = `/read/story/${book.id}`;
          }}
        />
      ))}
    </div>
  );
}

function ListView({ books }: { books: ShelfBook[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-1)' }}>
      {books.map((book) => {
        const thumb = book.coverImage ?? undefined;
        return (
          <li key={book.id}>
            <Link
              href={`/read/story/${book.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '56px 1fr auto',
                gap: 'var(--space-3)',
                alignItems: 'center',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'inherit',
                background: 'transparent',
                transition: 'background 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--wash-panel)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-md)',
                  background: thumb
                    ? `url(${thumb}) center/cover no-repeat`
                    : book.coverBg && !book.coverBg.startsWith('http')
                      ? book.coverBg
                      : 'linear-gradient(135deg, var(--paper-deep), var(--wash-panel))',
                  boxShadow: 'var(--elev-rest)',
                }}
              />
              <span style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 17,
                    lineHeight: 1.2,
                    color: 'var(--text-strong)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {book.title}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'capitalize' }}>
                  {book.kind}
                </span>
              </span>
              <span aria-hidden style={{ color: 'var(--ink-soft)', fontSize: 18 }}>
                ›
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
