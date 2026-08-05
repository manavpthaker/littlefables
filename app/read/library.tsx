'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookCard } from '@ds/components/kid/BookCard.jsx';
import { compareTitles } from '@/lib/util/sort-title';
import { GridView, ListView, SingleView } from './library-views';

export interface ShelfBook {
  id: string;
  title: string;
  /** Author credit from the book folder — "Papa", a grandparent's name. */
  byLine?: string | null;
  kind: 'quick' | 'chapter';
  coverEmoji: string | null;
  coverBg: string | null;
  coverImage?: string | null;
  /** ISO timestamp — used for "date added" sorting. */
  createdAt: string | null;
  /** ISO timestamp of the last time this book's progress was updated —
   *  used to populate the "Recently opened" ribbon. */
  lastOpenedAt?: string | null;
  progress: number;
}

type SortMode = 'title-asc' | 'title-desc' | 'added-new' | 'added-old';
type ViewMode = 'single' | 'grid' | 'list';

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

function timeOf(iso: string | null | undefined): number {
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

/** Normalize for search: lowercase, strip diacritics, strip punctuation. */
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function Library({ books }: { books: ShelfBook[] }) {
  const [sort, setSort] = useState<SortMode>('title-asc');
  const [view, setView] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setSort(readPref<SortMode>(SORT_STORAGE, ['title-asc', 'title-desc', 'added-new', 'added-old'], 'title-asc'));
    setView(readPref<ViewMode>(VIEW_STORAGE, ['single', 'grid', 'list'], 'grid'));
  }, []);

  const q = normalizeForSearch(query);
  const filtered = useMemo(
    () => (q ? books.filter((b) => normalizeForSearch(b.title).includes(q)) : books),
    [books, q],
  );
  const sorted = useMemo(() => sortBooks(filtered, sort), [filtered, sort]);

  // Recently opened: top 5, most-recently-touched. Only shows when we
  // have a real search-free view (otherwise the ribbon fights the
  // filtered results) and when at least 2 books have been opened.
  const recentlyOpened = useMemo(() => {
    if (q) return [];
    return [...books]
      .filter((b) => Boolean(b.lastOpenedAt))
      .sort((a, b) => timeOf(b.lastOpenedAt) - timeOf(a.lastOpenedAt))
      .slice(0, 5);
  }, [books, q]);

  function chooseSort(next: SortMode) {
    setSort(next);
    writePref(SORT_STORAGE, next);
  }
  function chooseView(next: ViewMode) {
    setView(next);
    writePref(VIEW_STORAGE, next);
  }
  function surpriseMe() {
    if (books.length === 0) return;
    const pick = books[Math.floor(Math.random() * books.length)]!;
    window.location.href = `/read/story/${pick.id}`;
  }

  if (books.length === 0) {
    return <p style={{ color: 'var(--ink-soft)', margin: 0 }}>Add a story from the terminal to fill the shelf.</p>;
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <QuickActions onSurprise={surpriseMe} query={query} onQueryChange={setQuery} />
      {recentlyOpened.length >= 2 && (
        <RecentlyOpened books={recentlyOpened} />
      )}
      <Controls sort={sort} view={view} onSort={chooseSort} onView={chooseView} count={sorted.length} query={q} />
      {sorted.length === 0 ? (
        <p style={{ color: 'var(--ink-soft)', margin: 0 }}>No stories match “{query}”.</p>
      ) : view === 'single' ? (
        <SingleView books={sorted} />
      ) : view === 'grid' ? (
        <GridView books={sorted} />
      ) : (
        <ListView books={sorted} />
      )}
    </section>
  );
}

function QuickActions({
  onSurprise,
  query,
  onQueryChange,
}: {
  onSurprise: () => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--space-2)',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'stretch',
      }}
    >
      <label style={{ position: 'relative', display: 'block' }}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--ink-soft)',
            fontSize: 16,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search stories…"
          aria-label="Search stories"
          style={{
            width: '100%',
            padding: '10px 14px 10px 36px',
            fontFamily: 'inherit',
            fontSize: 15,
            border: '1px solid var(--paper-deep)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--wash-capsule)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
          }}
        />
      </label>
      <button
        type="button"
        onClick={onSurprise}
        aria-label="Surprise me — pick a random story"
        style={{
          padding: '10px 16px',
          background: 'var(--oxblood)',
          color: 'var(--paper)',
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden>🎲</span> Surprise
      </button>
    </div>
  );
}

function RecentlyOpened({ books }: { books: ShelfBook[] }) {
  return (
    <section
      aria-label="Recently opened stories"
      style={{ display: 'grid', gap: 'var(--space-2)' }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: 'var(--brass)',
        }}
      >
        Recently opened
      </h2>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {books.map((b) => (
          <li
            key={b.id}
            style={{ scrollSnapAlign: 'start', flex: '0 0 auto', width: 120 }}
          >
            <BookCard
              title={b.title}
              utterance={b.title}
              progress={b.progress}
              coverSrc={b.coverImage ?? undefined}
              coverAlt={b.title}
              onOpen={() => {
                window.location.href = `/read/story/${b.id}`;
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Controls({
  sort,
  view,
  onSort,
  onView,
  count,
  query,
}: {
  sort: SortMode;
  view: ViewMode;
  onSort: (s: SortMode) => void;
  onView: (v: ViewMode) => void;
  count: number;
  query: string;
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
        {query ? ` matching “${query}”` : ''}
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

const VIEWS: { id: ViewMode; label: string; glyph: string }[] = [
  { id: 'single', label: 'One at a time', glyph: '❑' },
  { id: 'grid', label: 'Grid', glyph: '▦' },
  { id: 'list', label: 'List', glyph: '☰' },
];

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div
      role="group"
      aria-label="View"
      style={{ display: 'inline-flex', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}
    >
      {VIEWS.map((v, i) => {
        const on = value === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            aria-pressed={on}
            // The glyph is decorative; without a label the button announces as
            // "❑" and is unusable with a screen reader.
            aria-label={v.label}
            title={v.label}
            style={{
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '4px 10px',
              border: '1px solid var(--paper-deep)',
              borderRight: i < VIEWS.length - 1 ? 'none' : undefined,
              cursor: 'pointer',
              background: on ? 'var(--oxblood)' : 'var(--wash-capsule)',
              // --on-oxblood, not --paper: night swaps --paper to the dark
              // ground, which would paint the selected label dark on oxblood.
              color: on ? 'var(--on-oxblood)' : 'var(--ink-soft)',
            }}
          >
            {v.glyph}
          </button>
        );
      })}
    </div>
  );
}

