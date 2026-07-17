import { describe, expect, it } from 'vitest';
import { audioMatchesText } from '@/lib/reader/audio-cache';
import type { WordTimestamp } from '@/lib/reader/speech';

function ts(words: string[]): WordTimestamp[] {
  return words.map((w, i) => ({ word: w, start: i * 0.2, end: i * 0.2 + 0.15 }));
}

// Audio-cache staleness verification is the guard that keeps a stale text
// revision from serving mismatched-highlight audio. Contract must be exact.
describe('audioMatchesText', () => {
  it('matches identical text', () => {
    const text = 'The paper boat sailed on';
    expect(audioMatchesText(ts(text.split(' ')), text)).toBe(true);
  });

  it('is case-insensitive + punctuation-tolerant', () => {
    expect(audioMatchesText(ts(['The', 'PAPER', 'boat.']), 'the paper Boat')).toBe(true);
  });

  it('fails when a word is added', () => {
    expect(audioMatchesText(ts(['a', 'b', 'c']), 'a b c d')).toBe(false);
  });

  it('fails when a word is changed', () => {
    expect(audioMatchesText(ts(['a', 'b', 'c']), 'a b d')).toBe(false);
  });

  it('handles multiple whitespace characters', () => {
    expect(audioMatchesText(ts(['a', 'b']), 'a\n\nb')).toBe(true);
  });
});
