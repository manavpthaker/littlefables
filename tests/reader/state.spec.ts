import { describe, expect, it } from 'vitest';
import {
  currentChapter,
  currentPage,
  initialState,
  isFirstPage,
  isLastPage,
  reducer,
  stemOf,
  wordsOf,
} from '@/lib/reader/state';
import type { ReaderBook, ReaderState } from '@/lib/reader/types';

const quick: ReaderBook = {
  id: 'q',
  title: 'q',
  kind: 'quick',
  vocab: {},
  chapters: [
    { title: 'q', pages: [{ text: 'a b c', words: wordsOf('a b c') }, { text: 'd e', words: wordsOf('d e') }] },
  ],
};

const chapter: ReaderBook = {
  id: 'c',
  title: 'c',
  kind: 'chapter',
  vocab: {},
  chapters: [
    { title: 'ch1', pages: [{ text: 'a b', words: wordsOf('a b') }, { text: 'c d', words: wordsOf('c d') }] },
    { title: 'ch2', pages: [{ text: 'e f', words: wordsOf('e f') }] },
  ],
};

describe('stemOf', () => {
  it('lowercases and strips edge punctuation only', () => {
    expect(stemOf('Wiggly,')).toBe('wiggly');
    expect(stemOf('!hey!')).toBe('hey');
    expect(stemOf("don't")).toBe("don't");
  });
});

describe('wordsOf', () => {
  it('splits on whitespace and computes stems', () => {
    const w = wordsOf('The Coocoo, and the Boy');
    expect(w).toHaveLength(5);
    expect(w[1]).toEqual({ w: 'Coocoo,', stem: 'coocoo' });
  });
});

describe('initialState', () => {
  it('quick books start inside chapter 0', () => {
    expect(initialState(quick)).toEqual({ chapterIdx: 0, pageIdx: 0 });
  });
  it('chapter books also start inside chapter 0 — the map moved into the menu', () => {
    expect(initialState(chapter)).toEqual({ chapterIdx: 0, pageIdx: 0 });
  });
});

describe('reducer', () => {
  it('enterChapter clamps invalid index', () => {
    const s = reducer(chapter, initialState(chapter), { type: 'enterChapter', chapterIdx: 99 });
    // Out-of-range enter is a no-op; state stays at the initial chapter 0.
    expect(s.chapterIdx).toBe(0);
  });

  it('nextPage advances within a chapter, then stops', () => {
    let s: ReaderState = { chapterIdx: 0, pageIdx: 0 };
    s = reducer(chapter, s, { type: 'nextPage' });
    expect(s.pageIdx).toBe(1);
    s = reducer(chapter, s, { type: 'nextPage' });
    expect(s.pageIdx).toBe(1); // still 1 — end of chapter, book handles what's next
  });

  it('prevPage clamps at 0', () => {
    const s = reducer(chapter, { chapterIdx: 0, pageIdx: 0 }, { type: 'prevPage' });
    expect(s.pageIdx).toBe(0);
  });

  it('exitChapter is a no-op for quick books', () => {
    const s = reducer(quick, { chapterIdx: 0, pageIdx: 1 }, { type: 'exitChapter' });
    expect(s).toEqual({ chapterIdx: 0, pageIdx: 1 });
  });

  it('exitChapter returns chapter books to the map', () => {
    const s = reducer(chapter, { chapterIdx: 1, pageIdx: 0 }, { type: 'exitChapter' });
    expect(s).toEqual({ chapterIdx: null, pageIdx: 0 });
  });
});

describe('selectors', () => {
  it('currentPage returns null only when chapterIdx is explicitly null', () => {
    // initialState now returns chapter 0 for every book, so callers need to
    // synthesize a null state to exercise the "not in a chapter" branch.
    expect(currentPage(chapter, { chapterIdx: null, pageIdx: 0 })).toBeNull();
  });
  it('currentChapter returns the picked chapter', () => {
    const s = { chapterIdx: 1, pageIdx: 0 };
    expect(currentChapter(chapter, s)?.title).toBe('ch2');
  });
  it('isLastPage detects chapter end', () => {
    expect(isLastPage(chapter, { chapterIdx: 0, pageIdx: 1 })).toBe(true);
    expect(isLastPage(chapter, { chapterIdx: 0, pageIdx: 0 })).toBe(false);
  });
  it('isFirstPage tracks pageIdx only', () => {
    expect(isFirstPage({ chapterIdx: 0, pageIdx: 0 })).toBe(true);
    expect(isFirstPage({ chapterIdx: 0, pageIdx: 1 })).toBe(false);
  });
});
