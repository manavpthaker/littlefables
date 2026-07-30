#!/usr/bin/env tsx
/**
 * Pre-generate ElevenLabs narration for a book. Reads story.json, calls
 * ElevenLabs /v1/text-to-speech/{voice}/with-timestamps per page × voice,
 * converts character-level alignment to word-level timestamps, uploads
 * both MP3 and timestamps.json to Supabase Storage at the exact path
 * `lib/reader/page-audio-source.ts` fetches from.
 *
 * Usage:
 *   pnpm content:narrate content/books/brambles-hello                    # day + night
 *   pnpm content:narrate content/books/brambles-hello --voice day        # day only
 *   pnpm content:narrate content/books/brambles-hello --voice night      # night only
 *   pnpm content:narrate content/books/brambles-hello --check            # dry run
 *   pnpm content:narrate content/books/brambles-hello --force            # re-narrate even if present
 *
 * Voice ids come from DAY_VOICE_ID / NIGHT_VOICE_ID env vars (same ones the
 * live TTS route reads). Override per-run with --day-voice / --night-voice.
 *
 * Idempotent by default: skips a (voice, chapter, page) if both the MP3
 * and timestamps.json already exist in the bucket. --force re-narrates
 * everything.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

config({ path: '.env.local' });

type Voice = 'day' | 'night';
const PAGE_AUDIO_BUCKET = 'page-audio';

interface Args {
  folder: string;
  voices: Voice[];
  dayVoiceId: string | null;
  nightVoiceId: string | null;
  dryRun: boolean;
  force: boolean;
}

function argAfter(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i > 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

function parseArgs(): Args {
  const folder = process.argv[2];
  if (!folder || folder.startsWith('--')) {
    console.error('usage: pnpm content:narrate <folder> [--voice day|night|both] [--day-voice <id>] [--night-voice <id>] [--force] [--check]');
    process.exit(1);
  }
  const voiceFlag = argAfter('--voice');
  const voices: Voice[] =
    voiceFlag === 'day' ? ['day'] : voiceFlag === 'night' ? ['night'] : ['day', 'night'];
  return {
    folder: resolve(folder),
    voices,
    dayVoiceId: argAfter('--day-voice') ?? process.env.DAY_VOICE_ID ?? process.env.NARRATOR_VOICE_ID ?? null,
    nightVoiceId: argAfter('--night-voice') ?? process.env.NIGHT_VOICE_ID ?? null,
    dryRun: process.argv.includes('--check'),
    force: process.argv.includes('--force'),
  };
}

interface StoryFile {
  id: string;
  title: string;
  chapters: Array<{ title: string; pages: Array<{ text: string }> }>;
}

function readStory(folder: string): StoryFile {
  const path = join(folder, 'story.json');
  if (!existsSync(path)) throw new Error(`missing story.json in ${folder}`);
  const raw = JSON.parse(readFileSync(path, 'utf8')) as StoryFile;
  if (!raw.id || !raw.chapters?.length) throw new Error('story.json needs at least: id, chapters');
  return raw;
}

interface Eleven11Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}
interface Eleven11Response {
  audio_base64: string;
  alignment?: Eleven11Alignment | null;
  normalized_alignment?: Eleven11Alignment | null;
}

/** Convert ElevenLabs character-level alignment → word timestamps that match
 *  `page.text.split(/\s+/)`. Word start = first non-whitespace char's start;
 *  word end = last non-whitespace char's end. Ordering follows the original
 *  text so `audioMatchesText` (word-by-word compare) succeeds. */
function alignmentToWordTimestamps(text: string, align: Eleven11Alignment): Array<{ word: string; start: number; end: number }> {
  // ElevenLabs returns per-character alignment for the *sent* text. Iterate
  // through it and cut at whitespace runs.
  const chars = align.characters;
  const starts = align.character_start_times_seconds;
  const ends = align.character_end_times_seconds;
  const out: Array<{ word: string; start: number; end: number }> = [];
  let currentWord = '';
  let wordStart = 0;
  let wordEnd = 0;
  const flush = () => {
    if (currentWord.length === 0) return;
    out.push({ word: currentWord, start: wordStart, end: wordEnd });
    currentWord = '';
  };
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (!c) continue;
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    if (currentWord.length === 0) wordStart = starts[i] ?? wordEnd;
    currentWord += c;
    wordEnd = ends[i] ?? wordEnd;
  }
  flush();

  // Sanity: the count should match text.split(/\s+/). If not, the caller's
  // audioMatchesText check will reject the file — better to fail here loudly.
  const expected = text.split(/\s+/).filter(Boolean).length;
  if (out.length !== expected) {
    throw new Error(
      `word-count mismatch: got ${out.length} from alignment, expected ${expected} from text`,
    );
  }
  return out;
}

async function narrateOne(voiceId: string, text: string): Promise<{ audio: Buffer; timestamps: ReturnType<typeof alignmentToWordTimestamps> }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY required in .env.local');
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
      model_id: 'eleven_flash_v2_5',
      output_format: 'mp3_44100_128',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = (await res.json()) as Eleven11Response;
  if (!data.audio_base64) throw new Error('ElevenLabs response missing audio_base64');
  const align = data.normalized_alignment ?? data.alignment;
  if (!align) throw new Error('ElevenLabs response missing alignment (timestamps)');
  const audio = Buffer.from(data.audio_base64, 'base64');
  const timestamps = alignmentToWordTimestamps(text, align);
  return { audio, timestamps };
}

async function main(): Promise<void> {
  const args = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');

  const story = readStory(args.folder);
  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Enumerate (voice, chapterIdx, pageIdx, text).
  const jobs: Array<{ voice: Voice; voiceId: string; chapterIdx: number; pageIdx: number; text: string }> = [];
  for (const voice of args.voices) {
    const voiceId = voice === 'day' ? args.dayVoiceId : args.nightVoiceId;
    if (!voiceId) {
      console.warn(`⚠ no ${voice} voice id (set ${voice.toUpperCase()}_VOICE_ID or --${voice}-voice) — skipping ${voice}`);
      continue;
    }
    story.chapters.forEach((c, ci) =>
      c.pages.forEach((p, pi) => jobs.push({ voice, voiceId, chapterIdx: ci, pageIdx: pi, text: p.text })),
    );
  }

  console.log(`\n🎙  ${story.title} (${story.id})`);
  console.log(`   ${jobs.length} page × voice job${jobs.length === 1 ? '' : 's'}\n`);

  // Skip already-uploaded (voice, ch, pg) unless --force.
  const toRun: typeof jobs = [];
  for (const job of jobs) {
    if (args.force) {
      toRun.push(job);
      continue;
    }
    const mp3Key = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.mp3`;
    const tsKey = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.timestamps.json`;
    // A cheap presence check: HEAD the public URL (both files are public read).
    const mp3Url = `${url}/storage/v1/object/public/${PAGE_AUDIO_BUCKET}/${mp3Key}`;
    const tsUrl = `${url}/storage/v1/object/public/${PAGE_AUDIO_BUCKET}/${tsKey}`;
    const [mp3Head, tsHead] = await Promise.all([
      fetch(mp3Url, { method: 'HEAD' }).then((r) => r.ok, () => false),
      fetch(tsUrl, { method: 'HEAD' }).then((r) => r.ok, () => false),
    ]);
    if (mp3Head && tsHead) {
      console.log(`  · ${job.voice} ch${job.chapterIdx}p${job.pageIdx} already narrated — skip`);
      continue;
    }
    toRun.push(job);
  }

  if (toRun.length === 0) {
    console.log('\nNothing to do. Add --force to re-narrate.');
    return;
  }

  if (args.dryRun) {
    console.log(`\n(dry run) would narrate ${toRun.length} page × voice:`);
    for (const j of toRun) console.log(`  ? ${j.voice} ch${j.chapterIdx}p${j.pageIdx} — ${j.text.slice(0, 60)}…`);
    return;
  }

  let done = 0;
  let failed = 0;
  for (const job of toRun) {
    process.stdout.write(`  → ${job.voice} ch${job.chapterIdx}p${job.pageIdx}… `);
    try {
      const { audio, timestamps } = await narrateOne(job.voiceId, job.text);
      const mp3Key = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.mp3`;
      const tsKey = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.timestamps.json`;
      const [{ error: mpErr }, { error: tsErr }] = await Promise.all([
        client.storage.from(PAGE_AUDIO_BUCKET).upload(mp3Key, audio, {
          contentType: 'audio/mpeg',
          upsert: true,
        }),
        client.storage.from(PAGE_AUDIO_BUCKET).upload(tsKey, JSON.stringify(timestamps), {
          contentType: 'application/json',
          upsert: true,
        }),
      ]);
      if (mpErr) throw new Error(`audio upload: ${mpErr.message}`);
      if (tsErr) throw new Error(`timestamps upload: ${tsErr.message}`);
      done += 1;
      process.stdout.write(`✓ (${audio.length} bytes, ${timestamps.length} words)\n`);
    } catch (err) {
      failed += 1;
      process.stdout.write(`✗ ${(err as Error).message}\n`);
    }
  }

  console.log(`\n${done} narrated, ${failed} failed. Reader will pick them up on the next page load.`);
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});
