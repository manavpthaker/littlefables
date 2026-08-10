import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
// Prompt-first story maker (PRD C1): one big input + one length question + Make It. Never a wizard.
export function StoryMaker({ placeholder = 'What should this story be about?', defaultLength = 'quick', onMake, onSpeak }) {
  const [text, setText] = useState('');
  const [len, setLen] = useState(defaultLength);
  const [more, setMore] = useState(false);
  return (
    <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink)', maxWidth: 480 }}>
      <div style={{ position: 'relative' }}>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder={placeholder} rows={3} style={{
          width: '100%', boxSizing: 'border-box', resize: 'none', background: 'var(--paper-bright)',
          border: 'var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: '16px 52px 16px 16px',
          fontFamily: 'var(--font-body)', fontSize: 19, lineHeight: 1.45, color: 'var(--ink)', boxShadow: 'var(--inset-well)',
        }} />
        <button onClick={onSpeak} aria-label="Speak your idea" style={{ position: 'absolute', right: 10, top: 10, width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--river)', background: 'transparent', color: 'var(--river)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="mic" size={18} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        {[['quick', 'Quick story', '~5 min'], ['chapter', 'Chapter book', 'a longer one']].map(([v, l, s]) => (
          <button key={v} onClick={() => setLen(v)} style={{
            flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
            border: len === v ? '2px solid var(--terracotta)' : 'var(--border-soft)',
            background: len === v ? 'var(--terracotta-wash)' : 'var(--paper-bright)',
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', color: 'var(--ink)',
          }}><b>{l}</b><br /><span style={{ color: 'var(--ink-soft)', fontSize: 'var(--text-caption)' }}>{s}</span></button>
        ))}
      </div>
      <Button variant="primary" icon="wand-2" onClick={() => onMake && onMake({ prompt: text, length: len })} style={{ width: '100%' }}>Make it</Button>
      <button onClick={() => setMore(!more)} style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', margin: '10px auto 0', display: 'block', cursor: 'pointer' }}>
        {more ? '− less control' : '+ more control (pin a hero, setting, or goal)'}
      </button>
      {more && <div style={{ marginTop: 8, padding: 12, background: 'var(--paper-deep)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>
        Optional pins — the universe canon fills in everything you leave blank.
      </div>}
    </div>
  );
}
