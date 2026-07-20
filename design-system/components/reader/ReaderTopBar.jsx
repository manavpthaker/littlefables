import React from 'react';
import { IconButton } from '../core/Button.jsx';
import { Buddy } from '../kid/Buddy.jsx';
import { WordCapsule } from '../kid/WordCapsule.jsx';
import { StateBanner } from '../system/SystemStates.jsx';
// Reader chrome: the persistent top bar inside the sanctioned top scrim.
// Layout: capsule back · WordCapsule landing slot (center) · quiet sync capsule + compact Buddy (right).
export function ReaderTopBar({ onBack, savedWord, justSaved, onWordTap, syncing = false, buddyColor = 'var(--teal)', buddyEmoji, buddyState = 'idle' }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 0 40px', background: 'var(--scrim-top)' }}>
      {/* Constrain to the reading column so on wide screens the back button and
          Buddy sit at the content edges, not flung to the far screen corners. */}
      <div style={{ maxWidth: 'var(--reader-measure, 760px)', margin: '0 auto', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <IconButton name="home" label="Back home" utterance="Back to your shelf" variant="capsule" size="small" onClick={onBack} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {savedWord && <WordCapsule word={savedWord} justSaved={justSaved} onTap={onWordTap} />}
        </div>
        {syncing && <StateBanner state="syncing" density="kid" />}
        <Buddy compact size={48} color={buddyColor} emoji={buddyEmoji} state={buddyState} />
      </div>
    </div>
  );
}
