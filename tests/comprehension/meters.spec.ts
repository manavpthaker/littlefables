import { describe, expect, it } from 'vitest';
import { computeMeters } from '@/lib/comprehension/meters';

// Meters (brief §III.5): correct=1, partial=0.5, mercy=0, skipped excluded;
// retell scored by beat coverage; null (not 0) when there's no data.

describe('computeMeters', () => {
  it('empty in → all null, no fake zeros', () => {
    const m = computeMeters([]);
    expect(m.literal).toBeNull();
    expect(m.inferential).toBeNull();
    expect(m.retell).toBeNull();
    expect(m.summary).toBeNull();
  });

  it('scores signals and buckets the brief rungs', () => {
    const m = computeMeters([
      { questionType: 'recall', judgedSignal: 'correct' },
      { questionType: 'recall', judgedSignal: 'partial' },
      { questionType: 'inference', judgedSignal: 'correct' },
      { questionType: 'prediction', judgedSignal: 'mercy_given' },
      { questionType: 'connection', judgedSignal: 'partial' },
    ]);
    expect(m.literal).toBeCloseTo(0.75);
    expect(m.inferential).toBeCloseTo((1 + 0 + 0.5) / 3);
    expect(m.levels.recall).toBeCloseTo(0.75);
    expect(m.levels.prediction).toBe(0);
  });

  it('skipped rows carry no signal', () => {
    const m = computeMeters([
      { questionType: 'recall', judgedSignal: 'skipped' },
      { questionType: 'recall', judgedSignal: 'correct' },
    ]);
    expect(m.literal).toBe(1);
  });

  it('retell scores by beat coverage when the spine exists', () => {
    const m = computeMeters([
      {
        questionType: 'retell',
        judgedSignal: 'partial',
        payload: { beats: ['a', 'b', 'c'], beatsHit: [0, 2] },
      },
    ]);
    expect(m.retell).toBeCloseTo(2 / 3);
  });

  it('retell falls back to signal scoring without a spine', () => {
    const m = computeMeters([{ questionType: 'retell', judgedSignal: 'correct', payload: { beats: [], beatsHit: [] } }]);
    expect(m.retell).toBe(1);
  });

  it('summary names the strongest and weakest rungs honestly', () => {
    const m = computeMeters([
      { questionType: 'recall', judgedSignal: 'correct' },
      { questionType: 'inference', judgedSignal: 'mercy_hint' },
      { questionType: 'retell', judgedSignal: 'partial', payload: { beats: ['a', 'b'], beatsHit: [0] } },
    ]);
    expect(m.summary).toBe('Strong on what happened; still growing why and how.');
  });

  it('even growth reads as even', () => {
    const m = computeMeters([
      { questionType: 'recall', judgedSignal: 'correct' },
      { questionType: 'inference', judgedSignal: 'correct' },
    ]);
    expect(m.summary).toBe('Growing evenly across the ladder.');
  });
});
