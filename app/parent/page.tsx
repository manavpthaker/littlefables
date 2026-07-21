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
  const childId = await firstChildIdInHousehold();

  // Fresh-install empty state: without a child, every Insights query filters
  // by child_id='' and returns zeros — the dashboard looks broken and there
  // is no CTA to fix it. Short-circuit into a warm empty-state hero that
  // points at Settings (where AddChildForm lives).
  if (!childId) {
    return (
      <main style={{ display: 'grid', gap: 'var(--space-5)', maxWidth: 640 }}>
        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--wash-panel)',
            display: 'grid',
            gap: 'var(--space-3)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              margin: 0,
              fontSize: 'var(--text-display)',
              color: 'var(--text-strong)',
            }}
          >
            Add your first child to begin
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
            Insights show up here once a child is reading — words they keep,
            comprehension meters, minutes, the weekly bridge line. Add a
            child and send them to a device to start.
          </p>
          <a
            href="/parent/settings"
            style={{
              justifySelf: 'start',
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--action)',
              color: 'var(--paper)',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Add a child →
          </a>
        </div>
      </main>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            aria-hidden="true"
            style={{
              width: 60,
              height: 60,
              flex: 'none',
              borderRadius: 18,
              background: 'linear-gradient(150deg, color-mix(in oklch, var(--plum) 60%, white), var(--plum))',
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              boxShadow: 'var(--elev-rest)',
            }}
          >
            {/* Insights sigil (kept honest regardless of gate state — the
                padlock emoji misrepresented what this surface actually is;
                the gate restoration lives in a separate slice). */}
            📊
          </span>
          <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-display)',
                margin: 0,
                color: 'var(--text-strong)',
              }}
            >
              Parent space
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
              Manage stories, see how understanding is growing.
            </p>
          </div>
        </div>
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
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          The real question: is he <em>understanding</em>, not just listening?
        </p>
        <RungRow label="Literal — what happened" value={meters.literal} grad="linear-gradient(90deg,#8FB07A,var(--sage))" />
        <RungRow label="Inferential — why & how" value={meters.inferential} grad="linear-gradient(90deg,var(--teal),var(--plum))" />
        <RungRow label="Retell — tells it back" value={meters.retell} grad="linear-gradient(90deg,var(--marigold),var(--ember))" />
        <ComprehensionProfile
          summary={meters.summary ?? 'Not enough checkpoints yet to see a pattern.'}
          levels={meters.levels}
        />
      </section>

      <InsightsCards bridgeLine={weekly.bridgeLine} layers={weekly.layers} />

      <ComprehensionSection records={comprehension} />
      <WordbookSection entries={wordbook} />
      <SunsParent earned={earnedIdx} today={todayIdx} />
    </main>
  );
}

function RungRow({ label, value, grad }: { label: string; value: number | null; grad: string }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--text-strong)' }}>{label}</span>
        {value === null ? (
          <span style={{ color: 'var(--text-hint)', fontSize: 'var(--text-caption)' }}>not enough yet</span>
        ) : (
          <span style={{ fontWeight: 700, color: 'var(--plum)', fontSize: 'var(--text-body)' }}>
            {Math.round(value * 100)}%
          </span>
        )}
      </div>
      <div style={{ height: 10, background: 'var(--paper-deep)', borderRadius: 5 }}>
        {value !== null && (
          <div
            style={{
              width: `${Math.round(value * 100)}%`,
              height: '100%',
              background: grad,
              borderRadius: 5,
            }}
          />
        )}
      </div>
    </div>
  );
}
