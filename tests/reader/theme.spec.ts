import { describe, expect, it, vi } from 'vitest';
import { bookThemeCss, contrastRatio } from '@/lib/reader/theme';

describe('contrastRatio', () => {
  it('returns 21 for black on white (max contrast)', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('returns 1 for the same color (no contrast)', () => {
    expect(contrastRatio('#7f7f7f', '#7f7f7f')).toBeCloseTo(1, 2);
  });

  it('is symmetric — order of args does not change the result', () => {
    const a = contrastRatio('#241812', '#f2e6d0');
    const b = contrastRatio('#f2e6d0', '#241812');
    expect(a).toBeCloseTo(b, 4);
  });

  it('handles 3-digit hex (#rgb)', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0);
  });

  it('returns 0 for invalid input (caller can bail)', () => {
    expect(contrastRatio('not-a-color', '#fff')).toBe(0);
  });
});

describe('bookThemeCss', () => {
  it('emits scoped custom-property overrides for a valid theme', () => {
    const css = bookThemeCss('midnight-train', {
      paper: '#1e1a2e',
      ink: '#f2e6d0',
      accent: '#e9b64c',
      hush: '#7a6f52',
    });
    expect(css).not.toBeNull();
    expect(css).toContain('[data-book-id="midnight-train"]:not([data-mode="night"])');
    expect(css).toContain('--surface-page: #1e1a2e');
    expect(css).toContain('--ink: #f2e6d0');
    expect(css).toContain('--action: #e9b64c');
    expect(css).toContain('--ink-soft: #7a6f52');
  });

  it('returns null for an undefined theme', () => {
    expect(bookThemeCss('any', undefined)).toBeNull();
  });

  it('returns null and warns when ink/paper contrast fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Both near-white — well below 4.5:1.
    const css = bookThemeCss('bad-book', { paper: '#f8f8f8', ink: '#e0e0e0' });
    expect(css).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('emits a partial theme when only some fields are set', () => {
    const css = bookThemeCss('accent-only', { accent: '#c9772d' });
    expect(css).not.toBeNull();
    expect(css).toContain('--action: #c9772d');
    expect(css).not.toContain('--surface-page');
    expect(css).not.toContain('--ink:');
  });

  it('strips non-safe chars from the book id in the selector', () => {
    const css = bookThemeCss('bad id"] { color: red }', {
      paper: '#000000',
      ink: '#ffffff',
    });
    expect(css).not.toBeNull();
    // The injected id should not carry the escape/injection chars into
    // the selector — otherwise a hostile id could break out.
    expect(css).not.toContain('bad id"]');
    expect(css).not.toContain('color: red');
    expect(css).toContain('[data-book-id="badidcolorred"]:not([data-mode="night"])');
  });
});
