#!/usr/bin/env tsx
/**
 * Pre-generate ElevenLabs narration for a book with per-character voice
 * cast + pronunciation dictionary + optional v3 emotion tags.
 *
 * For each page:
 *   1. Segment into (narrator | character) chunks via lib/narration/segment
 *   2. Apply global + per-book pronunciation dictionary
 *   3. If ELEVENLABS_MODEL_ID=eleven_v3, prepend emotion tags per segment
 *   4. Send each segment to ElevenLabs with the right voice id
 *   5. Concatenate MP3 buffers + offset word timestamps
 *   6. Upload one combined MP3 + one combined timestamps.json per (voice, page)
 *
 * story.json opt-ins:
 *   {
 *     "characters": { "Bramble": { "voiceId": "..." }, "Mose": { "voiceId": "..." } },
 *     "pronunciations": { "Azi": "Ah-zee" }
 *   }
 *
 * Usage:
 *   pnpm content:narrate content/books/brambles-hello
 *   pnpm content:narrate content/books/brambles-hello --voice day
 *   pnpm content:narrate content/books/brambles-hello --check
 *   pnpm content:narrate content/books/brambles-hello --force
 *
 * Env:
 *   ELEVENLABS_API_KEY        required
 *   DAY_VOICE_ID              default narrator voice for day mode
 *   NIGHT_VOICE_ID            default narrator voice for night mode
 *   ELEVENLABS_MODEL_ID       model to use (default: eleven_multilingual_v2)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { buildNarrationSegments, type BuiltSegment } from '../lib/narration/build';
import type { PronunciationMap } from '../lib/narration/pronunciations';

config({ path: '.env.local' });

type Voice = 'day' | 'night';
const PAGE_AUDIO_BUCKET = 'page-audio';
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2';
const GLOBAL_PRONUNCIATIONS_PATH = 'content/pronunciations.json';

interface Args {
  folder: string;
  voices: Voice[];
  dayVoiceId: string | null;
  nightVoiceId: string | null;
  dryRun: boolean;
  force: boolean;
  modelId: string;
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
    modelId: process.env.ELEVENLABS_MODEL_ID ?? DEFAULT_MODEL_ID,
  };
}

interface CharacterCastEntry {
  voiceId: string;
  nightVoiceId?: string;
}

interface StoryFile {
  id: string;
  title: string;
  characters?: Record<string, CharacterCastEntry>;
  pronunciations?: Record<string, string>;
  chapters: Array<{ title: string; pages: Array<{ text: string }> }>;
}

function readStory(folder: string): StoryFile {
  const path = join(folder, 'story.json');
  if (!existsSync(path)) throw new Error(`missing story.json in ${folder}`);
  const raw = JSON.parse(readFileSync(path, 'utf8')) as StoryFile;
  if (!raw.id || !raw.chapters?.length) throw new Error('story.json needs at least: id, chapters');
  return raw;
}

function readGlobalPronunciations(): PronunciationMap {
  if (!existsSync(GLOBAL_PRONUNCIATIONS_PATH)) return {};
  try {
    return JSON.parse(readFileSync(GLOBAL_PRONUNCIATIONS_PATH, 'utf8')) as PronunciationMap;
  } catch {
    return {};
  }
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

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

/** ElevenLabs char-level alignment → word timestamps. Splits at whitespace. */
function alignmentToWordTimestamps(align: Eleven11Alignment): WordTimestamp[] {
  const chars = align.characters;
  const starts = align.character_start_times_seconds;
  const ends = align.character_end_times_seconds;
  const out: WordTimestamp[] = [];
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
  return out;
}

/** Drop leading v3-style [excited]/[whispers] tag tokens — they don't
 *  correspond to visible words in the original page text. */
function stripBracketTags(words: WordTimestamp[]): WordTimestamp[] {
  return words.filter((w) => !(w.word.startsWith('[') && w.word.endsWith(']')));
}

async function narrateSegment(
  voiceId: string,
  text: string,
  modelId: string,
): Promise<{ audio: Buffer; timestamps: WordTimestamp[] }> {
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
      model_id: modelId,
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
  const raw = alignmentToWordTimestamps(align);
  const cleaned = stripBracketTags(raw);
  return { audio, timestamps: cleaned };
}

/** For each page: build segments, narrate each, concatenate. Returns one
 *  MP3 buffer + one word-timestamp list for the whole page. */
async function narratePage(
  args: {
    text: string;
    narratorVoiceId: string;
    characters: Record<string, string>; // name → voiceId
    globalPronunciations: PronunciationMap;
    perBookPronunciations: PronunciationMap;
    modelId: string;
  },
): Promise<{ audio: Buffer; timestamps: WordTimestamp[]; segments: BuiltSegment[] }> {
  const supportsBrackets = args.modelId === 'eleven_v3';
  const segments = buildNarrationSegments({
    text: args.text,
    voices: {
      narratorVoiceId: args.narratorVoiceId,
      perCharacter: args.characters,
    },
    pronunciations: {
      global: args.globalPronunciations,
      perBook: args.perBookPronunciations,
    },
    supportsBrackets,
  });

  if (segments.length === 0) throw new Error('no segments produced from page text');

  const audioChunks: Buffer[] = [];
  const allTimestamps: WordTimestamp[] = [];
  let cumulativeDuration = 0;

  for (const seg of segments) {
    const { audio, timestamps } = await narrateSegment(seg.voiceId, seg.text, args.modelId);
    audioChunks.push(audio);
    for (const t of timestamps) {
      allTimestamps.push({
        word: t.word,
        start: t.start + cumulativeDuration,
        end: t.end + cumulativeDuration,
      });
    }
    // Duration ≈ last timestamp end; if empty, no forward offset.
    const last = timestamps[timestamps.length - 1];
    if (last) cumulativeDuration += last.end;
  }

  return {
    audio: Buffer.concat(audioChunks),
    timestamps: allTimestamps,
    segments,
  };
}

interface PageJob {
  voice: Voice;
  narratorVoiceId: string;
  characters: Record<string, string>;
  chapterIdx: number;
  pageIdx: number;
  text: string;
}

function selectCharacterVoices(
  book: StoryFile,
  voice: Voice,
): Record<string, string> {
  const chars = book.characters ?? {};
  const map: Record<string, string> = {};
  for (const [name, entry] of Object.entries(chars)) {
    if (!entry?.voiceId) continue;
    map[name] = voice === 'night' && entry.nightVoiceId ? entry.nightVoiceId : entry.voiceId;
  }
  return map;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');

  const story = readStory(args.folder);
  const globalPronunciations = readGlobalPronunciations();
  const perBookPronunciations = story.pronunciations ?? {};

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const jobs: PageJob[] = [];
  for (const voice of args.voices) {
    const narratorVoiceId = voice === 'day' ? args.dayVoiceId : args.nightVoiceId;
    if (!narratorVoiceId) {
      console.warn(`⚠ no ${voice} voice id (set ${voice.toUpperCase()}_VOICE_ID or --${voice}-voice) — skipping ${voice}`);
      continue;
    }
    const characters = selectCharacterVoices(story, voice);
    story.chapters.forEach((c, ci) =>
      c.pages.forEach((p, pi) =>
        jobs.push({ voice, narratorVoiceId, characters, chapterIdx: ci, pageIdx: pi, text: p.text }),
      ),
    );
  }

  console.log(`\n🎙  ${story.title} (${story.id})`);
  console.log(`   model: ${args.modelId}`);
  const totalCharacters = Object.keys(story.characters ?? {}).length;
  if (totalCharacters > 0) {
    console.log(`   character cast: ${totalCharacters} voice${totalCharacters === 1 ? '' : 's'} (${Object.keys(story.characters ?? {}).join(', ')})`);
  }
  const dictSize = Object.keys({ ...globalPronunciations, ...perBookPronunciations }).filter((k) => !k.startsWith('_')).length;
  if (dictSize > 0) console.log(`   pronunciation dict: ${dictSize} entries`);
  console.log(`   ${jobs.length} page × voice job${jobs.length === 1 ? '' : 's'}\n`);

  // Skip already-uploaded (voice, ch, pg) unless --force.
  const toRun: PageJob[] = [];
  for (const job of jobs) {
    if (args.force) {
      toRun.push(job);
      continue;
    }
    const mp3Key = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.mp3`;
    const tsKey = `${story.id}/${job.voice}/${job.chapterIdx}-${job.pageIdx}.timestamps.json`;
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
    console.log(`\n(dry run) would narrate ${toRun.length} page × voice with new pipeline`);
    // Show what the first page's segmentation would look like — sanity check
    // for the character cast + pronunciation dict.
    const preview = toRun[0]!;
    const built = buildNarrationSegments({
      text: preview.text,
      voices: { narratorVoiceId: preview.narratorVoiceId, perCharacter: preview.characters },
      pronunciations: { global: globalPronunciations, perBook: perBookPronunciations },
      supportsBrackets: args.modelId === 'eleven_v3',
    });
    console.log(`\n  Preview segmentation for ${preview.voice} ch${preview.chapterIdx}p${preview.pageIdx}:`);
    for (const s of built) {
      console.log(`    · [${s.speaker}] ${JSON.stringify(s.text.slice(0, 80))}`);
    }
    return;
  }

  let done = 0;
  let failed = 0;
  for (const job of toRun) {
    process.stdout.write(`  → ${job.voice} ch${job.chapterIdx}p${job.pageIdx}… `);
    try {
      const { audio, timestamps, segments } = await narratePage({
        text: job.text,
        narratorVoiceId: job.narratorVoiceId,
        characters: job.characters,
        globalPronunciations,
        perBookPronunciations,
        modelId: args.modelId,
      });
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
      process.stdout.write(`✓ (${segments.length} seg, ${audio.length} bytes, ${timestamps.length} words)\n`);
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
