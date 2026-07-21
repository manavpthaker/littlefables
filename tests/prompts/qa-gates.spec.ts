import { describe, expect, it } from 'vitest';
import { runStage0, decideStatus, MAX_GEN_ATTEMPTS } from '@/lib/prompts';
import type { Book } from '@/lib/models/book';

function bookWith(text: string): Book {
  return {
    id: 'test',
    title: 't',
    kind: 'quick',
    source: 'generated',
    status: 'checking',
    teachingGoals: [],
    vocab: [],
    retellPrompts: [],
    beats: [],
    parentGuide: null,
    originNote: null,
    chapters: [{ title: 'c1', pages: [{ text }] }],
  };
}

describe('runStage0 — excludeTerms gate', () => {
  it('passes clean text', () => {
    const r = runStage0(bookWith('a small paper boat drifted on the puddle'), {
      excludeTerms: ['guns', 'monsters'],
    });
    expect(r.passed).toBe(true);
    expect(r.violations).toHaveLength(0);
  });

  it('catches an excluded term (case-insensitive, word-boundary)', () => {
    const r = runStage0(bookWith('the toy Guns rattled in the box'), {
      excludeTerms: ['guns'],
    });
    expect(r.passed).toBe(false);
    expect(r.violations[0]?.gate).toBe('excluded_term');
  });

  it('does not flag substrings (guns should not match "gunslinger" inside another word)', () => {
    const r = runStage0(bookWith('The dogsled crossed the mountain'), {
      excludeTerms: ['gun'],
    });
    expect(r.passed).toBe(true);
  });
});

describe('decideStatus — PRD C3a contract', () => {
  it('stage-0 failure = blocked (never ships)', () => {
    expect(
      decideStatus({ stage0Passed: false, hardGatesPassed: true, attempts: 1, maxAttempts: 2 }),
    ).toBe('blocked');
  });

  it('judge unavailable = unverified, not passed (audit S2)', () => {
    expect(
      decideStatus({ stage0Passed: true, hardGatesPassed: null, attempts: 1, maxAttempts: 2 }),
    ).toBe('unverified');
  });

  it('C3a: hard-gate failure on final attempt = blocked, not needs-review', () => {
    expect(
      decideStatus({
        stage0Passed: true,
        hardGatesPassed: false,
        attempts: MAX_GEN_ATTEMPTS,
        maxAttempts: MAX_GEN_ATTEMPTS,
      }),
    ).toBe('blocked');
  });

  it('hard-gate failure with attempts remaining = needs-review (regen path)', () => {
    expect(
      decideStatus({ stage0Passed: true, hardGatesPassed: false, attempts: 1, maxAttempts: 2 }),
    ).toBe('needs-review');
  });

  it('happy path = passed', () => {
    expect(
      decideStatus({ stage0Passed: true, hardGatesPassed: true, attempts: 1, maxAttempts: 2 }),
    ).toBe('passed');
  });
});
