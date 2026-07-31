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

/** A stem clean enough to keep in the wordbook (Polish VI.1): letters (any
 *  script) with at most an inner apostrophe/hyphen, 2–18 chars. Guards the
 *  jar against partial-word captures and tokenizer junk. */
const WORD_BLOCKLIST = new Set([
  // function words — never collectables (parity spec IV)
  'a','an','as','at','be','by','do','go','he','if','in','is','it','me','my','no','of','on','or','so','to','up','us','we',
  'and','are','but','can','did','for','get','had','has','her','him','his','its','not','off','one','our','out','she','the','was','you',
  'that','this','then','they','them','with','were','from','have','into','said','went','when','what',
  // months + buddy/child names — story furniture, not vocabulary
  'january','february','march','april','may','june','july','august','september','october','november','december',
  'bramble','jujy','dory','miko','rocky','azi','azad',
]);

export function isKeepableWord(stem: string): boolean {
  if (stem.length < 2 || stem.length > 18) return false;
  if (WORD_BLOCKLIST.has(stem)) return false;
  return /^[\p{L}]+(?:['\u2019-][\p{L}]+)*$/u.test(stem);
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
      img: (p as { img?: string }).img,
      ask: p.ask,
      choice: p.choice,
      breathe: p.breathe,
      hotspots: p.hotspots,
    })),
  }));
  const vocab: ReaderBook['vocab'] = {};
  for (const entry of book.vocab) vocab[stemOf(entry.word)] = entry;
  const coverImage =
    book.coverImage ?? (book.coverBg?.startsWith('http') ? book.coverBg : undefined);
  return { id: book.id, title: book.title, kind: book.kind, chapters, vocab, coverImage, theme: book.theme };
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
