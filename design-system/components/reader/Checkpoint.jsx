import React from 'react';
import { Buddy } from '../kid/Buddy.jsx';
import { MicOrb } from '../kid/MicOrb.jsx';
import { ChoiceBlocks } from './ChoiceBlocks.jsx';
import { Button } from '../core/Button.jsx';
// Checkpoint: buddy asks a story question, child answers by voice or taps options. Conversational, never quiz-styled (PRD A10).
const typeTint = { recall: 'var(--river-wash)', inference: 'var(--plum-wash)', prediction: 'var(--marigold-wash)', connection: 'var(--sage-wash)' };
export function Checkpoint({ buddyName = 'Buddy', buddyColor = 'var(--teal)', type = 'recall', question, options, micState = 'idle', mercy = false, hint, given, onMic, onPick, onMoveOn }) {
  const stage = mercy === true ? 'hint' : mercy; // 'hint' | 'given' | false
  return (
    <div style={{ background: 'var(--paper-bright)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--elev-float)', padding: 'var(--space-6)', maxWidth: 420 }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
        <Buddy compact size={64} color={buddyColor} state={micState === 'listening' ? 'listening' : 'speaking'} />
        <div style={{ background: typeTint[type] || 'var(--river-wash)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 6, padding: 'var(--space-4) var(--space-5)', fontFamily: 'var(--font-body)', fontSize: 22, lineHeight: 1.4, color: 'var(--ink)' }}
          data-utterance={question}>{question}</div>
      </div>
      {stage === 'hint' && hint && (
        <div style={{ marginTop: 'var(--space-4)', background: 'var(--butter-wash)', boxShadow: '0 0 0 3px var(--butter)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-hand)', fontSize: 21, color: 'var(--ink)' }}
          data-utterance={hint}>{hint}</div>
      )}
      {stage === 'given' && (given || hint) && (
        <div style={{ marginTop: 'var(--space-4)', background: 'var(--butter-wash)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 20, color: 'var(--ink)' }}
          data-utterance={given || hint}>{given || hint}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
        <MicOrb state={micState} onTap={onMic} utterance="Tell me what you think!" />
        {options && <ChoiceBlocks options={options} onPick={onPick} compact />}
      </div>
      {stage && onMoveOn && (
        <Button variant="soft" icon="arrow-right" utterance="Let's find out together!" onClick={onMoveOn}
          style={{ marginTop: 'var(--space-4)', width: '100%' }}>The story moves on</Button>
      )}
    </div>
  );
}
