#!/usr/bin/env tsx
// Pre-generate ElevenLabs narration audio + word timestamps for a book, upload
// to the Supabase page-audio bucket. Adapted from the archive script; the
// output target moved from public/audio/ to Supabase Storage per PRD §4.4
// (generated assets never enter git).
//
// Usage:
//   pnpm audio:generate -- --book brambles-hello
//   pnpm audio:generate -- --book brambles-hello --check     # dry-run, no API calls
//   pnpm audio:generate -- --book brambles-hello --force     # regenerate even if bucket has a match

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { bookSchema, type Book } from '../lib/models/book';

config({ path: '.env.local' });

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}
interface ElevenLabsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment | null;
  normalized_alignment: ElevenLabsAlignment | null;
}
interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// ---------- ARGS ----------
function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function argValue(name: string): string | undefined {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

// ---------- Word-boundary derivation ----------
function charAlignmentToWords(a: ElevenLabsAlignment | null | undefined): WordTimestamp[] {
  if (!a) return [];
  const chars = a.characters;
  const starts = a.character_start_times_seconds;
  const ends = a.character_end_times_seconds;
  const words: WordTimestamp[] = [];
  let current = '';
  let currentStart = 0;
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === undefined) continue;
    if (/\s/.test(c)) {
      if (current) {
        const s = starts[i - current.length];
        const e = ends[i - 1];
        words.push({ word: current, start: s ?? 0, end: e ?? 0 });
        current = '';
      }
    } else {
      if (!current) currentStart = starts[i] ?? 0;
      current += c;
    }
  }
  if (current) {
    const e = ends[chars.length - 1];
    words.push({ word: current, start: currentStart, end: e ?? currentStart });
  }
  return words;
}

// ---------- Staleness ----------
function normWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/gi, '');
}
function timestampsMatchText(timestamps: WordTimestamp[], text: string): boolean {
  const textWords = text.split(/\s+/).map(normWord).filter(Boolean);
  const tsWords = timestamps.map((t) => normWord(t.word)).filter(Boolean);
  if (textWords.length !== tsWords.length) return false;
  for (let i = 0; i < textWords.length; i++) {
    if (textWords[i] !== tsWords[i]) return false;
  }
  return true;
}

// ---------- ElevenLabs TTS ----------
async function ttsElevenLabs(
  text: string,
  voiceId: string,
  apiKey: string,
  modelId = 'eleven_multilingual_v2',
): Promise<{ audio: Buffer; timestamps: WordTimestamp[] }> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      output_format: 'mp3_44100_128',
    }),
  });
  if (!res.ok) {
    const raw = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${raw.slice(0, 300)}`);
  }
  const data = (await res.json()) as ElevenLabsResponse;
  const audio = Buffer.from(data.audio_base64, 'base64');
  const timestamps = charAlignmentToWords(data.normalized_alignment ?? data.alignment);
  return { audio, timestamps };
}

// ---------- Storage upload / existence check ----------
async function existingTimestamps(
  client: ReturnType<typeof createClient<Database>>,
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
): Promise<WordTimestamp[] | null> {
  const tsPath = `${bookId}/${chapterIdx}-${pageIdx}.timestamps.json`;
  const { data } = await client.storage.from('page-audio').download(tsPath);
  if (!data) return null;
  try {
    const buf = await data.arrayBuffer();
    return JSON.parse(new TextDecoder().decode(buf)) as WordTimestamp[];
  } catch {
    return null;
  }
}

async function uploadPage(
  client: ReturnType<typeof createClient<Database>>,
  bookId: string,
  chapterIdx: number,
  pageIdx: number,
  audio: Buffer,
  timestamps: WordTimestamp[],
): Promise<void> {
  const base = `${bookId}/${chapterIdx}-${pageIdx}`;
  const audioRes = await client.storage.from('page-audio').upload(`${base}.mp3`, audio, {
    contentType: 'audio/mpeg',
    upsert: true,
  });
  if (audioRes.error) throw new Error(`upload mp3 failed: ${audioRes.error.message}`);
  const tsRes = await client.storage.from('page-audio').upload(
    `${base}.timestamps.json`,
    Buffer.from(JSON.stringify(timestamps), 'utf8'),
    { contentType: 'application/json', upsert: true },
  );
  if (tsRes.error) throw new Error(`upload timestamps failed: ${tsRes.error.message}`);
}

// ---------- Main ----------
async function main(): Promise<void> {
  const bookId = argValue('book');
  if (!bookId) throw new Error('--book <id> required');
  const check = argFlag('check');
  const force = argFlag('force');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.NARRATOR_VOICE_ID;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');
  if (!elevenKey || !voiceId) throw new Error('ELEVENLABS_API_KEY + NARRATOR_VOICE_ID required');

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error } = await client
    .from('books')
    .select('id, title, book')
    .eq('id', bookId)
    .single();
  if (error || !row?.book) throw new Error(`book "${bookId}" not found`);

  const parsed = bookSchema.safeParse(row.book);
  if (!parsed.success) throw new Error(`book payload invalid: ${parsed.error.message}`);
  const book: Book = parsed.data;

  let totalChars = 0;
  let generated = 0;
  let skipped = 0;
  let stale = 0;

  for (let ci = 0; ci < book.chapters.length; ci++) {
    const chapter = book.chapters[ci];
    if (!chapter) continue;
    for (let pi = 0; pi < chapter.pages.length; pi++) {
      const page = chapter.pages[pi];
      if (!page?.text) continue;
      const label = `[${book.id} ch${ci} p${pi}]`;

      const existing = force ? null : await existingTimestamps(client, book.id, ci, pi);
      if (existing && timestampsMatchText(existing, page.text)) {
        console.log(`  ↺ ${label} up-to-date, skipping`);
        skipped++;
        continue;
      }
      if (existing) {
        console.log(`  ⚠ ${label} exists but stale, will regenerate`);
        stale++;
      }
      totalChars += page.text.length;
      if (check) {
        console.log(`  ? ${label} would generate (${page.text.length} chars)`);
        generated++;
        continue;
      }
      const startedAt = Date.now();
      const { audio, timestamps } = await ttsElevenLabs(page.text, voiceId, elevenKey);
      if (!timestampsMatchText(timestamps, page.text)) {
        console.warn(`  ⚠ ${label} timestamps do not match text — uploading anyway`);
      }
      await uploadPage(client, book.id, ci, pi, audio, timestamps);
      console.log(
        `  + ${label} generated ${page.text.length} chars in ${Date.now() - startedAt}ms → ${audio.length} bytes`,
      );
      generated++;
    }
  }

  const cost = (totalChars / 1000) * 0.3;
  console.log(
    `\nDone. ${generated} generated${stale ? `, ${stale} stale` : ''}${skipped ? `, ${skipped} skipped` : ''}. ` +
      `${totalChars} chars${check ? ' (check-only)' : ` ≈ $${cost.toFixed(2)}`}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
