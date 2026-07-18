import { NextResponse, type NextRequest } from 'next/server';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID } from '@/lib/models/seed';
import { bookSchema } from '@/lib/models/book';
import { generateImage } from '@/lib/gemini';

// Art generation for a specific book (cover only for now; per-page scene art
// is a follow-up). Uploads bytes to the art-candidates bucket, inserts an
// art_artifacts row with status='pending' for Papa's review.

const bodySchema = z.object({
  bookId: z.string().min(1),
  kind: z.enum(['cover', 'scene']).default('cover'),
  chapterIdx: z.number().int().min(0).optional(),
  pageIdx: z.number().int().min(0).optional(),
  extraPrompt: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const gate = await requireParentPassword(); if (gate) return gate;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: bookRow } = await admin()
    .from('books')
    .select('id, title, book')
    .eq('id', body.data.bookId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .maybeSingle();
  if (!bookRow?.book) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) return NextResponse.json({ error: 'book_invalid' }, { status: 500 });
  const book = parsed.data;

  // Compose the prompt. Style anchor: warm children's-picture-book watercolor,
  // ~4x3, no text, no logos, one focal moment. Body of the book provides
  // ground truth for characters + setting.
  const prompt = buildPrompt(book, body.data);

  let image: Buffer;
  try {
    image = await generateImage({ householdId: SEED_HOUSEHOLD_ID, prompt });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }

  const candidatePath = `${book.id}/${body.data.kind}-${body.data.chapterIdx ?? 0}-${body.data.pageIdx ?? 0}-${Date.now()}.png`;
  const { error: upErr } = await admin().storage
    .from('art-candidates')
    .upload(candidatePath, image, { contentType: 'image/png', upsert: false });
  if (upErr) return NextResponse.json({ error: `upload failed: ${upErr.message}` }, { status: 500 });

  const { data: artRow, error: insErr } = await admin()
    .from('art_artifacts')
    .insert({
      household_id: SEED_HOUSEHOLD_ID,
      kind: body.data.kind,
      character_id: null,
      book_id: book.id,
      chapter_idx: body.data.chapterIdx ?? null,
      page_idx: body.data.pageIdx ?? null,
      candidate_path: candidatePath,
      status: 'pending',
      model: 'gemini-2.5-flash-image',
      prompt,
    })
    .select('id, candidate_path')
    .single();
  if (insErr || !artRow) return NextResponse.json({ error: 'db_failed' }, { status: 500 });

  const { data: signed } = await admin().storage.from('art-candidates').createSignedUrl(candidatePath, 60 * 60);
  return NextResponse.json({ artifactId: artRow.id, previewUrl: signed?.signedUrl ?? null });
}

function buildPrompt(book: { title: string; chapters: Array<{ title: string; pages: Array<{ text: string }> }> }, opts: z.infer<typeof bodySchema>): string {
  const base = [
    'warm children\'s picture-book watercolor illustration',
    '4:3 aspect ratio, no text, no logos, no watermarks',
    'soft edges, hand-painted feel, cozy palette (paper cream, terracotta, marigold, honey)',
    'one clear focal moment, natural composition',
  ].join(', ');

  if (opts.kind === 'cover') {
    const firstLine = book.chapters[0]?.pages[0]?.text?.slice(0, 200) ?? '';
    return `Book cover for "${book.title}". ${base}. Scene: ${firstLine}. ${opts.extraPrompt ?? ''}`.trim();
  }
  const scene = book.chapters[opts.chapterIdx ?? 0]?.pages[opts.pageIdx ?? 0]?.text ?? '';
  return `Scene illustration. ${base}. Depict: ${scene}. ${opts.extraPrompt ?? ''}`.trim();
}
