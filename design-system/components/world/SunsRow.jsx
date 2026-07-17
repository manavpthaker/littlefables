import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Reading-day suns for the week. Days never turn off once earned (PRD B3).
// Pre-reader surface: NO letter labels — position + voice carry the meaning. Today = marigold ring + breath (terracotta is reserved for tappable actions).
const DAY_COUNT = 7;
export function SunsRow({ earned = [], today = 0, justEarned }) {
  return (
    <div data-utterance={`${earned.length} reading days this week!`} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      {Array.from({ length: DAY_COUNT }).map((_, i) => {
        const on = earned.includes(i), isToday = i === today;
        return (
          <div key={i} style={{
              width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: on ? 'var(--marigold)' : 'var(--paper-deep)',
              boxShadow: on ? '0 0 14px rgba(227,154,50,.55)' : 'var(--inset-well)',
              outline: isToday ? '3px solid var(--marigold)' : 'none', outlineOffset: 3,
              animation: justEarned === i ? 'lf-bloom var(--dur-bloom) var(--ease-settle) 1' : isToday ? 'lf-breath var(--dur-breath) var(--ease-drift) infinite' : 'none',
            }}>
            <Icon name="sun" size={22} color={on ? '#FBF4E6' : 'var(--ink-faint)'} />
          </div>
        );
      })}
    </div>
  );
}
