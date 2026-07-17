'use client';

import { CheckpointTranscript } from '@ds/components/parent/CheckpointTranscript.jsx';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';

export interface ComprehensionRecordView {
  id: string;
  question: string;
  questionType: 'recall' | 'inference' | 'prediction' | 'connection';
  transcript: string | null;
  judgedSignal: 'correct' | 'partial' | 'mercy_hint' | 'mercy_given' | 'skipped' | null;
  askedAt: string;
}

function mapAttempts(record: ComprehensionRecordView) {
  if (!record.transcript) return [];
  const judged =
    record.judgedSignal === 'correct'
      ? 'correct'
      : record.judgedSignal === 'partial' || record.judgedSignal === 'mercy_hint' || record.judgedSignal === 'mercy_given'
      ? 'accepted'
      : 'miss';
  return [{ transcript: record.transcript, judged: judged as 'correct' | 'accepted' | 'miss' }];
}

function outcomeText(signal: ComprehensionRecordView['judgedSignal']): string {
  switch (signal) {
    case 'correct':
      return 'answered clearly';
    case 'partial':
      return 'close idea, accepted';
    case 'mercy_hint':
      return 'buddy offered a hint';
    case 'mercy_given':
      return 'answer moved on with the buddy';
    case 'skipped':
      return 'no answer captured';
    default:
      return 'no answer yet';
  }
}

export function ComprehensionSection({ records }: { records: ComprehensionRecordView[] }) {
  if (records.length === 0) {
    return (
      <section>
        <SectionHeader>Comprehension</SectionHeader>
        <p style={{ color: 'var(--ink-soft)' }}>No checkpoints yet.</p>
      </section>
    );
  }
  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Comprehension</SectionHeader>
      {records.map((r) => (
        <CheckpointTranscript
          key={r.id}
          type={r.questionType}
          question={r.question}
          attempts={mapAttempts(r)}
          outcome={outcomeText(r.judgedSignal)}
          signal={`${r.questionType}: ${r.judgedSignal ?? '—'}`}
          when={new Date(r.askedAt).toLocaleString()}
        />
      ))}
    </section>
  );
}
