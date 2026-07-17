import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
// Continue-where-you-left-off card (Home's most-used surface). Kid density only. Works identically offline.
export function ContinueCard({ title, chapter, cover, progress = 0, utterance, onContinue }) {
  return (
    <div data-utterance={utterance || `Keep reading ${title}!`} style={{
      display: 'flex', gap: 'var(--space-4)', alignItems: 'center', background: 'var(--paper-bright)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elev-card)', padding: 'var(--space-4)',
    }}>
      <div style={{ width: 76, flex: 'none' }}>
        <div style={{
          aspectRatio: '3/4', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--elev-rest)',
          background: cover ? `url(${cover}) center/cover` : 'radial-gradient(90% 80% at 30% 25%,#9db6cc,transparent 70%),radial-gradient(70% 90% at 75% 75%,#c9a06a,transparent 70%),#a8b89a',
        }}>
          {progress > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 7, background: 'rgba(70,54,42,.25)' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--marigold)', borderRadius: '0 4px 4px 0' }}></div>
          </div>}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1.2, color: 'var(--ink)' }}>{title}</div>
        {chapter && <div style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--text-hand)', color: 'var(--ink-soft)', marginTop: 4 }}>{chapter}</div>}
        <Button variant="primary" icon="book-open" utterance={utterance || `Keep reading ${title}!`} onClick={onContinue}
          style={{ marginTop: 'var(--space-3)' }}>Keep reading</Button>
      </div>
    </div>
  );
}
