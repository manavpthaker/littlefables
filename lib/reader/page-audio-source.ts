'use client';

import type { TtsSource, TtsFetchResult, WordTimestamp } from './speech';
import { audioMatchesText, getCachedAudio, putCachedAudio } from './audio-cache';

// Layered page-audio source (PRD A2). Order per page fetch:
//   1. IndexedDB cache (with staleness verification against current text)
//   2. Supabase Storage public URL (mp3 + timestamps.json)
//   3. Fall through (throws) — speak() then hits device speechSynth
//
// Every layer's timestamps are re-verified against the requested page text —
// a text edit degrades gracefully to speechSynth instead of desyncing the
// word highlight (audit C4 fix).

interface Options {
  bookId: string;
  chapterIdx: number;
  pageIdx: number;
}

function publicBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL required');
  return `${base}/storage/v1/object/public/page-audio`;
}

export function pageAudioSource({ bookId, chapterIdx, pageIdx }: Options): TtsSource {
  return {
    async fetch(text: string): Promise<TtsFetchResult> {
      // --- Layer 1: IndexedDB ---
      const cached = await getCachedAudio(bookId, chapterIdx, pageIdx);
      if (cached && audioMatchesText(cached.timestamps, text)) {
        return { audio: cached.audio, mimeType: cached.mimeType, timestamps: cached.timestamps };
      }

      // --- Layer 2: Supabase Storage ---
      const base = `${publicBaseUrl()}/${bookId}/${chapterIdx}-${pageIdx}`;
      const [audioRes, tsRes] = await Promise.all([
        fetch(`${base}.mp3`),
        fetch(`${base}.timestamps.json`),
      ]);
      if (!audioRes.ok) throw new Error(`no cached audio (${audioRes.status})`);
      if (!tsRes.ok) throw new Error(`no cached timestamps (${tsRes.status})`);
      const [audio, timestamps] = await Promise.all([
        audioRes.blob(),
        tsRes.json() as Promise<WordTimestamp[]>,
      ]);
      if (!audioMatchesText(timestamps, text)) {
        throw new Error('stored audio is stale for this text');
      }

      // Warm the IndexedDB cache for next time.
      void putCachedAudio(bookId, chapterIdx, pageIdx, {
        mimeType: audio.type || 'audio/mpeg',
        audio,
        timestamps,
      });

      return { audio, mimeType: audio.type || 'audio/mpeg', timestamps };
    },
  };
}
