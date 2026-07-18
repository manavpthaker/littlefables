import { NextResponse, type NextRequest } from 'next/server';
import { requireParentPassword } from '@/lib/server/parent-gate';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID } from '@/lib/models/seed';
import { bookSchema, type Book } from '@/lib/models/book';
import type { Json } from '@/types/database';

// Parent approve/reject action for an art artifact. Approving copies the
// candidate blob into the public art-live bucket, marks the row approved,
// and (for covers) sets the book's cover_bg to the public URL.

const bodySchema = z.object({
  artifactId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const gate = await requireParentPassword(); if (gate) return gate;

  const body = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const { data: artifact } = await admin()
    .from('art_artifacts')
    .select('id, book_id, chapter_idx, page_idx, kind, candidate_path, status, household_id')
    .eq('id', body.data.artifactId)
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .maybeSingle();
  if (!artifact) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (body.data.action === 'reject') {
    const { error } = await admin()
      .from('art_artifacts')
      .update({ status: 'rejected', reject_reason: body.data.reason ?? null })
      .eq('id', artifact.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, status: 'rejected' });
  }

  // Approve: copy blob to art-live public bucket.
  const { data: bytes, error: downErr } = await admin().storage
    .from('art-candidates')
    .download(artifact.candidate_path);
  if (downErr || !bytes) return NextResponse.json({ error: 'candidate_missing' }, { status: 500 });

  const livePath = artifact.candidate_path.replace(/^/, '');
  const { error: upErr } = await admin().storage
    .from('art-live')
    .upload(livePath, bytes, { contentType: 'image/png', upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/art-live/${livePath}`;

  const { error: updateArtErr } = await admin()
    .from('art_artifacts')
    .update({ status: 'approved', live_url: publicUrl, approved_at: new Date().toISOString() })
    .eq('id', artifact.id);
  if (updateArtErr) return NextResponse.json({ error: updateArtErr.message }, { status: 500 });

  // For covers: set the book's cover_bg to the public URL. For scene art:
  // stitch into the book jsonb at chapters[i].pages[j].img — reader will
  // fullBleed it.
  if (artifact.book_id) {
    const { data: bookRow } = await admin()
      .from('books')
      .select('book')
      .eq('id', artifact.book_id)
      .maybeSingle();
    if (bookRow?.book) {
      const parsed = bookSchema.safeParse(bookRow.book);
      if (parsed.success) {
        const updated: Book = parsed.data;
        if (artifact.kind === 'cover') {
          updated.coverImage = publicUrl;
          await admin()
            .from('books')
            .update({ cover_bg: publicUrl, book: updated as unknown as Json })
            .eq('id', artifact.book_id);
        } else if (
          typeof artifact.chapter_idx === 'number' &&
          typeof artifact.page_idx === 'number' &&
          updated.chapters[artifact.chapter_idx]?.pages[artifact.page_idx]
        ) {
          const page = updated.chapters[artifact.chapter_idx]!.pages[artifact.page_idx]!;
          (page as { img?: string }).img = publicUrl;
          await admin()
            .from('books')
            .update({ book: updated as unknown as Json })
            .eq('id', artifact.book_id);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, status: 'approved', publicUrl });
}
