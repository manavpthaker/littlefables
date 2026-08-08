#!/usr/bin/env tsx
/**
 * Audit pre-generated narration coverage, the way the reader actually sees it.
 *
 * A page falls through to the device's robotic speech synth if EITHER the
 * MP3/timestamps are missing OR the stored timestamps no longer match the
 * page text word-for-word (lib/reader/audio-cache.ts#audioMatchesText). The
 * second case is the quiet one: the files exist, so nothing looks wrong from
 * storage, but the reader rejects them and the wrong voice comes in.
 *
 * Usage:
 *   pnpm content:audit-narration                     # every published book
 *   pnpm content:audit-narration when-can-we-talk    # one book, page by page
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const BUCKET = 'page-audio';
const VOICES = ['day', 'night'] as const;
type Voice = (typeof VOICES)[number];

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

// Mirrors lib/reader/audio-cache.ts exactly. If that changes, change this.
function normWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9']/gi, '');
}

function audioMatchesText(timestamps: WordTimestamp[], text: string): boolean {
  const textWords = text.split(/\s+/).map(normWord).filter(Boolean);
  const tsWords = timestamps.map((t) => normWord(t.word)).filter(Boolean);
  if (textWords.length !== tsWords.length) return false;
  for (let i = 0; i < textWords.length; i++) {
    if (textWords[i] !== tsWords[i]) return false;
  }
  return true;
}

type Verdict = 'ok' | 'missing' | 'mismatch';

interface PageResult {
  voice: Voice;
  chapterIdx: number;
  pageIdx: number;
  verdict: Verdict;
  detail?: string;
}

async function checkPage(
  base: string,
  bookId: string,
  voice: Voice,
  ci: number,
  pi: number,
  text: string,
): Promise<PageResult> {
  const stem = `${base}/${BUCKET}/${bookId}/${voice}/${ci}-${pi}`;
  const [mp3, ts] = await Promise.all([
    fetch(`${stem}.mp3`, { method: 'HEAD' }).then((r) => r.ok, () => false),
    fetch(`${stem}.timestamps.json`).then((r) => (r.ok ? r.json() : null), () => null),
  ]);
  if (!mp3 || !ts) {
    return { voice, chapterIdx: ci, pageIdx: pi, verdict: 'missing', detail: !mp3 ? 'no mp3' : 'no timestamps' };
  }
  const timestamps = ts as WordTimestamp[];
  if (!audioMatchesText(timestamps, text)) {
    const textWords = text.split(/\s+/).map(normWord).filter(Boolean);
    const tsWords = timestamps.map((t) => normWord(t.word)).filter(Boolean);
    let detail = `${textWords.length} words in text vs ${tsWords.length} in audio`;
    if (textWords.length === tsWords.length) {
      const at = textWords.findIndex((w, i) => w !== tsWords[i]);
      detail = `diverges at word ${at + 1}: text "${textWords[at]}" vs audio "${tsWords[at]}"`;
    }
    return { voice, chapterIdx: ci, pageIdx: pi, verdict: 'mismatch', detail };
  }
  return { voice, chapterIdx: ci, pageIdx: pi, verdict: 'ok' };
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');
  const storageBase = `${url}/storage/v1/object/public`;
  const only = process.argv[2];

  const client = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: rows } = await client.from('books').select('id, book').in('status', ['complete', 'published']);

  const books = (rows ?? []).filter((r) => !only || r.id === only);
  if (books.length === 0) throw new Error(only ? `no published book with id "${only}"` : 'no books');

  let grandBad = 0;

  for (const row of books) {
    const book = row.book as { title?: string; chapters?: Array<{ pages: Array<{ text: string }> }> };
    const chapters = book.chapters ?? [];
    const jobs: Array<Promise<PageResult>> = [];
    for (const voice of VOICES) {
      chapters.forEach((c, ci) =>
        c.pages.forEach((p, pi) => jobs.push(checkPage(storageBase, row.id, voice, ci, pi, p.text))),
      );
    }
    const results = await Promise.all(jobs);
    const bad = results.filter((r) => r.verdict !== 'ok');
    grandBad += bad.length;

    const missing = bad.filter((r) => r.verdict === 'missing').length;
    const mismatch = bad.filter((r) => r.verdict === 'mismatch').length;
    const flag = bad.length === 0 ? '✓' : '✗';
    console.log(
      `${flag} ${row.id.padEnd(28)} ${String(results.length - bad.length).padStart(3)}/${String(results.length).padEnd(3)} ok` +
        (bad.length ? `   ${missing} missing, ${mismatch} mismatched` : ''),
    );

    if (only && bad.length > 0) {
      for (const r of bad) {
        console.log(`    ${r.verdict.padEnd(8)} ${r.voice} ch${r.chapterIdx} p${r.pageIdx}  — ${r.detail}`);
      }
    }
  }

  console.log(
    grandBad === 0
      ? '\nEvery page has matching narration. No page falls back to device speech.'
      : `\n${grandBad} page×voice slot${grandBad === 1 ? '' : 's'} would fall back to device speech.`,
  );
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});
