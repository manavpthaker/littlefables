import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Badge shelf. Locked = silhouette with promise (never a padlock, never gray-disabled).
export function BadgeShelf({ badges, onTap }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
      {badges.map((b, i) => (
        <button key={i} data-utterance={b.earned ? `${b.name}! You earned this ${b.when || ''}` : "Something's waiting for you here…"}
          onClick={() => onTap && onTap(i)} style={{
            width: 76, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center',
            background: b.earned ? `radial-gradient(70% 70% at 35% 30%, color-mix(in oklch, ${b.color || 'var(--marigold)'} 50%, white), ${b.color || 'var(--marigold)'})` : 'var(--paper-deep)',
            boxShadow: b.earned ? 'var(--elev-card)' : 'var(--inset-well)',
          }}>
            <Icon name={b.icon} size={30} color={b.earned ? '#FBF4E6' : 'rgba(70,54,42,.28)'} />
          </div>
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: b.earned ? 16 : 13, color: b.earned ? 'var(--ink)' : 'var(--ink-faint)', textAlign: 'center', maxWidth: 96, lineHeight: 1.25 }}>{b.earned ? b.name : (b.hint || 'soon…')}</span>
        </button>
      ))}
    </div>
  );
}
