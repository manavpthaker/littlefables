import { admin } from '@/lib/supabase/admin';
import { ComprehensionProfile } from '@ds/components/parent/ComprehensionProfile.jsx';
import { currentHouseholdId, firstChildIdInHousehold } from '@/lib/server/current-household';
import { isoToWeekIdx, streakLength, todayIsoUtc, weekWindowUtc } from '@/lib/world/dates';
import { computeMeters } from '@/lib/comprehension/meters';
import { loadWeeklyInsights } from '@/lib/parent/insights';
import { ComprehensionSection, type ComprehensionRecordView } from './comprehension-section';
import { WordbookSection, type ParentWordbookEntry } from './wordbook-section';
import { SunsParent } from './suns-parent';
import { StatTiles } from './stat-tiles';
import { InsightsCards } from './insights-cards';

// Parent · Insights (brief §III.5): is the child understanding, not just
// listening? Minutes / words / streak tiles, the comprehension meters, what
// this week's stories taught, the "say this tomorrow" bridge — then the raw
// evidence (transcripts, kept words). Honest numbers, no softening.

export default async function ParentInsightsPage() {
  const householdId = await currentHouseholdId();
  const childId = (await firstChildIdInHousehold()) ?? '';
  const week = weekWindowUtc();

  const [
    { data: comprehensionRows },
    { data: wordbookRows, count: wordCount },
    { data: readingDayRows },
    { data: sessionRows },
    weekly,
  ] = await Promise.all([
    admin()
      .from('comprehension_records')
      .select('id, question, question_type, transcript, judged_signal, asked_at, payload')
      .eq('child_id', childId)
      .order('asked_at', { ascending: false })
      .limit(60),
    admin()
      .from('wordbook_entries')
      .select('id, word, meaning, sentence, owned_at', { count: 'exact' })
      .eq('child_id', childId)
      .order('saved_at', { ascending: false })
      .limit(20),
    admin()
      .from('reading_days')
      .select('day')
      .eq('child_id', childId)
      .order('day', { ascending: false })
      .limit(60),
    admin()
      .from('reading_sessions')
      .select('day, seconds')
      .eq('child_id', childId)
      .in('day', week),
    loadWeeklyInsights(householdId, childId),
  ]);

  const meters = computeMeters(
    (comprehensionRows ?? []).map((r) => ({
      questionType: r.question_type,
      judgedSignal: r.judged_signal,
      payload: r.payload,
    })),
  );

  const minutesThisWeek = Math.round(
    ((sessionRows ?? []).reduce((sum, s) => sum + (s.seconds ?? 0), 0)) / 60,
  );
  const allDays = (readingDayRows ?? []).map((r) => r.day);
  const streak = streakLength(allDays);
  const earnedIdx = allDays.map((d) => week.indexOf(d)).filter((i) => i >= 0);
  const todayIdx = isoToWeekIdx(todayIsoUtc());

  const comprehension: ComprehensionRecordView[] = (comprehensionRows ?? [])
    .filter((r) => r.question_type !== 'retell')
    .slice(0, 10)
    .map((r) => ({
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
          Insights
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          The real question: understanding, not just listening.
        </p>
        <StatTiles
          tiles={[
            { label: 'min this week', value: minutesThisWeek },
            { label: 'words kept', value: wordCount ?? wordbook.length },
            { label: 'day streak', value: streak },
          ]}
        />
      </header>

      <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', margin: 0, color: 'var(--text-strong)' }}>
          Comprehension
        </h2>
        <ComprehensionProfile
          summary={meters.summary ?? 'Not enough checkpoints yet to see a pattern.'}
          levels={meters.levels}
        />
        <RungRow label="Literal — what happened" value={meters.literal} />
        <RungRow label="Inferential — why & how" value={meters.inferential} />
        <RungRow label="Retell — tells it back" value={meters.retell} />
      </section>

      <InsightsCards bridgeLine={weekly.bridgeLine} layers={weekly.layers} />

      <ComprehensionSection records={comprehension} />
      <WordbookSection entries={wordbook} />
      <SunsParent earned={earnedIdx} today={todayIdx} />
    </main>
  );
}

function RungRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <span style={{ flex: 1, fontSize: 'var(--text-body)', color: 'var(--text-body)' }}>{label}</span>
      {value === null ? (
        <span style={{ color: 'var(--text-hint)', fontSize: 'var(--text-caption)' }}>not enough yet</span>
      ) : (
        <>
          <span style={{ width: 140, height: 8, background: 'var(--paper-deep)', borderRadius: 4 }}>
            <span
              style={{
                display: 'block',
                width: `${Math.round(value * 100)}%`,
                height: '100%',
                background: 'var(--teal)',
                borderRadius: 4,
              }}
            />
          </span>
          <span style={{ width: 44, textAlign: 'right', fontWeight: 600, color: 'var(--text-strong)', fontSize: 'var(--text-body)' }}>
            {Math.round(value * 100)}%
          </span>
        </>
      )}
    </div>
  );
}
