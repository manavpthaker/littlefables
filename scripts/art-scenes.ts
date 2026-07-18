#!/usr/bin/env tsx
// Per-page scene-art generation. One candidate per page for a target book,
// uploaded to art-candidates as kind='scene' with chapter/page indexes set.
// Approve via the ArtApproval grid (S2.2) — the existing /api/parent/art/
// approve route stitches approved URLs into the book jsonb page.img.
//
// Usage:
//   pnpm exec tsx scripts/art-scenes.ts --book brambles-hello
//   pnpm exec tsx scripts/art-scenes.ts --book brambles-hello --check

import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { bookSchema } from '../lib/models/book';
import { SEED_HOUSEHOLD_ID } from '../lib/models/seed';

config({ path: '.env.local' });

function argValue(name: string): string | undefined {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}
function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

async function generateImage(prompt: string, apiKey: string, timeoutMs = 90_000): Promise<Buffer> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => '');
      throw new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data?: string } }> } }>;
    };
    const inline = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
    if (!inline?.data) throw new Error('Gemini response has no image');
    return Buffer.from(inline.data, 'base64');
  } finally {
    clearTimeout(timer);
  }
}

interface CharacterBible {
  characters?: Array<{
    name: string;
    role?: string;
    species?: string;
    visualAnchors?: string[];
  }>;
}

// One consistent palette note per book — hand-picked when we have art
// direction; falls back to a warm default. Guides Gemini to keep the pages
// feeling like one illustrator across the arc.
const BOOK_PALETTES: Record<string, string> = {
  'brambles-hello': 'honey wash palette — golden hour meadow, soft browns, pale sage',
  'cozy-circle': 'twilight lilac palette — deep river blues, warm dusk edges',
  'azi-and-the-thunder-symphony': 'stormy plum palette — deep berries, muted teals, silver rain',
  'bus-detour': 'sun-yellow palette — school-bus marigold + green suburban trees',
  'coocoo': 'moonlit palette — silver-plum shadows, warm lantern glows',
  'midnight-train': 'winter train palette — deep forest greens, warm cabin ambers, snow-blue skies',
  'moose-bigness': 'mountain palette — sage forests, canyon reds, honey highlights',
  'papa-gets-the-moon': 'quiet night palette — deep river blues, soft moon-cream, warm bedside amber',
  'word-collector': 'meadow palette — sunlit sage, marigold accents, wildflower dots',
};

function characterBrief(bookText: string, bible: CharacterBible): string {
  const text = bookText.toLowerCase();
  const hits = (bible.characters ?? []).filter((c) => text.includes(c.name.toLowerCase()));
  if (hits.length === 0) return '';
  return hits
    .slice(0, 4)
    .map((c) => {
      const anchors = (c.visualAnchors ?? []).slice(0, 3).join(', ');
      return `${c.name} (${c.species ?? 'character'}${anchors ? `: ${anchors}` : ''})`;
    })
    .join('; ');
}

function scenePrompt(book: { title: string }, pageText: string, palette: string, characters: string): string {
  return [
    "Watercolor scene illustration for a warm children's picture book page.",
    `Book: "${book.title}".`,
    `Depict this moment: ${pageText}`,
    characters ? `Characters (draw consistently across the book): ${characters}.` : '',
    `Palette: ${palette}.`,
    'Style: hand-painted watercolor, soft edges, cozy paper feel. One clear focal moment, natural composition — the eye should land somewhere calm.',
    'Format: 9:19.5 portrait aspect ratio, iPhone-safe composition — all important elements inside the central vertical band. Nothing important in the top 10% or bottom 15% (they will be covered by reader chrome). No text, no logos, no borders, no letters.',
  ]
    .filter(Boolean)
    .join(' ');
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');
  if (!apiKey) throw new Error('GEMINI_API_KEY required');

  const bookId = argValue('book');
  if (!bookId) throw new Error('--book <id> required');
  const check = argFlag('check');

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const bible = JSON.parse(
    readFileSync(path.resolve('content/art/characters.json'), 'utf8'),
  ) as CharacterBible;

  const { data: bookRow, error } = await client
    .from('books')
    .select('id, title, book')
    .eq('id', bookId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .single();
  if (error || !bookRow?.book) throw new Error(`book "${bookId}" not found`);

  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) throw new Error(`book payload invalid: ${parsed.error.message}`);
  const book = parsed.data;
  const palette = BOOK_PALETTES[bookId] ?? 'warm cozy palette — paper cream, terracotta, marigold, honey, sage';
  const bookAllText = book.chapters.flatMap((c) => c.pages.map((p) => p.text)).join(' ');
  const characters = characterBrief(bookAllText, bible);

  // Skip pages that already have a candidate or approved artifact.
  const { data: existingArt } = await client
    .from('art_artifacts')
    .select('chapter_idx, page_idx, status')
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .eq('book_id', bookId)
    .eq('kind', 'scene');
  const existingKeys = new Set(
    (existingArt ?? [])
      .filter((r) => r.chapter_idx !== null && r.page_idx !== null)
      .map((r) => `${r.chapter_idx}-${r.page_idx}`),
  );

  const jobs: Array<{ chapterIdx: number; pageIdx: number; text: string }> = [];
  book.chapters.forEach((chapter, chapterIdx) => {
    chapter.pages.forEach((page, pageIdx) => {
      if (!page?.text) return;
      if (existingKeys.has(`${chapterIdx}-${pageIdx}`)) return;
      jobs.push({ chapterIdx, pageIdx, text: page.text });
    });
  });

  const cost = jobs.length * 0.05;
  console.log(
    `Book "${book.title}": ${jobs.length} pages need scene art ≈ $${cost.toFixed(2)}${check ? ' (check-only)' : ''}`,
  );
  if (check) {
    jobs.forEach((j) => console.log(`  ? ch${j.chapterIdx} p${j.pageIdx}: ${j.text.slice(0, 60)}…`));
    return;
  }

  let done = 0;
  let failed = 0;
  for (const job of jobs) {
    const label = `[${bookId} ch${job.chapterIdx} p${job.pageIdx}]`;
    try {
      const startedAt = Date.now();
      const prompt = scenePrompt({ title: book.title }, job.text, palette, characters);
      const image = await generateImage(prompt, apiKey);
      const candidatePath = `${bookId}/scene-${job.chapterIdx}-${job.pageIdx}-${Date.now()}.png`;
      const upload = await client.storage
        .from('art-candidates')
        .upload(candidatePath, image, { contentType: 'image/png', upsert: false });
      if (upload.error) throw new Error(`upload: ${upload.error.message}`);
      const insertResult = await client.from('art_artifacts').insert({
        household_id: SEED_HOUSEHOLD_ID,
        kind: 'scene',
        character_id: null,
        book_id: bookId,
        chapter_idx: job.chapterIdx,
        page_idx: job.pageIdx,
        candidate_path: candidatePath,
        status: 'pending',
        model: 'gemini-2.5-flash-image',
        prompt,
      });
      if (insertResult.error) throw new Error(`db: ${insertResult.error.message}`);
      console.log(`  + ${label} ${image.length} bytes in ${Date.now() - startedAt}ms`);
      done++;
    } catch (err) {
      console.warn(`  ⚠ ${label} failed: ${(err as Error).message}`);
      failed++;
    }
  }
  console.log(`\nDone. ${done} candidates uploaded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
