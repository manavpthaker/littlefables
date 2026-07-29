'use client';

import type { TtsSource, TtsFetchResult, WordTimestamp } from './speech';
import { audioMatchesText, getCachedAudio, putCachedAudio } from './audio-cache';

// Layered page-audio source. Order per page fetch:
//   1. IndexedDB cache (with staleness verification against current text)
//   2. Supabase Storage public URL — voice-prefixed: {bookId}/{voice}/{ch}-{pg}.mp3
//      Falls back to legacy {bookId}/{ch}-{pg}.mp3 for older uploads.
//   3. Fall through (throws) — speak() then hits device speechSynth
//
// Every layer's timestamps are re-verified against the requested page text
// so a text edit degrades gracefully rather than desyncing the highlight.
//
// Voice mode: 'day' fetches day-voiced audio; 'night' fetches the sleepy
// cast. Night falls back to day if the sleepy voice hasn't been recorded
// for a given book yet (better to hear the day voice than silence).

type Voice = 'day' | 'night';

interface Options {
  bookId: string;
  chapterIdx: number;
  pageIdx: number;
  voice: Voice;
}

function publicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL required');
  return `${base}/storage/v1/object/public/page-audio`;
}

function cacheKey(bookId: string, voice: Voice, chapterIdx: number, pageIdx: number): {
  bookId: string;
  chapterIdx: number;
  pageIdx: number;
} {
  // Cache is keyed on bookId+chapter+page today; overload the bookId component
  // with voice so day + night stay in separate cache slots without a schema
  // migration to the IndexedDB store.
  return { bookId: `${bookId}::${voice}`, chapterIdx, pageIdx };
}

async function tryFetch(
  bookId: string,
  voice: Voice,
  chapterIdx: number,
  pageIdx: number,
  text: string,
): Promise<TtsFetchResult | null> {
  const key = cacheKey(bookId, voice, chapterIdx, pageIdx);
  const cached = await getCachedAudio(key.bookId, key.chapterIdx, key.pageIdx);
  if (cached && audioMatchesText(cached.timestamps, text)) {
    return { audio: cached.audio, mimeType: cached.mimeType, timestamps: cached.timestamps };
  }
  const base = `${publicBaseUrl()}/${bookId}/${voice}/${chapterIdx}-${pageIdx}`;
  const [audioRes, tsRes] = await Promise.all([
    fetch(`${base}.mp3`),
    fetch(`${base}.timestamps.json`),
  ]);
  if (!audioRes.ok || !tsRes.ok) return null;
  const [audio, timestamps] = await Promise.all([
    audioRes.blob(),
    tsRes.json() as Promise<WordTimestamp[]>,
  ]);
  if (!audioMatchesText(timestamps, text)) return null;
  void putCachedAudio(key.bookId, key.chapterIdx, key.pageIdx, {
    mimeType: audio.type || 'audio/mpeg',
    audio,
    timestamps,
  });
  return { audio, mimeType: audio.type || 'audio/mpeg', timestamps };
}

async function tryLegacyFetch(
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
  text: string,
): Promise<TtsFetchResult | null> {
  // Legacy layout: {bookId}/{ch}-{pg}.mp3 — no voice folder. Kept so books
  // uploaded before the Day/Night split still narrate.
  const cached = await getCachedAudio(bookId, chapterIdx, pageIdx);
  if (cached && audioMatchesText(cached.timestamps, text)) {
    return { audio: cached.audio, mimeType: cached.mimeType, timestamps: cached.timestamps };
  }
  const base = `${publicBaseUrl()}/${bookId}/${chapterIdx}-${pageIdx}`;
  const [audioRes, tsRes] = await Promise.all([
    fetch(`${base}.mp3`),
    fetch(`${base}.timestamps.json`),
  ]);
  if (!audioRes.ok || !tsRes.ok) return null;
  const [audio, timestamps] = await Promise.all([
    audioRes.blob(),
    tsRes.json() as Promise<WordTimestamp[]>,
  ]);
  if (!audioMatchesText(timestamps, text)) return null;
  return { audio, mimeType: audio.type || 'audio/mpeg', timestamps };
}

export function pageAudioSource({ bookId, chapterIdx, pageIdx, voice }: Options): TtsSource {
  return {
    async fetch(text: string): Promise<TtsFetchResult> {
      // 1. Try the requested voice.
      const primary = await tryFetch(bookId, voice, chapterIdx, pageIdx, text);
      if (primary) return primary;
      // 2. If night wasn't recorded, fall back to day so the story still plays.
      if (voice === 'night') {
        const dayFallback = await tryFetch(bookId, 'day', chapterIdx, pageIdx, text);
        if (dayFallback) return dayFallback;
      }
      // 3. Legacy path (books uploaded before the voice split).
      const legacy = await tryLegacyFetch(bookId, chapterIdx, pageIdx, text);
      if (legacy) return legacy;
      throw new Error('no cached audio available');
    },
  };
}

/** Fetch just the word timestamps for a page — cheap sidecar so the reader
 *  can pre-populate timestamps for tap-word seek without a full audio hop. */
export async function fetchPageTimestamps(
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
  pageText: string,
  voice: Voice = 'day',
): Promise<WordTimestamp[] | null> {
  const key = cacheKey(bookId, voice, chapterIdx, pageIdx);
  try {
    const cached = await getCachedAudio(key.bookId, key.chapterIdx, key.pageIdx);
    if (cached && audioMatchesText(cached.timestamps, pageText)) return cached.timestamps;
  } catch {
    /* fall through */
  }
  const attempts = [
    `${publicBaseUrl()}/${bookId}/${voice}/${chapterIdx}-${pageIdx}.timestamps.json`,
    voice === 'night'
      ? `${publicBaseUrl()}/${bookId}/day/${chapterIdx}-${pageIdx}.timestamps.json`
      : null,
    `${publicBaseUrl()}/${bookId}/${chapterIdx}-${pageIdx}.timestamps.json`,
  ].filter((u): u is string => Boolean(u));

  for (const url of attempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ts = (await res.json()) as WordTimestamp[];
      if (audioMatchesText(ts, pageText)) return ts;
    } catch {
      /* try next */
    }
  }
  return null;
}
