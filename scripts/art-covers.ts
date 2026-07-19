#!/usr/bin/env tsx
// Batch cover-art generation for every book lacking an approved cover.
// Two candidates per book, sequentially. Uploads bytes to art-candidates and
// inserts art_artifacts rows with status='pending' for Papa to review via the
// Parent Corner ArtApproval grid (S2.2).
//
// Prompt composition: character bible + book title + first-page text +
// portrait 9:19.5 safe-area language per PRD E0 (iPhone-first).
//
// Usage:
//   pnpm exec tsx scripts/art-covers.ts           # all books needing covers
//   pnpm exec tsx scripts/art-covers.ts --book <id>  # single book
//   pnpm exec tsx scripts/art-covers.ts --candidates 3  # override count (default 2)

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

// Pro tier by default (matches art-scenes) — better prompt adherence for the
// one image that sells each book. ART_SCENE_MODEL env overrides.
const GEMINI_MODEL = process.env.ART_SCENE_MODEL || 'gemini-3-pro-image';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

function charBriefFor(book: { title: string; chapters: Array<{ pages: Array<{ text: string }> }> }, bible: CharacterBible): string {
  // Which characters are named in the book text? Cheap keyword match.
  const text = book.chapters
    .flatMap((c) => c.pages.map((p) => p.text))
    .join(' ')
    .toLowerCase();
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

function coverPrompt(book: { title: string; chapters: Array<{ pages: Array<{ text: string }> }> }, characters: string): string {
  const firstLines = (book.chapters[0]?.pages ?? []).slice(0, 2).map((p) => p.text).join(' ');
  return [
    "Portrait book-cover illustration for a warm children's picture book.",
    `Title: "${book.title}".`,
    `Scene grounded in the opening: ${firstLines.slice(0, 400)}`,
    characters ? `Characters (draw these consistently): ${characters}.` : '',
    'Style: hand-painted watercolor, soft edges, cozy paper palette (paper cream, terracotta, marigold, honey, sage). One clear focal moment, one central character, gentle composition — never busy.',
    'Format: 9:19.5 portrait aspect ratio, iPhone-safe composition — all important elements inside the central vertical band. No text, no logos, no watermarks, no borders, no letters.',
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

  const targetBook = argValue('book');
  const candidatesPer = Math.max(1, Math.min(5, Number(argValue('candidates') ?? '2')));

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const bible = JSON.parse(
    readFileSync(path.resolve('content/art/characters.json'), 'utf8'),
  ) as CharacterBible;

  // Fetch books.
  const q = client.from('books').select('id, title, book').eq('household_id', SEED_HOUSEHOLD_ID);
  const { data: bookRows, error } = await (targetBook ? q.eq('id', targetBook) : q);
  if (error) throw new Error(error.message);
  if (!bookRows?.length) {
    console.log('No books found.');
    return;
  }

  // Find which books already have an approved cover.
  const { data: approvedCoverRows } = await client
    .from('art_artifacts')
    .select('book_id')
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .eq('kind', 'cover')
    .eq('status', 'approved');
  const alreadyApproved = new Set((approvedCoverRows ?? []).map((r) => r.book_id));

  const toGenerate = bookRows.filter((b) => !alreadyApproved.has(b.id));
  if (toGenerate.length === 0) {
    console.log('Every book already has an approved cover. Nothing to do.');
    return;
  }

  console.log(
    `Generating ${candidatesPer} candidate(s) each for ${toGenerate.length} books = ${toGenerate.length * candidatesPer} images ≈ $${((toGenerate.length * candidatesPer) * 0.05).toFixed(2)}`,
  );

  let done = 0;
  let failed = 0;
  for (const row of toGenerate) {
    const parsed = bookSchema.safeParse(row.book);
    if (!parsed.success) {
      console.warn(`  ⚠ ${row.id} book invalid, skipping`);
      failed++;
      continue;
    }
    const book = parsed.data;
    const characters = charBriefFor(book, bible);
    const prompt = coverPrompt(book, characters);

    for (let variant = 0; variant < candidatesPer; variant++) {
      const label = `[${row.id} cover v${variant + 1}]`;
      try {
        const startedAt = Date.now();
        const image = await generateImage(prompt, apiKey);
        const candidatePath = `${row.id}/cover-${Date.now()}-${variant}.png`;
        const upload = await client.storage
          .from('art-candidates')
          .upload(candidatePath, image, { contentType: 'image/png', upsert: false });
        if (upload.error) throw new Error(`upload: ${upload.error.message}`);
        const { error: insertErr } = await client.from('art_artifacts').insert({
          household_id: SEED_HOUSEHOLD_ID,
          kind: 'cover',
          character_id: null,
          book_id: row.id,
          chapter_idx: null,
          page_idx: null,
          candidate_path: candidatePath,
          status: 'pending',
          model: GEMINI_MODEL,
          prompt,
        });
        if (insertErr) throw new Error(`db: ${insertErr.message}`);
        console.log(
          `  + ${label} generated ${image.length} bytes in ${Date.now() - startedAt}ms`,
        );
        done++;
      } catch (err) {
        console.warn(`  ⚠ ${label} failed: ${(err as Error).message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone. ${done} candidates uploaded, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
