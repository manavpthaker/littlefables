import { describe, expect, it } from 'vitest';
import { evaluateBadges } from '@/lib/world/badges';
import { worldStateSchema } from '@/lib/world/types';

function world(overrides: Partial<{ booksOpened: number; wordsSaved: number; daysRead: number }> = {}) {
  return worldStateSchema.parse({
    growth: {
      booksOpened: 0,
      wordsSaved: 0,
      daysRead: 0,
      checkpointsAsked: 0,
      checkpointsCorrect: 0,
      ...overrides,
    },
  });
}

describe('badge evaluators', () => {
  it('empty world qualifies for no badges', () => {
    expect(evaluateBadges({
      world: world(),
      readingDaysCount: 0,
      hasSavedWord: false,
      hasCorrectCheckpoint: false,
    })).toEqual([]);
  });

  it('first-book-opened fires at booksOpened >= 1', () => {
    expect(
      evaluateBadges({
        world: world({ booksOpened: 1 }),
        readingDaysCount: 0,
        hasSavedWord: false,
        hasCorrectCheckpoint: false,
      }),
    ).toContain('first-book-opened');
  });

  it('first-word-saved fires on the flag', () => {
    expect(
      evaluateBadges({
        world: world(),
        readingDaysCount: 0,
        hasSavedWord: true,
        hasCorrectCheckpoint: false,
      }),
    ).toContain('first-word-saved');
  });

  it('3-day and 7-day streaks stack', () => {
    const got = evaluateBadges({
      world: world({ booksOpened: 5 }),
      readingDaysCount: 8,
      hasSavedWord: true,
      hasCorrectCheckpoint: false,
    });
    expect(got).toContain('reading-streak-3');
    expect(got).toContain('reading-streak-7');
    expect(got).toContain('first-book-opened');
    expect(got).toContain('first-word-saved');
  });

  it('checkpoint badge requires the flag', () => {
    expect(
      evaluateBadges({
        world: world(),
        readingDaysCount: 0,
        hasSavedWord: false,
        hasCorrectCheckpoint: true,
      }),
    ).toContain('first-checkpoint-correct');
  });
});
