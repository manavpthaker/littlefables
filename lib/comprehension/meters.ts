// Parent comprehension meters (brief §III.5 / PRD A11): aggregate the
// checkpoint + retell record stream into per-rung levels and one honest
// plain-language line. Pure — table-testable. Scoring: correct = 1,
// partial = 0.5, mercy = 0; 'skipped' rows are excluded (no signal, not a
// failure). null = no data yet — parents see "not enough yet", never a fake 0.

import type { QuestionType } from '@/lib/models/checkpoint';

export interface MeterRecord {
  questionType: string;
  judgedSignal: string | null;
  /** retell rows: { beats: string[], beatsHit: number[] } */
  payload?: unknown;
}

export interface Meters {
  /** 0..1 per generated-question type — feeds the DS ComprehensionProfile bars */
  levels: Partial<Record<QuestionType, number>>;
  /** brief's three rungs: literal=recall, inferential=inference+prediction+connection */
  literal: number | null;
  inferential: number | null;
  /** retell = beat coverage when spine data exists, else signal scoring */
  retell: number | null;
  summary: string | null;
}

function scoreOf(signal: string | null): number | null {
  if (signal === 'correct') return 1;
  if (signal === 'partial') return 0.5;
  if (signal === 'mercy_hint' || signal === 'mercy_given') return 0;
  return null; // skipped / unanswered — no signal
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

const GENERATED_TYPES: QuestionType[] = ['recall', 'inference', 'prediction', 'connection'];

export function computeMeters(records: MeterRecord[]): Meters {
  const byType = new Map<string, number[]>();
  const retellScores: number[] = [];

  for (const r of records) {
    if (r.questionType === 'retell') {
      const payload = r.payload as { beats?: unknown[]; beatsHit?: unknown[] } | null;
      const total = Array.isArray(payload?.beats) ? payload.beats.length : 0;
      if (total > 0 && Array.isArray(payload?.beatsHit)) {
        retellScores.push(Math.min(1, payload.beatsHit.length / total));
      } else {
        const s = scoreOf(r.judgedSignal);
        if (s !== null) retellScores.push(s);
      }
      continue;
    }
    const s = scoreOf(r.judgedSignal);
    if (s === null) continue;
    const list = byType.get(r.questionType) ?? [];
    list.push(s);
    byType.set(r.questionType, list);
  }

  const levels: Partial<Record<QuestionType, number>> = {};
  for (const t of GENERATED_TYPES) {
    const avg = average(byType.get(t) ?? []);
    if (avg !== null) levels[t] = avg;
  }

  const literal = average(byType.get('recall') ?? []);
  const inferential = average([
    ...(byType.get('inference') ?? []),
    ...(byType.get('prediction') ?? []),
    ...(byType.get('connection') ?? []),
  ]);
  const retell = average(retellScores);

  return { levels, literal, inferential, retell, summary: composeSummary({ literal, inferential, retell }) };
}

const RUNG_LABELS: Array<[key: 'literal' | 'inferential' | 'retell', label: string]> = [
  ['literal', 'what happened'],
  ['inferential', 'why and how'],
  ['retell', 'telling it back'],
];

function composeSummary(rungs: { literal: number | null; inferential: number | null; retell: number | null }): string | null {
  const known = RUNG_LABELS.filter(([k]) => rungs[k] !== null).map(([k, label]) => ({ key: k, label, value: rungs[k] as number }));
  if (known.length === 0) return null;
  if (known.length === 1) {
    const only = known[0]!;
    return `Early days — so far the signal is about ${only.label}.`;
  }
  const sorted = [...known].sort((a, b) => b.value - a.value);
  const strongest = sorted[0]!;
  const weakest = sorted[sorted.length - 1]!;
  if (strongest.value - weakest.value < 0.15) {
    return 'Growing evenly across the ladder.';
  }
  return `Strong on ${strongest.label}; still growing ${weakest.label}.`;
}
