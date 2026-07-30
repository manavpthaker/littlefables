'use client';

import { useEffect, useRef } from 'react';

// Pared-back story text — one job: render tappable words with a live
// highlight that scrolls itself into view so no line disappears off the
// bottom of the reader on a long page. No star affordance, no word save,
// no keep-it — the whole word interaction is: tap = the reader decides
// (seek if playing, speak-and-remember if paused).

const stem = (w: string): string =>
  w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();

export interface StoryWord {
  w: string;
}

export function StoryText({
  words,
  currentIndex = -1,
  dimUpcoming = true,
  onHearWord,
}: {
  words: StoryWord[];
  /** -1 = nothing highlighted. */
  currentIndex?: number;
  /** True while narration is moving — dims the not-yet-spoken words so the
   *  eye follows the voice. Idle pages read as plain book pages. */
  dimUpcoming?: boolean;
  onHearWord?: (word: string, wordIdx: number) => void;
}) {
  const currentRef = useRef<HTMLSpanElement | null>(null);

  // Auto-scroll the current word into view. `nearest` block alignment keeps
  // the word visible without jumping; only fires when the highlight moves.
  useEffect(() => {
    if (currentIndex < 0) return;
    const el = currentRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [currentIndex]);

  return (
    <p
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-reading)',
        lineHeight: 'var(--lh-reading)',
        color: 'var(--ink)',
        margin: 0,
      }}
    >
      {words
        .map((t, i) => {
          const isCurrent = i === currentIndex;
          const state = isCurrent ? 'current' : i < currentIndex ? 'spoken' : 'upcoming';
          return (
            <span
              key={i}
              ref={isCurrent ? currentRef : null}
              role="button"
              tabIndex={0}
              aria-label={`Hear ${t.w}`}
              onClick={() => onHearWord?.(stem(t.w), i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onHearWord?.(stem(t.w), i);
                }
              }}
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                borderRadius: 'var(--word-current-radius, 6px)',
                padding: isCurrent ? 'var(--word-current-pad, 0.06em 0.2em)' : '0.06em 0.04em',
                margin: '.14em 0',
                background: isCurrent ? 'var(--word-current-bg, rgba(251,217,138,.55))' : 'transparent',
                color:
                  state === 'upcoming' && dimUpcoming
                    ? 'var(--word-upcoming-ink, var(--ink-soft))'
                    : 'var(--word-spoken-ink, var(--ink))',
                transition:
                  'background var(--dur-tap, 140ms) var(--ease-settle, ease), color var(--dur-settle, 280ms) var(--ease-settle, ease)',
              }}
            >
              {t.w}
            </span>
          );
        })
        // Restore inter-word spaces between the inline-block spans.
        .reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
    </p>
  );
}
