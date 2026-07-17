import { describe, expect, it } from 'vitest';
import { assembleCheckpointPrompt, pickType, type QuestionType } from '@/lib/prompts/templates/checkpoint';

describe('pickType — deterministic rotation', () => {
  it('starts with recall when no history', () => {
    expect(pickType([])).toBe('recall');
  });

  it('avoids the most-recent type', () => {
    const t: QuestionType = pickType(['recall']);
    expect(t).not.toBe('recall');
  });

  it('rotates across all four types over a full cycle', () => {
    // Simulate 4 turns. Each turn we ask the picked type + push it onto the
    // head of the history. All 4 types should appear over 4 iterations.
    const seen = new Set<QuestionType>();
    let history: QuestionType[] = [];
    for (let i = 0; i < 4; i++) {
      const next = pickType(history);
      seen.add(next);
      history = [next, ...history].slice(0, 4);
    }
    expect(seen.size).toBe(4);
  });
});

describe('assembleCheckpointPrompt structure', () => {
  it('includes the 7 labeled steps', () => {
    const out = assembleCheckpointPrompt({
      book: { title: "Bramble's Hello", kind: 'quick' },
      chapterTitle: 'The Little Round Door',
      chapterIdx: 0,
      pagesText: 'Bramble stepped into the meadow. He was scared, but he waved.',
      band: '4-8',
      recentTypes: [],
      savedWords: ['brave'],
    });
    expect(out.requestedType).toBe('recall');
    expect(out.system).toContain('# 1. Role');
    expect(out.system).toContain('# 2. Universe canon');
    expect(out.system).toContain('# 4. Hard constraints');
    expect(out.system).toContain('type: recall');
    expect(out.system).toContain('4-8');
    expect(out.user).toContain("Bramble's Hello");
    expect(out.user).toContain('Chapter 1');
    expect(out.user).toContain('brave');
    expect(out.cacheKey).toContain('checkpoint');
    expect(out.cacheKey).toContain('recall');
  });
});
