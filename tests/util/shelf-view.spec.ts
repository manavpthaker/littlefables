import { describe, expect, it } from 'vitest';
import { defaultView } from '@/lib/util/shelf-view';

describe('defaultView', () => {
  it('gives a new buyer the single-cover view', () => {
    // A custom order ships one book. One cover in a grid reads as an empty shop.
    expect(defaultView(1)).toBe('single');
    expect(defaultView(3)).toBe('single');
  });

  it('switches to a grid once there is a shelf to look at', () => {
    expect(defaultView(4)).toBe('grid');
    expect(defaultView(24)).toBe('grid');
  });

  it('falls back to a list when a grid would be all scrolling', () => {
    expect(defaultView(25)).toBe('list');
    expect(defaultView(200)).toBe('list');
  });

  it('does not fall over on an empty shelf', () => {
    expect(defaultView(0)).toBe('single');
  });
});
