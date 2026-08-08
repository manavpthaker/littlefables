'use client';

import { useMemo, useState } from 'react';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';
import { InstallSteps, useAddToHomeScreen } from './install-prompt';

// The book's front and back boards.
//
// CoverPage — every open starts here, the way a physical book starts at its
// cover. It matters most for shared links, which land a stranger directly on
// a story: the cover says "this is a book someone made" before any page text.
// Tapping the art (or ›) opens to the first page.
//
// EndPage — the closing leaf after the last page: The End, the mark drawing
// itself in, and the site. This is the one place the brand is allowed a
// moment of its own — the story is over, so it competes with nothing.

export function CoverPage({
  title,
  art,
  isNight,
  onOpen,
  controls,
}: {
  title: string;
  art?: string;
  isNight: boolean;
  onOpen: () => void;
  controls?: React.ReactNode;
}) {
  const showArt = Boolean(art) && !isNight;

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: showArt ? 'minmax(0, 1fr) auto auto' : '1fr auto',
        position: 'relative',
      }}
    >
      {showArt && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${title}`}
          style={{
            position: 'relative',
            minHeight: 0,
            overflow: 'hidden',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            background: 'var(--paper-deep)',
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `url(${art}) center/cover no-repeat`,
              animation: 'lf-art-in var(--motion-chime) var(--ease-pendulum) both',
            }}
          />
        </button>
      )}

      <button
        type="button"
        onClick={onOpen}
        style={{
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'grid',
          gap: 6,
          justifyItems: 'center',
          alignContent: 'center',
          textAlign: 'center',
          padding: showArt
            ? 'var(--space-5) var(--page-pad) var(--space-3)'
            : 'var(--space-6) var(--page-pad)',
          color: 'var(--ink)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sc, var(--font-body))',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
          }}
        >
          Little Fables
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 5vw, 40px)',
            lineHeight: 1.15,
            maxWidth: 'var(--reader-measure)',
          }}
        >
          {title}
        </span>
        <span
          style={{
            marginTop: 8,
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--ink-faint)',
          }}
        >
          tap to open
        </span>
      </button>

      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          padding: '0 var(--page-pad) var(--space-5)',
        }}
      >
        {controls}
      </div>
    </main>
  );
}

const endButton: React.CSSProperties = {
  border: '1px solid var(--pill-edge)',
  borderRadius: 'var(--radius-pill)',
  background: 'transparent',
  color: 'var(--oxblood-text)',
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  padding: '10px 22px',
  cursor: 'pointer',
};

export function EndPage({
  onReadAgain,
  controls,
}: {
  onReadAgain: () => void;
  controls?: React.ReactNode;
}) {
  const install = useAddToHomeScreen();
  const [showSteps, setShowSteps] = useState(false);

  // Held in a stable element so React never reconciles the mark's subtree.
  // drawIn is a mount-time CSS animation: without this, revealing the
  // install steps re-ran the whole 1.5s redraw of the logo, which is its
  // own small jolt at exactly the moment that should be still.
  const mark = useMemo(
    () => <Wordmark layout="mark-only" markSize={104} drawIn animated />,
    [],
  );

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      <div
        style={{
          minHeight: 0,
          display: 'grid',
          justifyItems: 'center',
          alignContent: 'center',
          gap: 'var(--space-4)',
          textAlign: 'center',
          padding: '0 var(--page-pad)',
          color: 'var(--ink)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>The End</span>
        {mark}
        <a
          href="https://littlefables.app"
          style={{
            fontFamily: 'var(--font-sc, var(--font-body))',
            fontSize: 13,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-soft)',
            textDecoration: 'none',
          }}
        >
          littlefables.app
        </a>
        <div
          style={{
            marginTop: 'var(--space-2)',
            display: 'grid',
            gap: 'var(--space-2)',
            justifyItems: 'center',
          }}
        >
          <button type="button" onClick={onReadAgain} style={endButton}>
            Read it again
          </button>
          {install.available && (
            <button
              type="button"
              onClick={() => {
                if (install.needsManualSteps) setShowSteps((s) => !s);
                else void install.promptNative();
              }}
              aria-expanded={install.needsManualSteps ? showSteps : undefined}
              style={endButton}
            >
              Keep it on the home screen
            </button>
          )}
          {showSteps && install.needsManualSteps && <InstallSteps />}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          padding: '0 var(--page-pad) var(--space-5)',
        }}
      >
        {controls}
      </div>
    </main>
  );
}
