'use client';

import { useCallback } from 'react';
import { ChoiceBlocks } from '@ds/components/reader/ChoiceBlocks.jsx';
import type { ReaderPage } from '@/lib/reader/types';

// Interactive page renderer (PRD A4). Handles choice + breathe + ask.
//
// Mic honesty: the ChoiceBlocks "tell me YOUR idea!" dashed-terracotta mic
// was silently dispatching nextPage (no recording, no prompt, no state) —
// exactly the "fail soft on joy" anti-pattern the PRD forbids. We hide the
// mic (by not passing onIdea) until the voice-answer flow is composed from
// the checkpoint MicOrb. The ask-page "Continue" is likewise softened from a
// terracotta action to a quiet keep-going affordance with a caption that
// tells the truth about what the app is (and isn't) listening for.

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
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', display: 'grid', gap: 'var(--space-2)' }}>
        <p style={{ fontFamily: 'var(--font-body)' }} data-utterance={page.ask.prompt}>
          {page.ask.prompt}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-hand)',
            color: 'var(--ink-soft)',
            fontSize: 14,
          }}
        >
          (you can say your idea out loud — a grown-up can hear you)
        </p>
        <button
          onClick={props.onAsk}
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'transparent',
            color: 'var(--ink-soft)',
            border: '1px solid var(--paper-deep)',
            borderRadius: 'var(--radius-pill)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            justifySelf: 'center',
          }}
        >
          Keep going
        </button>
      </div>
    );
  }

  return null;
}
