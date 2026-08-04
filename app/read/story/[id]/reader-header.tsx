'use client';

// Reader header — replaces the DS ReaderTopBar + separate secondary chrome
// strip with one responsive block. Scales three ways:
//   Portrait phone   — title full width, chapter chip on its own row
//   Landscape short  — compact icons, everything on one line
//   Desktop / tablet — spacious, chapter title beside book title
//
// Slots (left → right, all optional per page shape):
//   [X back]  [book title + chapter title + segment dots]  [☀/🌙 toggle]
//   [📖 All chapters]  (chapter books, mid-chapter only, second row)

export interface ReaderHeaderProps {
  bookTitle: string;
  chapterTitle: string | null;
  segments?: { current: number; total: number };
  isNight: boolean;
  onBack: () => void;
  onToggleMode: () => void;
  onBackToMap?: (() => void) | null;
}

export function ReaderHeader({
  bookTitle,
  chapterTitle,
  segments,
  isNight,
  onBack,
  onToggleMode,
  onBackToMap,
}: ReaderHeaderProps) {
  return (
    <header
      className="lf-reader-header"
      style={{
        flex: 'none',
        padding: 'var(--space-3) var(--page-pad) var(--space-2)',
        borderBottom: '1px solid transparent',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Close the book"
          className="lf-reader-header__back"
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'var(--wash-capsule)',
            color: 'var(--ink)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow-rest)',
          }}
        >
          ×
        </button>

        <div style={{ minWidth: 0, display: 'grid', gap: 2, textAlign: 'center' }}>
          <span
            className="lf-reader-header__title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              lineHeight: 1.15,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 700,
            }}
          >
            {bookTitle}
          </span>
          {chapterTitle && (
            <span
              className="lf-reader-header__chapter"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                letterSpacing: '.14em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chapterTitle}
            </span>
          )}
          {segments && segments.total > 1 && (
            <span
              aria-label={`Page ${segments.current + 1} of ${segments.total}`}
              style={{
                display: 'inline-flex',
                gap: 4,
                justifyContent: 'center',
                marginTop: 2,
              }}
            >
              {Array.from({ length: Math.min(segments.total, 12) }, (_, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{
                    width: i === segments.current ? 16 : 5,
                    height: 5,
                    borderRadius: 3,
                    background:
                      i === segments.current
                        ? 'var(--brass)'
                        : i < segments.current
                          ? 'var(--forest)'
                          : 'var(--paper-deep)',
                    transition: 'width 200ms ease',
                  }}
                />
              ))}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          aria-label={isNight ? 'Switch to daytime reading' : 'Switch to bedtime reading'}
          aria-pressed={isNight}
          className="lf-reader-header__mode"
          style={{
            border: 'none',
            cursor: 'pointer',
            background: 'var(--wash-capsule)',
            color: 'var(--ink)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
            fontFamily: 'inherit',
            boxShadow: isNight ? '0 0 0 2px var(--brass)' : 'var(--shadow-rest)',
          }}
        >
          {isNight ? '🌙' : '☀️'}
        </button>
      </div>

      {onBackToMap && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <button
            type="button"
            onClick={onBackToMap}
            aria-label="Back to the chapter map"
            style={{
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--ink-soft)',
              fontFamily: 'inherit',
              fontSize: 12,
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span aria-hidden>📖</span> All chapters
          </button>
        </div>
      )}
    </header>
  );
}
