import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';
import { deriveLayerTag, LAYER_TAG_LABELS, type LayerTag } from '@/lib/models/layer-tags';
import { BooksSection, type ParentBook, type ParentBookStatus } from '../books-section';
import { ArtSection, type PendingArt } from '../art-section';
import { ArtGrid, type CandidateView } from '../art-grid';

// Parent · Stories (brief §III.5): manage the library. Every book with its
// true lifecycle state, what it teaches, the per-story shelf toggle, art
// approval, and the door to the Maker. Nothing is softened.

export default async function ParentStoriesPage() {
  const householdId = await currentHouseholdId();

  const [{ data: bookRows }, { data: qaRows }] = await Promise.all([
    admin()
      .from('books')
      .select('id, title, status, source, updated_at, shelf_enabled, origin_note, book')
      .eq('household_id', householdId)
      .order('updated_at', { ascending: false })
      .limit(50),
    admin()
      .from('qa_records')
      .select('book_id, attempt, hard_gates, soft_score, created_at')
      .eq('household_id', householdId)
      .order('attempt', { ascending: false }),
  ]);

  const { data: latestApprovedArt } = await admin()
    .from('art_artifacts')
    .select('book_id, approved_at')
    .eq('household_id', householdId)
    .eq('status', 'approved')
    .order('approved_at', { ascending: false });
  const artApprovedByBook = new Map<string, string>();
  for (const a of latestApprovedArt ?? []) {
    if (a.book_id && a.approved_at && !artApprovedByBook.has(a.book_id)) {
      artApprovedByBook.set(a.book_id, a.approved_at);
    }
  }

  const { data: pendingArtRows } = await admin()
    .from('art_artifacts')
    .select('id, book_id, kind, chapter_idx, page_idx, candidate_path, created_at')
    .eq('household_id', householdId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20);

  const pendingArt: PendingArt[] = [];
  for (const row of pendingArtRows ?? []) {
    const { data: signed } = await admin().storage
      .from('art-candidates')
      .createSignedUrl(row.candidate_path, 60 * 60);
    if (!signed?.signedUrl) continue;
    const bookRow = (bookRows ?? []).find((b) => b.id === row.book_id);
    pendingArt.push({
      id: row.id,
      bookId: row.book_id,
      bookTitle: bookRow?.title ?? null,
      kind: row.kind as 'cover' | 'scene' | 'sheet',
      chapterIdx: row.chapter_idx,
      pageIdx: row.page_idx,
      previewUrl: signed.signedUrl,
      createdAt: row.created_at,
    });
  }

  const latestQAByBook = new Map<string, { hardPassed: boolean | null; softTotal: number | null }>();
  for (const q of qaRows ?? []) {
    if (latestQAByBook.has(q.book_id)) continue;
    const hard = (q.hard_gates as { passed?: boolean } | null) ?? null;
    const soft = (q.soft_score as { total?: number } | null) ?? null;
    latestQAByBook.set(q.book_id, {
      hardPassed: hard ? Boolean(hard.passed) : null,
      softTotal: soft?.total ?? null,
    });
  }

  const books: ParentBook[] = (bookRows ?? []).map((b) => {
    const qa = latestQAByBook.get(b.id);
    const payload = b.book as { teachingGoals?: string[]; layerTag?: LayerTag } | null;
    const layer = payload?.layerTag ?? deriveLayerTag(payload?.teachingGoals ?? [], b.origin_note);
    const teaches = (payload?.teachingGoals ?? []).join('; ');
    return {
      id: b.id,
      title: b.title,
      status: b.status as ParentBookStatus,
      source: b.source,
      hardGatesPassed: qa?.hardPassed ?? null,
      softScoreTotal: qa?.softTotal ?? null,
      updatedAt: b.updated_at,
      artApprovedAt: artApprovedByBook.get(b.id) ?? null,
      shelfEnabled: b.shelf_enabled,
      teaches: teaches ? `${teaches} · layer: ${LAYER_TAG_LABELS[layer]}` : `layer: ${LAYER_TAG_LABELS[layer]}`,
    };
  });

  return (
    <main style={{ display: 'grid', gap: 'var(--space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            margin: 0,
            color: 'var(--text-strong)',
          }}
        >
          Stories
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          What&rsquo;s on the shelf, what each story teaches, and the true state of every book.
        </p>
      </header>

      <BooksSection books={books} />
      <ArtGrid
        candidates={pendingArt.map<CandidateView>((p) => ({
          id: p.id,
          bookId: p.bookId,
          bookTitle: p.bookTitle,
          kind: p.kind,
          chapterIdx: p.chapterIdx,
          pageIdx: p.pageIdx,
          previewUrl: p.previewUrl,
        }))}
      />
      <ArtSection
        pending={[]}
        // hasCover reflects reality (Approve-vs-Regenerate label): a book has
        // an approved cover if it appears in artApprovedByBook. Previously
        // hardcoded false, so every book advertised "Generate" even when a
        // cover was already approved and live in the reader.
        books={books.map((b) => ({
          id: b.id,
          title: b.title,
          hasCover: artApprovedByBook.has(b.id),
        }))}
      />
    </main>
  );
}
