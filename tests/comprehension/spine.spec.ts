import { describe, expect, it } from 'vitest';
import { matchBeats, mergeHits } from '@/lib/comprehension/spine';

const BEATS = [
  'Ember was scared of the dark',
  'He made his own little light',
  'He felt brave and cozy',
];

describe('matchBeats', () => {
  it('hits beats whose content words the child used', () => {
    // Keyword layer is deliberately conservative: "a dragon was scared" has
    // only 1 of beat 0's 3 content stems (ember/scared/dark) — the semantic
    // judge is what maps "dragon"→Ember; results merge. "light" fully covers
    // beat 1's single content stem.
    expect(matchBeats('a dragon was scared and then he made a light', BEATS)).toEqual([1]);
    expect(matchBeats('he was scared of the dark', BEATS)).toEqual([0]);
  });

  it('full retell hits every beat', () => {
    expect(
      matchBeats('Ember was scared of the dark so he made his own light and felt brave and cozy', BEATS),
    ).toEqual([0, 1, 2]);
  });

  it('empty or off-topic speech hits nothing', () => {
    expect(matchBeats('', BEATS)).toEqual([]);
    expect(matchBeats('um banana tractor', BEATS)).toEqual([]);
  });

  it('half-of-content-words is enough (messy kid speech)', () => {
    // "brave" + "cozy" = 2 of the beat's content stems {felt, brave, cozy} → ceil(3/2)=2 → hit
    expect(matchBeats('he was brave and cozy', BEATS)).toContain(2);
  });
});

describe('mergeHits', () => {
  it('unions and sorts across turns/sources', () => {
    expect(mergeHits([2, 0], [1, 2], [])).toEqual([0, 1, 2]);
  });

  it('empty in, empty out', () => {
    expect(mergeHits([], [])).toEqual([]);
  });
});
