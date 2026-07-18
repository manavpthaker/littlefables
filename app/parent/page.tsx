import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID, SEED_CHILD_ID } from '@/lib/models/seed';
import { isoToWeekIdx, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';
import { loadWorldState } from '@/lib/world/state';
import { SendToDeviceButton } from './send-to-device';
import { ComprehensionSection, type ComprehensionRecordView } from './comprehension-section';
import { WordbookSection, type ParentWordbookEntry } from './wordbook-section';
import { BuddyPicker } from './buddy-picker';
import { SunsParent } from './suns-parent';
import { BooksSection, type ParentBook, type ParentBookStatus } from './books-section';

// Parent Corner home. Single-household mode (Phase 0): no auth gate — anyone
// with the URL is Papa. Add a PARENT_PASSWORD env-gate before deploying.

export default async function ParentHomePage() {
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
    admin().from('households').select('name').eq('id', SEED_HOUSEHOLD_ID).maybeSingle(),
    admin()
      .from('children')
      .select('id, display_name, band')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .order('display_name'),
    admin()
      .from('comprehension_records')
      .select('id, question, question_type, transcript, judged_signal, asked_at')
      .eq('child_id', SEED_CHILD_ID)
      .order('asked_at', { ascending: false })
      .limit(10),
    admin()
      .from('wordbook_entries')
      .select('id, word, meaning, sentence, owned_at')
      .eq('child_id', SEED_CHILD_ID)
      .order('saved_at', { ascending: false })
      .limit(20),
    admin()
      .from('reading_days')
      .select('day')
      .eq('child_id', SEED_CHILD_ID)
      .in('day', week),
    admin()
      .from('books')
      .select('id, title, status, source, updated_at')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .order('updated_at', { ascending: false })
      .limit(30),
    admin()
      .from('qa_records')
      .select('book_id, attempt, hard_gates, soft_score, created_at')
      .eq('household_id', SEED_HOUSEHOLD_ID)
      .order('attempt', { ascending: false }),
    loadWorldState(SEED_CHILD_ID),
  ]);

  // Group latest-attempt QA per book.
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

  const earnedIdx = (readingDayRows ?? [])
    .map((r) => week.indexOf(r.day))
    .filter((i) => i >= 0);
  const todayIdx = isoToWeekIdx(todayIsoUtc());

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Parent Corner</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 'var(--space-1) 0 0' }}>
          {household?.name ?? 'Household'}
        </p>
      </header>

      <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>Children</h2>
        {(children ?? []).map((child) => (
          <div
            key={child.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3)',
              background: 'var(--wash-panel)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{child.display_name}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Band {child.band}</div>
            </div>
            <SendToDeviceButton childId={child.id} childName={child.display_name} />
          </div>
        ))}
      </section>

      <BooksSection books={books} />
      <ComprehensionSection records={comprehension} />
      <WordbookSection entries={wordbook} />
      <SunsParent earned={earnedIdx} today={todayIdx} />
      <BuddyPicker currentBuddyId={world.activeBuddyId} />
    </main>
  );
}
