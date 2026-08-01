import { describe, expect, it } from 'vitest';
import { compareTitles, titleSortKey } from '@/lib/util/sort-title';

describe('titleSortKey', () => {
  it('strips leading "The" for alphabetization', () => {
    expect(titleSortKey('The Midnight Train')).toBe('midnight train');
  });

  it('strips leading "A" and "An" too', () => {
    expect(titleSortKey('A Little Story')).toBe('little story');
    expect(titleSortKey('An Adventure')).toBe('adventure');
  });

  it('is case-insensitive on the article', () => {
    expect(titleSortKey('the moose')).toBe('moose');
    expect(titleSortKey('THE MOOSE')).toBe('moose');
  });

  it('does not strip "the" mid-title', () => {
    expect(titleSortKey('Bramble and the Bees')).toBe('bramble and the bees');
  });

  it('does not strip a word that only starts with "the"', () => {
    expect(titleSortKey('Theodore')).toBe('theodore');
    expect(titleSortKey('Andrea')).toBe('andrea');
  });

  it('trims surrounding whitespace', () => {
    expect(titleSortKey('  The Bear  ')).toBe('bear');
  });
});

describe('compareTitles', () => {
  it('sorts a book collection library-style', () => {
    const titles = [
      "Bramble's Hello",
      'The Midnight Train',
      'A Little Song',
      'The Moose Who Knew About Bigness',
      'An Adventure with Papa',
      'Word Collector',
    ];
    const sorted = [...titles].sort(compareTitles);
    expect(sorted).toEqual([
      'An Adventure with Papa',
      "Bramble's Hello",
      'A Little Song',
      'The Midnight Train',
      'The Moose Who Knew About Bigness',
      'Word Collector',
    ]);
  });
});
