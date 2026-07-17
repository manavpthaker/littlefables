import type { Book } from '@/lib/models/book';

// View types for the reader. They shadow the Book model but strip fields
// that aren't needed on the client (parentGuide etc.) and add lightweight
// derived shapes StoryText wants (words[] with { w: string }).

export interface ReaderWord {
  /** display word — punctuation preserved so "wiggly," reads right */
  w: string;
  /** stem (lowercase, edge-punctuation stripped) — for star-save + timestamp match */
  stem: string;
}

export interface ReaderPage {
  text: string;
  words: ReaderWord[];
  /** starred stem from the pack — always visually highlighted */
  star?: string;
}

export interface ReaderChapter {
  title: string;
  wash?: string;
  pages: ReaderPage[];
}

export interface ReaderBook {
  id: string;
  title: string;
  kind: Book['kind'];
  chapters: ReaderChapter[];
}

/** Reader's dominant page-navigation state. */
export interface ReaderState {
  /** null = ChapterMap visible (chapter books only); number = inside that chapter */
  chapterIdx: number | null;
  pageIdx: number;
}

export type ReaderAction =
  | { type: 'enterChapter'; chapterIdx: number }
  | { type: 'exitChapter' }
  | { type: 'nextPage' }
  | { type: 'prevPage' }
  | { type: 'goToPage'; chapterIdx: number; pageIdx: number };
