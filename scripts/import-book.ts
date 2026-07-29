#!/usr/bin/env tsx
/**
 * Book upload CLI. Takes a folder authored locally and uploads everything
 * to the hosted Supabase (art + audio to Storage; the book row to Postgres).
 *
 * Usage:
 *   pnpm content:add content/books/hedgehog-goodnight
 *
 * Folder convention:
 *   content/books/hedgehog-goodnight/
 *     story.json          # authored story (see FORMAT below)
 *     cover.png           # book cover — used as the shelf cover and as the
 *                         # per-page fallback when the page has no illustration
 *     pages/              # optional day-mode page illustrations
 *       01.png            # page 1 (chapter 1)
 *       02.png            # page 2
 *       ...               # can also be nested per chapter: pages/1/01.png
 *     audio/              # optional pre-generated narration
 *       day-01.mp3
 *       day-01.json       # word timestamps ([{word,start,end}, ...])
 *       night-01.mp3      # optional sleepy-voice recording
 *       night-01.json
 *       ...
 *
 * story.json format:
 *   {
 *     "id": "hedgehog-goodnight",     # unique kebab-case id, becomes the row id
 *     "title": "Hedgehog's Goodnight",
 *     "by": "Papa",                    # optional attribution
 *     "kind": "chapter" | "quick",     # chapter = shows a chapter map first
 *     "chapters": [
 *       {
 *         "title": "Snug in the leaves",
 *         "pages": [
 *           { "text": "The forest was quiet…" },
 *           { "text": "Hedgehog curled up small." }
 *         ]
 *       }
 *     ],
 *     "vocab": [                       # optional — words with syllable splits
 *       { "word": "burrow", "syllables": ["bur","row"], "kidDefinition": "..." }
 *     ]
 *   }
 *
 * The script:
 *   1. Validates story.json against bookSchema.
 *   2. Uploads cover.png → book-art/{id}/cover.png (public URL → books.cover_bg).
 *   3. Uploads pages/NN.png → book-art/{id}/pages/NN.png; the resulting URL
 *      is stitched into book.chapters[i].pages[j].img (numbered globally
 *      across chapters — so 01 = ch1p1, 02 = ch1p2, 03 = ch2p1 if ch1 has 2).
 *   4. Uploads audio/{voice}-{NN}.mp3 + .json → page-audio/{id}/{voice}/{ch}-{pg}.mp3.
 *   5. Upserts the books row (id, household_id, title, kind, source='family',
 *      status='published', shelf_enabled=true, book jsonb, cover_bg).
 *
 * Idempotent: re-running on the same folder updates the existing book row
 * and overwrites objects in Storage (upsert=true).
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { bookSchema, type Book } from '../lib/models/book';
import { SEED_HOUSEHOLD_ID } from '../lib/models/seed';

config({ path: '.env.local' });

const BOOK_ART_BUCKET = 'book-art';
const PAGE_AUDIO_BUCKET = 'page-audio';

interface Args {
  folder: string;
  householdId: string;
  dryRun: boolean;
}

function parseArgs(): Args {
  const folder = process.argv[2];
  if (!folder) {
    console.error('usage: pnpm content:add <folder> [--household <id>] [--check]');
    process.exit(1);
  }
  const householdIdx = process.argv.indexOf('--household');
  const householdArg =
    householdIdx > 0 && process.argv.length > householdIdx + 1
      ? process.argv[householdIdx + 1]
      : undefined;
  const householdId = householdArg ?? SEED_HOUSEHOLD_ID;
  const dryRun = process.argv.includes('--check');
  return { folder: resolve(folder), householdId, dryRun };
}

interface StoryFile {
  id: string;
  title: string;
  by?: string;
  kind: 'quick' | 'chapter';
  chapters: Array<{ title: string; pages: Array<{ text: string; [k: string]: unknown }> }>;
  vocab?: Book['vocab'];
  [k: string]: unknown;
}

function readStory(folder: string): StoryFile {
  const path = join(folder, 'story.json');
  if (!existsSync(path)) throw new Error(`missing story.json in ${folder}`);
  const raw = JSON.parse(readFileSync(path, 'utf8')) as StoryFile;
  if (!raw.id || !raw.title || !raw.chapters?.length) {
    throw new Error('story.json needs at least: id, title, chapters');
  }
  return raw;
}

/** Global page number (01-based) mapped to (chapterIdx, pageIdx). Used so
 *  the author can name page files sequentially without knowing chapter
 *  boundaries. */
function pageIndex(chapters: StoryFile['chapters']): Array<{ chapterIdx: number; pageIdx: number }> {
  const out: Array<{ chapterIdx: number; pageIdx: number }> = [];
  chapters.forEach((c, ci) => c.pages.forEach((_, pi) => out.push({ chapterIdx: ci, pageIdx: pi })));
  return out;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

async function main(): Promise<void> {
  const args = parseArgs();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required in .env.local');

  const story = readStory(args.folder);
  console.log(`\n📖 ${story.title} (${story.id}) · ${story.chapters.length} chapter${story.chapters.length === 1 ? '' : 's'}`);

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const publicUrl = (path: string, bucket: string) =>
    `${url}/storage/v1/object/public/${bucket}/${path}`;

  // 1. Cover.
  const coverPath = join(args.folder, 'cover.png');
  let coverUrl: string | null = null;
  if (existsSync(coverPath)) {
    const dest = `${story.id}/cover.png`;
    if (args.dryRun) {
      console.log(`  ? cover.png → book-art/${dest}`);
    } else {
      const bytes = readFileSync(coverPath);
      const { error } = await client.storage
        .from(BOOK_ART_BUCKET)
        .upload(dest, bytes, { contentType: 'image/png', upsert: true });
      if (error) throw new Error(`cover upload: ${error.message}`);
      console.log(`  ✓ cover → ${dest}`);
    }
    coverUrl = publicUrl(dest, BOOK_ART_BUCKET);
  } else {
    console.log(`  · no cover.png — shelf uses the wash background`);
  }

  // 2. Per-page illustrations (day mode). Look in ./pages/NN.png, then
  //    fall back to ./page-NN.png at the folder root.
  const pageMap = pageIndex(story.chapters);
  const pageArt = new Map<number, string>();
  for (let n = 0; n < pageMap.length; n++) {
    const num = pad2(n + 1);
    const candidates = [
      join(args.folder, 'pages', `${num}.png`),
      join(args.folder, `page-${num}.png`),
    ];
    const src = candidates.find(existsSync);
    if (!src) continue;
    const dest = `${story.id}/pages/${num}.png`;
    if (args.dryRun) {
      console.log(`  ? pages/${num}.png → book-art/${dest}`);
    } else {
      const bytes = readFileSync(src);
      const { error } = await client.storage
        .from(BOOK_ART_BUCKET)
        .upload(dest, bytes, { contentType: 'image/png', upsert: true });
      if (error) throw new Error(`page ${num} upload: ${error.message}`);
      console.log(`  ✓ page ${num} → ${dest}`);
    }
    pageArt.set(n, publicUrl(dest, BOOK_ART_BUCKET));
  }

  // 3. Audio (day + night). Same NN convention as pages. Missing files are
  //    fine — reader falls back to speechSynth for that page/voice.
  const audioDir = join(args.folder, 'audio');
  const uploadedAudio: string[] = [];
  if (existsSync(audioDir) && statSync(audioDir).isDirectory()) {
    for (let n = 0; n < pageMap.length; n++) {
      const num = pad2(n + 1);
      const slot = pageMap[n];
      if (!slot) continue;
      for (const voice of ['day', 'night'] as const) {
        const mp3 = join(audioDir, `${voice}-${num}.mp3`);
        const json = join(audioDir, `${voice}-${num}.json`);
        if (!existsSync(mp3)) continue;
        const dest = `${story.id}/${voice}/${slot.chapterIdx}-${slot.pageIdx}`;
        if (args.dryRun) {
          console.log(`  ? audio/${voice}-${num}.{mp3,json} → page-audio/${dest}.{mp3,timestamps.json}`);
        } else {
          const audioBytes = readFileSync(mp3);
          const { error: aerr } = await client.storage
            .from(PAGE_AUDIO_BUCKET)
            .upload(`${dest}.mp3`, audioBytes, { contentType: 'audio/mpeg', upsert: true });
          if (aerr) throw new Error(`audio upload ${voice}-${num}: ${aerr.message}`);
          if (existsSync(json)) {
            const jsonBytes = readFileSync(json);
            const { error: jerr } = await client.storage
              .from(PAGE_AUDIO_BUCKET)
              .upload(`${dest}.timestamps.json`, jsonBytes, {
                contentType: 'application/json',
                upsert: true,
              });
            if (jerr) throw new Error(`timestamps upload ${voice}-${num}: ${jerr.message}`);
          }
          console.log(`  ✓ ${voice} audio ${num} → ${dest}`);
        }
        uploadedAudio.push(`${voice}/${num}`);
      }
    }
  } else {
    console.log('  · no audio/ folder — narration will use browser TTS');
  }

  // 4. Assemble the book jsonb: fill in page.img from pageArt, stamp source
  //    + status, run through bookSchema.
  const chapters = story.chapters.map((c, ci) => ({
    ...c,
    pages: c.pages.map((p, pi) => {
      const n = pageMap.findIndex((m) => m.chapterIdx === ci && m.pageIdx === pi);
      const img = pageArt.get(n);
      return img ? { ...p, img } : p;
    }),
  }));

  const bookPayload: Book = bookSchema.parse({
    id: story.id,
    title: story.title,
    by: story.by,
    kind: story.kind,
    source: 'family',
    status: 'published',
    coverImage: coverUrl ?? undefined,
    vocab: story.vocab ?? [],
    chapters,
  });

  console.log(
    `\n  summary: ${pageMap.length} page${pageMap.length === 1 ? '' : 's'}, ` +
      `${pageArt.size} illustration${pageArt.size === 1 ? '' : 's'}, ` +
      `${uploadedAudio.length} audio file${uploadedAudio.length === 1 ? '' : 's'}`,
  );

  if (args.dryRun) {
    console.log('\n(dry run — nothing written)');
    return;
  }

  // 5. Upsert the row.
  const row = {
    id: story.id,
    household_id: args.householdId,
    child_id: null,
    title: story.title,
    by_line: story.by ?? null,
    kind: story.kind,
    source: 'family' as const,
    status: 'published' as const,
    cover_emoji: null,
    cover_bg: coverUrl,
    book: bookPayload as unknown as Database['public']['Tables']['books']['Insert']['book'],
    origin_note: null,
    shelf_enabled: true,
  };

  const { data: existing } = await client.from('books').select('id').eq('id', story.id).maybeSingle();
  const { error } = await client.from('books').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(`books upsert: ${error.message}`);

  console.log(`\n✓ ${existing ? 'Updated' : 'Added'} “${story.title}” (${story.id})`);
  const bookFolder = relative(process.cwd(), args.folder);
  console.log(`  from ${bookFolder} → household ${args.householdId}`);
}

main().catch((err) => {
  console.error('\n✗', err instanceof Error ? err.message : err);
  process.exit(1);
});

// Keep the linter honest even though these are imported only for side-effect
// discovery (readdirSync, basename).
void readdirSync;
void basename;
