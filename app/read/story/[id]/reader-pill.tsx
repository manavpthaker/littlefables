'use client';

// The reader's only persistent control: one capsule at the foot of the words.
//
// It replaces a full-width footer that ran the whole width of the screen,
// including under the illustration. Anchoring it to the text column keeps the
// picture completely uninterrupted, which is the point of the layout.
//
// Everything rarely reached for — back, chapters, playback speed — lives
// behind the mark button beside it rather than on the page.

export interface ReaderPillProps {
  playing: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Shown inside the capsule; the page's only wayfinding. */
  label: string | null;
  /** 0–1 through the current page's narration. Null hides the rule. */
  progress: number | null;
}

export function ReaderPill({
  playing,
  canPrev,
  canNext,
  onPlay,
  onPrev,
  onNext,
  label,
  progress,
}: ReaderPillProps) {
  // 44px is the smallest comfortable touch target, and these are aimed at a
  // five-year-old. The glyph is oversized inside it so the arrow reads at a
  // glance rather than needing to be hunted for.
  const step: React.CSSProperties = {
    border: 'none',
    background: 'transparent',
    color: 'var(--ink)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 26,
    lineHeight: 1,
    flex: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div
      className="lf-pill"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '7px 16px 7px 8px',
        borderRadius: 999,
        background: 'var(--wash-capsule)',
        border: '1px solid var(--pill-edge)',
        boxShadow: 'var(--shadow-rest)',
      }}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page"
        style={{ ...step, opacity: canPrev ? 1 : 0.3, cursor: canPrev ? 'pointer' : 'default' }}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={onPlay}
        aria-label={playing ? 'Pause' : 'Read to me'}
        style={{
          border: 'none',
          cursor: 'pointer',
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: 'var(--oxblood)',
          color: 'var(--on-oxblood)',
          display: 'grid',
          placeItems: 'center',
          flex: 'none',
          boxShadow: 'var(--shadow-rest)',
        }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
            <rect x="2" y="1.5" width="3" height="11" rx="0.5" fill="currentColor" />
            <rect x="9" y="1.5" width="3" height="11" rx="0.5" fill="currentColor" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false" style={{ marginLeft: 1.5 }}>
            <path d="M3 1.5 L12 7 L3 12.5 Z" fill="currentColor" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page"
        style={{ ...step, opacity: canNext ? 1 : 0.3, cursor: canNext ? 'pointer' : 'default' }}
      >
        ›
      </button>

      {label && (
        <span
          style={{
            display: 'grid',
            gap: 5,
            marginLeft: 8,
            minWidth: 0,
            flex: 1,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--ink-soft)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {label}
          </span>
          {progress !== null && (
            <span
              aria-hidden
              style={{
                height: 2,
                borderRadius: 2,
                background: 'var(--pill-edge)',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`,
                  background: 'var(--brass)',
                  transition: 'width var(--motion-tick) linear',
                }}
              />
            </span>
          )}
        </span>
      )}
    </div>
  );
}
