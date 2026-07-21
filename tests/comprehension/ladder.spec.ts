import { describe, expect, it } from 'vitest';
import { pickRung } from '@/lib/comprehension/ladder';
import type { QuestionType } from '@/lib/models/checkpoint';

// Ladder policy (brief §IV.1): literal early → inferential mid → predictive
// late; connection as a cruising bonus; two misses step down; single-chapter
// (quick) books stay literal.

const noHistory = { recentSignals: [], recentTypes: [] as QuestionType[] };

describe('pickRung — position on the ladder', () => {
  it('quick books (one chapter) ask literal', () => {
    expect(pickRung({ chapterIdx: 0, chapterCount: 1, ...noHistory })).toBe('recall');
  });

  it.each([
    [0, 6, 'recall'],
    [1, 6, 'recall'],
    [2, 6, 'inference'],
    [3, 6, 'inference'],
    [4, 6, 'prediction'],
    [5, 6, 'prediction'],
  ] as const)('chapter %i of %i → %s', (chapterIdx, chapterCount, expected) => {
    expect(pickRung({ chapterIdx, chapterCount, ...noHistory })).toBe(expected);
  });
});

describe('pickRung — adaptivity', () => {
  it('two consecutive misses step the rung down', () => {
    expect(
      pickRung({
        chapterIdx: 5,
        chapterCount: 6,
        recentSignals: ['mercy_given', 'skipped'],
        recentTypes: [],
      }),
    ).toBe('inference');
    expect(
      pickRung({
        chapterIdx: 2,
        chapterCount: 6,
        recentSignals: ['mercy_hint', 'mercy_given'],
        recentTypes: [],
      }),
    ).toBe('recall');
  });

  it('recall never steps below recall', () => {
    expect(
      pickRung({
        chapterIdx: 0,
        chapterCount: 6,
        recentSignals: ['skipped', 'skipped'],
        recentTypes: [],
      }),
    ).toBe('recall');
  });

  it('one miss alone does not step down', () => {
    expect(
      pickRung({
        chapterIdx: 4,
        chapterCount: 6,
        recentSignals: ['mercy_given', 'correct'],
        recentTypes: [],
      }),
    ).toBe('prediction');
  });

  it('cruising mid-book earns the connection bonus', () => {
    expect(
      pickRung({
        chapterIdx: 3,
        chapterCount: 6,
        recentSignals: ['correct', 'partial', 'correct'],
        recentTypes: ['inference', 'recall'],
      }),
    ).toBe('connection');
  });

  it('no connection bonus when one was asked recently', () => {
    expect(
      pickRung({
        chapterIdx: 3,
        chapterCount: 6,
        recentSignals: ['correct', 'correct', 'correct'],
        recentTypes: ['connection', 'recall'],
      }),
    ).toBe('inference');
  });

  it('no connection bonus while struggling', () => {
    expect(
      pickRung({
        chapterIdx: 3,
        chapterCount: 6,
        recentSignals: ['mercy_hint', 'correct', 'correct'],
        recentTypes: ['recall'],
      }),
    ).toBe('inference');
  });
});
