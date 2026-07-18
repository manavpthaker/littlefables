#!/usr/bin/env tsx
// One-shot approval — approve the first pending candidate for every
// (chapter, page) in a book. For each: copies the blob into art-live,
// stamps art_artifacts.status='approved' + live_url + approved_at, and
// stitches the URL into book.chapters[c].pages[p].img.
//
// Intended for automated pipeline runs (S2.3). Papa can still re-reject
// any page via the ArtApproval grid and re-generate.
//
// Usage:
//   pnpm exec tsx scripts/art-approve-book.ts --book brambles-hello

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from '../types/database';
import { bookSchema, type Book } from '../lib/models/book';
import { SEED_HOUSEHOLD_ID } from '../lib/models/seed';

config({ path: '.env.local' });

function argValue(name: string): string | undefined {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 && i < process.argv.length - 1 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');

  const bookId = argValue('book');
  if (!bookId) throw new Error('--book <id> required');

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: bookRow } = await client
    .from('books')
    .select('id, title, book')
    .eq('id', bookId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .single();
  if (!bookRow?.book) throw new Error(`book "${bookId}" not found`);
  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) throw new Error(`book invalid: ${parsed.error.message}`);
  const book: Book = parsed.data;

  // Fetch pending scene candidates for this book.
  const { data: candidates } = await client
    .from('art_artifacts')
    .select('id, chapter_idx, page_idx, candidate_path')
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .eq('book_id', bookId)
    .eq('kind', 'scene')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (!candidates?.length) {
    console.log('No pending scene candidates for this book.');
    return;
  }

  // Pick the first per (chapter, page).
  const seen = new Set<string>();
  const winners = candidates.filter((c) => {
    const key = `${c.chapter_idx}-${c.page_idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Approving ${winners.length} candidates for "${book.title}"…`);

  for (const c of winners) {
    const label = `ch${c.chapter_idx} p${c.page_idx}`;
    try {
      const { data: bytes, error: downErr } = await client.storage
        .from('art-candidates')
        .download(c.candidate_path);
      if (downErr || !bytes) throw new Error(`download: ${downErr?.message ?? 'no bytes'}`);

      const livePath = c.candidate_path;
      const upload = await client.storage
        .from('art-live')
        .upload(livePath, bytes, { contentType: 'image/png', upsert: true });
      if (upload.error) throw new Error(`upload: ${upload.error.message}`);

      const publicUrl = `${url}/storage/v1/object/public/art-live/${livePath}`;
      const { error: updateErr } = await client
        .from('art_artifacts')
        .update({
          status: 'approved',
          live_url: publicUrl,
          approved_at: new Date().toISOString(),
        })
        .eq('id', c.id);
      if (updateErr) throw new Error(`update: ${updateErr.message}`);

      // Stitch into the book jsonb.
      if (
        typeof c.chapter_idx === 'number' &&
        typeof c.page_idx === 'number' &&
        book.chapters[c.chapter_idx]?.pages[c.page_idx]
      ) {
        const page = book.chapters[c.chapter_idx]!.pages[c.page_idx]!;
        (page as { img?: string }).img = publicUrl;
      }

      console.log(`  ✓ ${label}`);
    } catch (err) {
      console.warn(`  ⚠ ${label} failed: ${(err as Error).message}`);
    }
  }

  // Single-shot book update with all stitched URLs.
  const { error: bookUpdateErr } = await client
    .from('books')
    .update({ book: book as unknown as Json })
    .eq('id', bookId);
  if (bookUpdateErr) console.warn(`book jsonb update failed: ${bookUpdateErr.message}`);
  else console.log('Book jsonb updated with page.img URLs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
