import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId, firstChildIdInHousehold } from '@/lib/server/current-household';
import { isoToWeekIdx, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';
import { loadWorldState } from '@/lib/world/state';
import { ComprehensionSection, type ComprehensionRecordView } from './comprehension-section';
import { WordbookSection, type ParentWordbookEntry } from './wordbook-section';
import { BuddyPicker } from './buddy-picker';
import { SunsParent } from './suns-parent';
import { BooksSection, type ParentBook, type ParentBookStatus } from './books-section';
import { ArtSection, type PendingArt } from './art-section';
import { ArtGrid, type CandidateView } from './art-grid';
import { ChildrenSection, type ChildRow } from './children-section';

export default async function ParentHomePage() {
  const householdId = await currentHouseholdId();
  const childId = (await firstChildIdInHousehold()) ?? '';
  const week = weekWindowUtc();
  const [
    { data: household },
    { data: children },
    { data: comprehensionRows },
    { data: wordbookRows },
    { data: readingDayRows },
    { data: bookRows },
    { data: qaRows },
    world,
  ] = await Promise.all([
    admin().from('households').select('name').eq('id', householdId).maybeSingle(),
    admin()
      .from('children')
      .select('id, display_name, band')
      .eq('household_id', householdId)
      .order('display_name'),
    admin()
      .from('comprehension_records')
      .select('id, question, question_type, transcript, judged_signal, asked_at')
      .eq('child_id', childId)
      .order('asked_at', { ascending: false })
      .limit(10),
    admin()
      .from('wordbook_entries')
      .select('id, word, meaning, sentence, owned_at')
      .eq('child_id', childId)
      .order('saved_at', { ascending: false })
      .limit(20),
    admin()
      .from('reading_days')
      .select('day')
      .eq('child_id', childId)
      .in('day', week),
    admin()
      .from('books')
      .select('id, title, status, source, updated_at')
      .eq('household_id', householdId)
      .order('updated_at', { ascending: false })
      .limit(30),
    admin()
      .from('qa_records')
      .select('book_id, attempt, hard_gates, soft_score, created_at')
      .eq('household_id', householdId)
      .order('attempt', { ascending: false }),
    loadWorldState(childId),
  ]);

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

  const comprehension: ComprehensionRecordView[] = (comprehensionRows ?? []).map((r) => ({
    id: r.id,
    question: r.question,
    questionType: (r.question_type as ComprehensionRecordView['questionType']) ?? 'recall',
    transcript: r.transcript,
    judgedSignal: r.judged_signal as ComprehensionRecordView['judgedSignal'],
    askedAt: r.asked_at,
  }));

  const wordbook: ParentWordbookEntry[] = (wordbookRows ?? []).map((w) => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    sentence: w.sentence,
    owned: Boolean(w.owned_at),
  }));

  const books: ParentBook[] = (bookRows ?? []).map((b) => {
    const qa = latestQAByBook.get(b.id);
    return {
      id: b.id,
      title: b.title,
      status: b.status as ParentBookStatus,
      source: b.source,
      hardGatesPassed: qa?.hardPassed ?? null,
      softScoreTotal: qa?.softTotal ?? null,
      updatedAt: b.updated_at,
    };
  });

  const earnedIdx = (readingDayRows ?? [])
    .map((r) => week.indexOf(r.day))
    .filter((i) => i >= 0);
  const todayIdx = isoToWeekIdx(todayIsoUtc());

  const childRows: ChildRow[] = (children ?? []).map((c) => ({
    id: c.id,
    displayName: c.display_name,
    band: c.band,
  }));

  const generatedBookCount = books.filter((b) => b.source === 'generated').length;
  const totalWords = wordbook.length;
  const totalCheckpoints = comprehension.length;

  return (
    <main style={{ display: 'grid', gap: 'var(--space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            margin: 0,
            color: 'var(--text-strong)',
          }}
        >
          Parent Corner
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          Everything you can do for and with the reader.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-3)',
          }}
        >
          <Stat label="Books" value={books.length} sublabel={`${generatedBookCount} generated`} />
          <Stat label="Words saved" value={totalWords} />
          <Stat label="Checkpoints" value={totalCheckpoints} />
          <Stat label="Reading days" value={earnedIdx.length} sublabel="this week" />
        </div>
      </header>

      <ChildrenSection rows={childRows} householdName={household?.name ?? 'Household'} />
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
        books={books.map((b) => ({ id: b.id, title: b.title, hasCover: false }))}
      />
      <ComprehensionSection records={comprehension} />
      <WordbookSection entries={wordbook} />
      <SunsParent earned={earnedIdx} today={todayIdx} />
      <BuddyPicker currentBuddyId={world.activeBuddyId} />
    </main>
  );
}

function Stat({ label, value, sublabel }: { label: string; value: number | string; sublabel?: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--elev-rest)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-strong)' }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-caption)' }}>{label}</div>
      {sublabel && <div style={{ color: 'var(--text-hint)', fontSize: 'var(--text-caption)' }}>{sublabel}</div>}
    </div>
  );
}
