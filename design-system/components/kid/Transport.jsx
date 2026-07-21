import React from 'react';
import { IconButton } from '../core/Button.jsx';
// Reader transport. Invariants (PRD A3): play never navigates; prev/next never auto-play.
export function Transport({ playing, onPlay, onPrev, onNext, canPrev = true, canNext = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', justifyContent: 'center' }}>
      <IconButton name="chevron-left" label="Back a page" utterance="Back a page" variant="capsule"
        onClick={onPrev} style={{ opacity: canPrev ? 1 : 0.4, width: 44, height: 44, background: 'var(--paper-deep)' }} />
      <IconButton name={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Read to me'}
        utterance={playing ? 'Taking a rest' : 'Here we go!'} size="primary" variant="primary" onClick={onPlay}
        style={{ width: 58, height: 58, background: 'linear-gradient(135deg,var(--marigold),var(--marigold-deep))', boxShadow: '0 8px 22px rgba(217,130,43,.45)' }} />
      <IconButton name="chevron-right" label="Next page" utterance="Next page" variant="capsule"
        onClick={onNext} style={{ opacity: canNext ? 1 : 0.4, width: 44, height: 44, background: 'var(--paper-deep)' }} />
    </div>
  );
}
