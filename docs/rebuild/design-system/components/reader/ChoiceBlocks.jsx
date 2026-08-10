import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Sheet } from './Sheet.jsx';
// Story choices: A / B / "tell me YOUR idea" (always last, always mic).
const tints = ['var(--river-wash)', 'var(--sage-wash)'];
const edges = ['var(--river)', 'var(--sage)'];
export function ChoiceBlocks({ options = [], onPick, onIdea, compact = false, sheet = false }) {
  const pad = compact ? 'var(--space-3) var(--space-4)' : 'var(--space-5)';
  const fs = compact ? 19 : 22;
  const blocks = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--tap-gap)', width: compact ? 'auto' : '100%' }}>
      {options.map((o, i) => (
        <button key={i} data-utterance={o.label} onClick={() => onPick && onPick(i)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: 'var(--tap-standard)',
          background: tints[i % 2], border: `2px solid ${edges[i % 2]}`, borderRadius: 'var(--radius-lg)',
          padding: pad, fontFamily: 'var(--font-body)', fontSize: fs, color: 'var(--ink)', cursor: 'pointer',
          textAlign: 'left', boxShadow: 'var(--elev-rest)', transition: 'transform var(--dur-tap) var(--ease-settle)',
        }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(.97)'}
        onPointerUp={e => e.currentTarget.style.transform = ''}>
          {o.icon && <Icon name={o.icon} size={24} color={edges[i % 2]} />}{o.label}
        </button>
      ))}
      {onIdea && (
        <button data-utterance="Tell me YOUR idea!" onClick={onIdea} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: 'var(--tap-standard)',
          background: 'var(--terracotta-wash)', border: '2px dashed var(--terracotta)', borderRadius: 'var(--radius-lg)',
          padding: pad, fontFamily: 'var(--font-hand)', fontSize: fs + 3, color: 'var(--terracotta)', cursor: 'pointer',
          boxShadow: 'var(--elev-rest)',
        }}>
          <Icon name="mic" size={24} color="var(--terracotta)" />tell me YOUR idea!
        </button>
      )}
    </div>
  );
  if (!sheet) return blocks;
  // over-art: delegate to the standalone Sheet pattern (sheet may be true or a speech string)
  return <Sheet speech={typeof sheet === 'string' ? sheet : undefined}>{blocks}</Sheet>;
}
