#!/usr/bin/env tsx
// One-shot approval — approve the first pending candidate per key.
// For scene art the key is (chapter, page); for covers there's one key
// per book. Copies the blob into art-live, stamps art_artifacts.status
// = 'approved' + live_url + approved_at, and stitches into the book jsonb
// (page.img for scenes, book.coverImage + books.cover_bg for covers).
//
// Intended for automated pipeline runs (S2.3, S2.4). Papa can still
// re-reject any candidate via the ArtApproval grid and regenerate.
//
// Usage:
//   pnpm exec tsx scripts/art-approve-book.ts --book brambles-hello
//   pnpm exec tsx scripts/art-approve-book.ts --book brambles-hello --kind cover
//   pnpm exec tsx scripts/art-approve-book.ts --all --kind cover

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
function argFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function approveBook(
  client: ReturnType<typeof createClient<Database>>,
  supabaseUrl: string,
  bookId: string,
  kind: 'scene' | 'cover',
): Promise<void> {
  const { data: bookRow } = await client
    .from('books')
    .select('id, title, book')
    .eq('id', bookId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .single();
  if (!bookRow?.book) throw new Error(`book "${bookId}" not found`);
  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) throw new Error(`book "${bookId}" invalid: ${parsed.error.message}`);
  const book: Book = parsed.data;

  const { data: candidates } = await client
    .from('art_artifacts')
    .select('id, chapter_idx, page_idx, candidate_path')
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .eq('book_id', bookId)
    .eq('kind', kind)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (!candidates?.length) {
    console.log(`  ${bookId}: no pending ${kind} candidates`);
    return;
  }

  const seen = new Set<string>();
  const winners = candidates.filter((c) => {
    const key = kind === 'cover' ? 'cover' : `${c.chapter_idx}-${c.page_idx}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Approving ${winners.length} ${kind} candidate(s) for "${book.title}"…`);
  let firstCoverUrl: string | null = null;

  for (const c of winners) {
    const label = kind === 'cover' ? 'cover' : `ch${c.chapter_idx} p${c.page_idx}`;
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

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/art-live/${livePath}`;
      const { error: updateErr } = await client
        .from('art_artifacts')
        .update({
          status: 'approved',
          live_url: publicUrl,
          approved_at: new Date().toISOString(),
        })
        .eq('id', c.id);
      if (updateErr) throw new Error(`update: ${updateErr.message}`);

      if (
        kind === 'scene' &&
        typeof c.chapter_idx === 'number' &&
        typeof c.page_idx === 'number' &&
        book.chapters[c.chapter_idx]?.pages[c.page_idx]
      ) {
        const page = book.chapters[c.chapter_idx]!.pages[c.page_idx]!;
        (page as { img?: string }).img = publicUrl;
      } else if (kind === 'cover') {
        (book as { coverImage?: string }).coverImage = publicUrl;
        firstCoverUrl = publicUrl;
      }
      console.log(`  ✓ ${label}`);
    } catch (err) {
      console.warn(`  ⚠ ${label} failed: ${(err as Error).message}`);
    }
  }

  const patch: { book: Json; cover_bg?: string } = { book: book as unknown as Json };
  if (firstCoverUrl) patch.cover_bg = firstCoverUrl;
  const { error: bookUpdateErr } = await client.from('books').update(patch).eq('id', bookId);
  if (bookUpdateErr) console.warn(`  ⚠ book jsonb update failed: ${bookUpdateErr.message}`);
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY required');

  const bookId = argValue('book');
  const kind = (argValue('kind') as 'scene' | 'cover' | undefined) ?? 'scene';
  const all = argFlag('all');
  if (!bookId && !all) throw new Error('--book <id> or --all required');

  const client = createClient<Database>(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (all) {
    const { data: books } = await client
      .from('books')
      .select('id')
      .eq('household_id', SEED_HOUSEHOLD_ID);
    for (const b of books ?? []) {
      await approveBook(client, url, b.id, kind);
    }
  } else if (bookId) {
    await approveBook(client, url, bookId, kind);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
