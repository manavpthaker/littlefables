import { describe, expect, it } from 'vitest';
import { segmentPage } from '@/lib/narration/segment';

describe('segmentPage', () => {
  it('returns a single narrator segment when no quotes present', () => {
    const segs = segmentPage('The moss was soft and the streams sang.', ['Bramble']);
    expect(segs.length).toBe(1);
    expect(segs[0]?.speaker).toBeNull();
    expect(segs[0]?.quoted).toBe(false);
    expect(segs[0]?.endsWith).toBe('.');
  });

  it('splits narrator / quoted / narrator around a single dialogue', () => {
    const segs = segmentPage('Bramble waved. "Hello!" he called into the trees.', ['Bramble']);
    expect(segs.map((s) => s.quoted)).toEqual([false, true, false]);
    expect(segs[1]?.text).toBe('Hello!');
    expect(segs[1]?.endsWith).toBe('!');
    expect(segs[1]?.reportingVerb).toBe('called');
  });

  it('attributes speaker from "X said" pattern before the quote', () => {
    const segs = segmentPage('Mose whispered, "It is alright."', ['Mose', 'Bramble']);
    expect(segs[1]?.speaker).toBe('Mose');
    expect(segs[1]?.reportingVerb).toBe('whispered');
  });

  it('attributes speaker from "said X" pattern after the quote', () => {
    const segs = segmentPage('"Hello, little one," the grizzly said, gently.', ['Grizzly']);
    // Speaker "grizzly" IS in characterNames — should match.
    const q = segs.find((s) => s.quoted);
    expect(q?.reportingVerb).toBe('said');
    expect(q?.speaker).toBe('Grizzly');
  });

  it('does not identify a speaker outside characterNames', () => {
    const segs = segmentPage('"Boo!" Wolf yelped.', ['Bramble']);
    const q = segs.find((s) => s.quoted);
    expect(q?.speaker).toBeNull();
    expect(q?.reportingVerb).toBe('yelped');
  });

  it('handles multiple quotes on one page', () => {
    const segs = segmentPage(
      '"Hello!" Bramble called. The fox stared. "Hi," said Bramble again.',
      ['Bramble'],
    );
    const quotes = segs.filter((s) => s.quoted);
    expect(quotes.length).toBe(2);
    expect(quotes[0]?.text).toBe('Hello!');
    expect(quotes[0]?.reportingVerb).toBe('called');
    expect(quotes[1]?.text).toBe('Hi,');
    expect(quotes[1]?.reportingVerb).toBe('said');
    expect(quotes[1]?.speaker).toBe('Bramble');
  });

  it('recognizes curly quotes too', () => {
    const segs = segmentPage('“Hello!” she called.', ['Anna']);
    const q = segs.find((s) => s.quoted);
    expect(q).toBeDefined();
    expect(q?.text).toBe('Hello!');
    expect(q?.endsWith).toBe('!');
    expect(q?.reportingVerb).toBe('called');
  });

  it('endsWith captures ellipsis and question mark on each quote', () => {
    const segs = segmentPage('"What if…" she asked, "he doesn\'t hear?"', ['She']);
    const quotes = segs.filter((s) => s.quoted);
    expect(quotes.length).toBe(2);
    expect(quotes[0]?.endsWith).toBe('…');
    expect(quotes[1]?.endsWith).toBe('?');
  });
});
