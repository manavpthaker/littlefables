import { describe, expect, it } from 'vitest';
import { applyPronunciations, mergePronunciations } from '@/lib/narration/pronunciations';

describe('mergePronunciations', () => {
  it('lowercases keys for case-insensitive lookup', () => {
    const merged = mergePronunciations({ Azi: 'Ah-zee', DADA: 'Daa-daa' });
    expect(merged['azi']).toBe('Ah-zee');
    expect(merged['dada']).toBe('Daa-daa');
  });

  it('drops _-prefixed comment keys', () => {
    const merged = mergePronunciations({ _comment: 'ignored', Azi: 'Ah-zee' });
    expect(merged._comment).toBeUndefined();
    expect(merged['azi']).toBe('Ah-zee');
  });

  it('later layers override earlier ones', () => {
    const merged = mergePronunciations({ Azi: 'Ah-zee' }, { azi: 'Ah-zeeee' });
    expect(merged['azi']).toBe('Ah-zeeee');
  });
});

describe('applyPronunciations', () => {
  const dict = mergePronunciations({ Azi: 'Ah-zee', Jujy: 'Joo-jee', Dada: 'Daa-daa' });

  it('replaces at word boundary — Titlecase preserved', () => {
    expect(applyPronunciations('Azi ran to Dada.', dict)).toBe('Ah-zee ran to Daa-daa.');
  });

  it('does not touch words that only contain the key as a substring', () => {
    // 'Azimuth' contains 'Azi' but isn't a whole-word match — should be untouched.
    expect(applyPronunciations('The Azimuth was clear.', dict)).toBe('The Azimuth was clear.');
  });

  it('handles possessive apostrophe (word boundary still fires)', () => {
    expect(applyPronunciations("Azi's shoe.", dict)).toBe("Ah-zee's shoe.");
  });

  it('preserves ALL CAPS on the source', () => {
    expect(applyPronunciations('AZI!', dict)).toBe('AH-ZEE!');
  });

  it('preserves lowercase on the source', () => {
    expect(applyPronunciations('come here, azi.', dict)).toBe('come here, ah-zee.');
  });

  it('no-ops on empty dict or empty text', () => {
    expect(applyPronunciations('Anything at all.', {})).toBe('Anything at all.');
    expect(applyPronunciations('', dict)).toBe('');
  });

  it('handles multiple matches in one pass', () => {
    expect(applyPronunciations('Azi and Jujy waved to Dada.', dict)).toBe(
      'Ah-zee and Joo-jee waved to Daa-daa.',
    );
  });
});
