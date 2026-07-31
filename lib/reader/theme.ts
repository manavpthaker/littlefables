import type { BookTheme } from '@/lib/models/book';

// Per-book theming. Small, deliberate surface — the goal is atmospheric
// immersion, not visual chaos. Four hex fields fan out to the ~8 CSS
// custom properties the reader chrome actually reads.
//
// Night mode always wins: emitted CSS is scoped to
// `[data-book-id="..."]:not([data-mode="night"])` so the reader's night
// palette overrides any per-book theme when bedtime is on. Bedtime
// pacing is protected — a book that's already dark shouldn't get
// double-darkened when a kid should be winding down.

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/** Parse a CSS hex color (#rgb / #rgba / #rrggbb / #rrggbbaa) into
 *  0-255 RGB. Returns null on any other format so caller can bail. */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!HEX.test(hex)) return null;
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

/** WCAG 2.x relative luminance. Value in [0, 1]. */
function luminance(rgb: { r: number; g: number; b: number }): number {
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(rgb.r) + 0.7152 * chan(rgb.g) + 0.0722 * chan(rgb.b);
}

/** WCAG contrast ratio in the range 1..21. Higher = better legibility. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return 0;
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG "AA large" threshold, appropriate for the reader's display-serif
 *  body copy at 21px+. AAA (7:1) would rule out warm authored palettes
 *  that read fine in practice; 4.5 is the honest floor. */
const MIN_CONTRAST = 4.5;

/** Validate a theme against the safety checks: ink must be legible on
 *  paper. Returns { ok, reason } — if not ok, caller drops the theme
 *  and logs the reason (so the author knows to tune the palette). */
export function validateTheme(theme: BookTheme): { ok: true } | { ok: false; reason: string } {
  if (!theme.paper && !theme.ink) return { ok: true }; // nothing to validate
  if (theme.paper && theme.ink) {
    const ratio = contrastRatio(theme.paper, theme.ink);
    if (ratio < MIN_CONTRAST) {
      return {
        ok: false,
        reason: `ink vs paper contrast ${ratio.toFixed(2)}:1 — need ≥ ${MIN_CONTRAST}:1`,
      };
    }
  }
  return { ok: true };
}

/** Emit a `<style>` body that overrides the reader's CSS custom properties
 *  for a given book id. Returns null when the theme is empty/invalid — the
 *  reader can safely `dangerouslySetInnerHTML` this without wrapping.
 *
 *  Selector scoped to `:not([data-mode="night"])` so night mode wins.
 *  Everything else specificity-wise is a plain attribute selector, matching
 *  the tier the base tokens live in. */
export function bookThemeCss(bookId: string, theme: BookTheme | undefined): string | null {
  if (!theme) return null;
  const check = validateTheme(theme);
  if (!check.ok) {
    // Fail-soft: no theme, but tell the author why.
    if (typeof console !== 'undefined') {
      console.warn(`[book-theme] ${bookId} theme rejected: ${check.reason}`);
    }
    return null;
  }

  const lines: string[] = [];
  const push = (prop: string, val: string | undefined) => {
    if (val) lines.push(`  ${prop}: ${val};`);
  };

  // paper → page background + card washes that read as paper
  push('--surface-page', theme.paper);
  push('--paper', theme.paper);

  // ink → body text
  push('--ink', theme.ink);
  push('--text-strong', theme.ink);
  push('--text-body', theme.ink);

  // accent → eyebrow, current-word highlight, play button
  push('--action', theme.accent);
  push('--marigold', theme.accent);
  push('--marigold-deep', theme.accent);

  // hush → upcoming-word dim, captions
  push('--ink-soft', theme.hush);
  push('--text-muted', theme.hush);
  push('--word-upcoming-ink', theme.hush);

  if (lines.length === 0) return null;

  // Escape the book id for a CSS attribute selector. Book ids are
  // kebab-case slugs today; the escape is belt-and-braces.
  const safeId = bookId.replace(/[^a-z0-9-_]/gi, '');
  return `[data-book-id="${safeId}"]:not([data-mode="night"]) {\n${lines.join('\n')}\n}`;
}
