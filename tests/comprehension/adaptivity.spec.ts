import { describe, expect, it } from 'vitest';
import { computeAdaptivity, rollingAccuracy } from '@/lib/comprehension/adaptivity';

// Adaptivity (brief §IV.3): auto steps on rolling accuracy (≥0.8 up, ≤0.4
// down, needs ≥4 answered signals); ease/stretch pin one band step; rich
// vocab needs both accuracy AND word-keeping appetite.

const HITS = ['correct', 'correct', 'partial', 'correct', 'correct'];
const MISSES = ['mercy_given', 'mercy_hint', 'skipped', 'mercy_given', 'partial', 'mercy_hint'];

describe('rollingAccuracy', () => {
  it('needs at least 4 answered signals', () => {
    expect(rollingAccuracy(['correct', 'correct', 'correct'])).toBeNull();
    expect(rollingAccuracy(['correct', 'correct', 'correct', 'skipped'])).toBeNull();
  });

  it('skipped rows are ignored, not zeros', () => {
    expect(rollingAccuracy(['correct', 'skipped', 'correct', 'correct', 'correct'])).toBe(1);
  });
});

describe('computeAdaptivity — auto', () => {
  it('cruising steps the band up and unlocks rich vocab with keeping appetite', () => {
    const a = computeAdaptivity({ baseBand: '4-6', readingLevel: 'auto', recentSignals: HITS, recentKeeps: 5 });
    expect(a.effectiveBand).toBe('4-8');
    expect(a.vocabDensity).toBe('rich');
  });

  it('cruising without word appetite stays standard density', () => {
    const a = computeAdaptivity({ baseBand: '4-6', readingLevel: 'auto', recentSignals: HITS, recentKeeps: 1 });
    expect(a.effectiveBand).toBe('4-8');
    expect(a.vocabDensity).toBe('standard');
  });

  it('struggling steps down and gentles the vocabulary', () => {
    const a = computeAdaptivity({ baseBand: '4-8', readingLevel: 'auto', recentSignals: MISSES, recentKeeps: 4 });
    expect(a.effectiveBand).toBe('4-6');
    expect(a.vocabDensity).toBe('gentle');
  });

  it('thin signal holds steady', () => {
    const a = computeAdaptivity({ baseBand: '4-8', readingLevel: 'auto', recentSignals: ['correct'], recentKeeps: 0 });
    expect(a.effectiveBand).toBe('4-8');
    expect(a.vocabDensity).toBe('standard');
    expect(a.accuracy).toBeNull();
  });
});

describe('computeAdaptivity — parent pins', () => {
  it('ease pins one step down + gentle, whatever the signals say', () => {
    const a = computeAdaptivity({ baseBand: '4-8', readingLevel: 'ease', recentSignals: HITS, recentKeeps: 9 });
    expect(a.effectiveBand).toBe('4-6');
    expect(a.vocabDensity).toBe('gentle');
  });

  it('stretch pins one step up + rich', () => {
    const a = computeAdaptivity({ baseBand: '4-6', readingLevel: 'stretch', recentSignals: MISSES, recentKeeps: 0 });
    expect(a.effectiveBand).toBe('4-8');
    expect(a.vocabDensity).toBe('rich');
  });

  it('band steps clamp at the edges', () => {
    expect(computeAdaptivity({ baseBand: '3-4', readingLevel: 'ease', recentSignals: [], recentKeeps: 0 }).effectiveBand).toBe('3-4');
    expect(computeAdaptivity({ baseBand: '6-8', readingLevel: 'stretch', recentSignals: [], recentKeeps: 0 }).effectiveBand).toBe('6-8');
  });
});
