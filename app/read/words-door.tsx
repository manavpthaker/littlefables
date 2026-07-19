'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@ds/components/core/Icon.jsx';

// Home doorway to the Word Book (PRD A9 follow-through) — makes the star-save
// loop legible: words saved in stories visibly live somewhere he can revisit.
// Capsule pattern (wash-capsule = kid-tappable surface; terracotta stays
// reserved for the primary action per rules-of-use).

export function WordsDoor({ count }: { count: number }) {
  const router = useRouter();
  if (count === 0) return null;
  return (
    <button
      data-utterance="Your word book"
      onClick={() => router.push('/read/words')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        border: 'none',
        cursor: 'pointer',
        background: 'var(--wash-capsule)',
        backdropFilter: 'blur(14px)',
        borderRadius: 'var(--radius-pill)',
        padding: '8px 16px 8px 12px',
        minHeight: 'var(--tap-min)',
        boxShadow: 'var(--elev-card)',
        fontFamily: 'var(--font-hand)',
        fontSize: 'var(--text-hand)',
        color: 'var(--ink)',
      }}
    >
      <Icon name="star" size={18} color="var(--marigold)" fill="currentColor" />
      {count} {count === 1 ? 'word' : 'words'} kept
    </button>
  );
}
