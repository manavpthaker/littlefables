import React from 'react';
import { IconButton } from '../core/Button.jsx';
import { Buddy } from '../kid/Buddy.jsx';
import { WordCapsule } from '../kid/WordCapsule.jsx';
import { StateBanner } from '../system/SystemStates.jsx';
// Reader chrome (mockup-fidelity): X close · caps book/chapter label + page
// segments · compact Buddy. In normal flow (the art is a card now, not a
// full-bleed backdrop). A just-starred word takes over the center slot while
// it blooms; the quiet sync capsule's ONLY reader placement stays here.
export function ReaderTopBar({ onBack, title, segments, savedWord, justSaved, onWordTap, syncing = false, buddyColor = 'var(--teal)', buddyEmoji, buddyState = 'idle' }) {
  return (
    <div style={{ padding: '14px 0 6px' }}>
      <div style={{ maxWidth: 'var(--reader-measure, 760px)', margin: '0 auto', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <IconButton name="x" label="Close the book" utterance="Back to your shelf" variant="capsule" size="small" onClick={onBack} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)' }}>
          {savedWord ? (
            <WordCapsule word={savedWord} justSaved={justSaved} onTap={onWordTap} />
          ) : (
            <>
              {title && (
                <span style={{
                  fontFamily: 'var(--font-hand)', fontSize: 14, fontWeight: 700, letterSpacing: '.12em',
                  textTransform: 'uppercase', color: 'var(--marigold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{title}</span>
              )}
              {segments && segments.total > 1 && (
                <span aria-hidden="true" style={{ display: 'inline-flex', gap: 4, flex: 'none' }}>
                  {Array.from({ length: Math.min(segments.total, 8) }, (_, i) => (
                    <span key={i} style={{
                      width: i === segments.current ? 18 : 7, height: 7, borderRadius: 4,
                      background: i === segments.current ? 'var(--marigold)' : i < segments.current ? 'var(--sage)' : 'var(--paper-deep)',
                      transition: 'width var(--dur-settle) var(--ease-settle)',
                    }}></span>
                  ))}
                </span>
              )}
            </>
          )}
        </div>
        {syncing && <StateBanner state="syncing" density="kid" />}
        <Buddy compact size={44} color={buddyColor} emoji={buddyEmoji} state={buddyState} />
      </div>
    </div>
  );
}
