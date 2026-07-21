'use client';

// Shared bottom-sheet chrome for checkpoint + retell (mockup-fidelity):
// scrimmed backdrop, white sheet with rounded top, chapter progress segments,
// centered buddy circle (action-gradient), and the quiet "Skip for now" exit
// that gates nothing.

export function SheetShell({
  segments,
  buddyColor = 'var(--teal)',
  buddyEmoji,
  listening = false,
  onSkip,
  skipLabel = 'Skip for now',
  children,
}: {
  segments?: { current: number; total: number };
  buddyColor?: string;
  buddyEmoji?: string;
  listening?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 45,
        display: 'grid',
        alignItems: 'end',
        justifyItems: 'center',
        background: 'var(--scrim-bottom)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '92dvh',
          overflowY: 'auto',
          background: 'var(--paper-bright)',
          borderRadius: '28px 28px 0 0',
          boxShadow: 'var(--elev-float)',
          padding: 'var(--space-5) var(--space-5) var(--space-6)',
          boxSizing: 'border-box',
          display: 'grid',
          gap: 'var(--space-4)',
          justifyItems: 'stretch',
          animation: 'lf-page-in var(--dur-settle) var(--ease-settle) 1',
        }}
      >
        {segments && segments.total > 1 && (
          <div aria-hidden="true" style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {Array.from({ length: Math.min(segments.total, 8) }, (_, i) => (
              <span
                key={i}
                style={{
                  width: 34,
                  height: 6,
                  borderRadius: 4,
                  background: i < segments.current ? 'var(--sage)' : i === segments.current ? 'var(--marigold)' : 'var(--paper-deep)',
                }}
              />
            ))}
          </div>
        )}

        <span
          aria-hidden="true"
          style={{
            justifySelf: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(150deg, color-mix(in oklch, ${buddyColor} 55%, white), ${buddyColor})`,
            display: 'grid',
            placeItems: 'center',
            fontSize: 32,
            boxShadow: listening ? '0 0 0 4px var(--river), var(--elev-card)' : 'var(--elev-card)',
            animation: 'lf-breath var(--dur-breath) var(--ease-drift) infinite',
          }}
        >
          {buddyEmoji ?? '🐈'}
        </span>

        {children}

        {onSkip && (
          <button
            type="button"
            data-utterance="We can do it another time."
            onClick={onSkip}
            style={{
              justifySelf: 'center',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-hand)',
              fontSize: 17,
              color: 'var(--ink-faint)',
              padding: 'var(--space-2) var(--space-4)',
              minHeight: 'var(--tap-min)',
            }}
          >
            {skipLabel}
          </button>
        )}
      </div>
    </section>
  );
}

export function SheetEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        justifySelf: 'center',
        fontFamily: 'var(--font-hand)',
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: 'var(--ember)',
      }}
    >
      {children}
    </span>
  );
}
