import type { Book } from '@/lib/models/book';
import type {
  ReaderAction,
  ReaderBook,
  ReaderChapter,
  ReaderPage,
  ReaderState,
  ReaderWord,
} from './types';

// Pure reader state helpers. No React, no side effects. The reducer is the
// AUDIT S1 fix: the archive's 27 `useState`s in the reader page collapse to
// this + a single useReducer in the client component.

// Strip edge punctuation + lowercase for stem matching. Kept identical to the
// archive's normWord() — the pattern is what audio-cache staleness relies on.
export function stemOf(word: string): string {
  return word.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
}

/** Split page text into display words + stems. Ports the archive's split rule. */
export function wordsOf(text: string): ReaderWord[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => ({ w, stem: stemOf(w) }));
}

/** Adapt a Book (as loaded from the DB) into a ReaderBook view model. */
export function toReaderBook(book: Book): ReaderBook {
  const chapters: ReaderChapter[] = book.chapters.map((ch) => ({
    title: ch.title,
    wash: ch.wash,
    pages: ch.pages.map<ReaderPage>((p) => ({
      text: p.text,
      words: wordsOf(p.text),
      star: p.star,
      ask: p.ask,
      choice: p.choice,
      breathe: p.breathe,
    })),
  }));
  return { id: book.id, title: book.title, kind: book.kind, chapters };
}

/** Initial state per book kind: quick books enter straight into chapter 0. */
export function initialState(book: ReaderBook): ReaderState {
  return { chapterIdx: book.kind === 'quick' ? 0 : null, pageIdx: 0 };
}

export function currentChapter(book: ReaderBook, state: ReaderState): ReaderChapter | null {
  return state.chapterIdx === null ? null : (book.chapters[state.chapterIdx] ?? null);
}

export function currentPage(book: ReaderBook, state: ReaderState): ReaderPage | null {
  const ch = currentChapter(book, state);
  return ch ? (ch.pages[state.pageIdx] ?? null) : null;
}

export function isLastPage(book: ReaderBook, state: ReaderState): boolean {
  const ch = currentChapter(book, state);
  if (!ch) return false;
  return state.pageIdx >= ch.pages.length - 1;
}

export function isFirstPage(state: ReaderState): boolean {
  return state.pageIdx === 0;
}

/** Reducer. Never advances past the last page — the reader is not a nav rail;
 *  book-complete handling lives in the client component. */
export function reducer(book: ReaderBook, state: ReaderState, action: ReaderAction): ReaderState {
  switch (action.type) {
    case 'enterChapter':
      if (action.chapterIdx < 0 || action.chapterIdx >= book.chapters.length) return state;
      return { chapterIdx: action.chapterIdx, pageIdx: 0 };
    case 'exitChapter':
      if (book.kind === 'quick') return state; // quick books don't have a map to exit to
      return { chapterIdx: null, pageIdx: 0 };
    case 'nextPage': {
      const ch = currentChapter(book, state);
      if (!ch) return state;
      if (state.pageIdx < ch.pages.length - 1) {
        return { ...state, pageIdx: state.pageIdx + 1 };
      }
      return state; // book/chapter end — handled by the client component
    }
    case 'prevPage': {
      if (state.pageIdx > 0) return { ...state, pageIdx: state.pageIdx - 1 };
      return state;
    }
    case 'goToPage':
      if (action.chapterIdx < 0 || action.chapterIdx >= book.chapters.length) return state;
      return { chapterIdx: action.chapterIdx, pageIdx: Math.max(0, action.pageIdx) };
    default:
      return state;
  }
}
