import { describe, expect, it } from 'vitest';
import { composeSaveUtterance, composeWordUtterance } from '@/lib/reader/word-speech';

// Collectable-word speech (redesign brief / PRD A9): authored vocab teaches
// (word, syllables, kid definition); unauthored words still confirm warmly.

const entry = {
  word: 'burrow',
  meaning: 'a hole in the ground where an animal lives',
  syllables: ['bur', 'row'],
  kidDefinition: 'A burrow is a cozy hole a rabbit digs',
};

describe('composeWordUtterance', () => {
  it('teaches with syllables + kid definition when authored', () => {
    expect(composeWordUtterance('burrow', entry)).toBe(
      'burrow. bur — row. A burrow is a cozy hole a rabbit digs.',
    );
  });

  it('falls back to meaning when kidDefinition is absent', () => {
    expect(composeWordUtterance('burrow', { word: 'burrow', meaning: 'a cozy hole' })).toBe(
      'burrow. a cozy hole.',
    );
  });

  it('just says the word when nothing is authored', () => {
    expect(composeWordUtterance('burrow')).toBe('burrow.');
  });

  it('skips a single-syllable list (nothing to teach)', () => {
    expect(composeWordUtterance('vast', { word: 'vast', meaning: 'really big', syllables: ['vast'] })).toBe(
      'vast. really big.',
    );
  });
});

describe('composeSaveUtterance', () => {
  it('teaches then confirms the keep', () => {
    expect(composeSaveUtterance('burrow', entry)).toBe(
      'burrow! bur — row. A burrow is a cozy hole a rabbit digs. burrow is in your word book!',
    );
  });

  it('still confirms without vocab', () => {
    expect(composeSaveUtterance('wiggly')).toBe('wiggly! wiggly is in your word book!');
  });
});
