'use client';

import { useCallback } from 'react';
import { ChoiceBlocks } from '@ds/components/reader/ChoiceBlocks.jsx';
import type { ReaderPage } from '@/lib/reader/types';

// Interactive page renderer (PRD A4). Handles choice + breathe. Ask blocks
// currently degrade to a lightweight "your idea" prompt — full voice-answer
// wiring lives with the Checkpoint flow and can be reused in a follow-up.

interface Props {
  page: ReaderPage;
  bookId: string;
  chapterIdx: number;
  pageIdx: number;
  onChoice: (label: string, summary: string) => void;
  onBreatheDone: () => void;
  onAsk: () => void;
}

export function InteractivePage(props: Props) {
  const { page } = props;

  const onPick = useCallback(
    (index: number) => {
      if (!page.choice) return;
      const opt = page.choice.options[index];
      if (!opt) return;
      props.onChoice(opt.label, opt.summary);
    },
    [page, props],
  );

  if (page.choice) {
    return (
      <div style={{ padding: 'var(--space-4)' }}>
        <p style={{ fontFamily: 'var(--font-body)', textAlign: 'center', marginBottom: 'var(--space-3)' }}>
          {page.choice.prompt}
        </p>
        <ChoiceBlocks
          options={page.choice.options.map((o) => ({ label: o.label }))}
          onPick={onPick}
          onIdea={props.onAsk}
        />
      </div>
    );
  }

  if (page.breathe) {
    return (
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', display: 'grid', gap: 'var(--space-3)' }}>
        <div style={{ fontFamily: 'var(--font-hand)', color: 'var(--sage)', fontSize: 22 }}>Breathe with me…</div>
        <div style={{ fontSize: 48, color: 'var(--sage)' }}>·</div>
        <button
          onClick={props.onBreatheDone}
          style={{
            padding: 'var(--space-3)',
            background: 'var(--action)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            justifySelf: 'center',
            paddingInline: 'var(--space-5)',
          }}
        >
          I feel calm
        </button>
      </div>
    );
  }

  if (page.ask) {
    return (
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', display: 'grid', gap: 'var(--space-3)' }}>
        <p style={{ fontFamily: 'var(--font-body)' }}>{page.ask.prompt}</p>
        <button
          onClick={props.onAsk}
          style={{
            padding: 'var(--space-3)',
            background: 'var(--action)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            justifySelf: 'center',
            paddingInline: 'var(--space-5)',
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return null;
}
