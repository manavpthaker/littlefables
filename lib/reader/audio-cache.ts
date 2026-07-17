'use client';

import type { WordTimestamp } from './speech';

// IndexedDB page-audio cache. Ports the archive pattern (lib/read/speech.ts:
// azad-read DB, page-audio store). Failures degrade silently — the network
// layer above handles staleness / fetch, and the fallback layer below handles
// device speechSynth.

const DB_NAME = 'azad-read';
const DB_VERSION = 3;
const STORE = 'page-audio';

export interface CachedAudio {
  key: string;
  mimeType: string;
  audio: Blob;
  timestamps: WordTimestamp[];
}

function key(bookId: string, chapterIdx: number, pageIdx: number): string {
  return `${bookId}::${chapterIdx}::${pageIdx}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('idb open failed'));
  });
}

export async function getCachedAudio(
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
): Promise<CachedAudio | null> {
  try {
    const db = await openDb();
    return await new Promise<CachedAudio | null>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key(bookId, chapterIdx, pageIdx));
      req.onsuccess = () => resolve((req.result as CachedAudio | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function putCachedAudio(
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
  entry: Omit<CachedAudio, 'key'>,
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put({ ...entry, key: key(bookId, chapterIdx, pageIdx) });
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    /* ignore — cache failures don't affect playback */
  }
}

// ---------- Staleness verification (audit C4 fix + PRD A2) ----------
// Both cached and freshly-fetched timestamps must match the current page text
// exactly (word-by-word, edge-punctuation-stripped). A mismatch means the
// audio is for a stale text revision — fall through instead of desyncing
// the highlight.

function normWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/gi, '');
}

export function audioMatchesText(timestamps: WordTimestamp[], text: string): boolean {
  const textWords = text.split(/\s+/).map(normWord).filter(Boolean);
  const tsWords = timestamps.map((t) => normWord(t.word)).filter(Boolean);
  if (textWords.length !== tsWords.length) return false;
  for (let i = 0; i < textWords.length; i++) {
    if (textWords[i] !== tsWords[i]) return false;
  }
  return true;
}
