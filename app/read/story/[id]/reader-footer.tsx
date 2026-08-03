'use client';

import { Transport } from '@ds/components/kid/Transport.jsx';

// Reader footer — the DS Transport (prev/play/next) sits center, with
// restart-page on the left and playback-speed on the right. Speed is a
// tri-state cycle: 0.85× (slower) → 1× (normal) → 1.15× (a little faster).
// Kids at different reading levels get a real dial; night mode still
// applies its own baseline slowdown on top.

export type PlaybackRate = 0.85 | 1 | 1.15;

const RATE_CYCLE: PlaybackRate[] = [1, 0.85, 1.15];
const RATE_LABEL: Record<PlaybackRate, string> = {
  0.85: '0.85×',
  1: '1×',
  1.15: '1.15×',
};

export interface ReaderFooterProps {
  playing: boolean;
  canPrev: boolean;
  canNext: boolean;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRestartPage: () => void;
  rate: PlaybackRate;
  onCycleRate: (next: PlaybackRate) => void;
}

export function ReaderFooter({
  playing,
  canPrev,
  canNext,
  onPlay,
  onPrev,
  onNext,
  onRestartPage,
  rate,
  onCycleRate,
}: ReaderFooterProps) {
  function cycleRate() {
    const i = RATE_CYCLE.indexOf(rate);
    const nextIdx = (i + 1 + RATE_CYCLE.length) % RATE_CYCLE.length;
    onCycleRate(RATE_CYCLE[nextIdx] as PlaybackRate);
  }

  const iconBtn: React.CSSProperties = {
    border: 'none',
    cursor: 'pointer',
    background: 'var(--wash-capsule)',
    color: 'var(--ink)',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    fontSize: 16,
    fontFamily: 'inherit',
    boxShadow: 'var(--elev-rest)',
    flex: 'none',
  };

  return (
    <footer
      className="lf-reader-footer"
      style={{
        flex: 'none',
        padding: 'var(--space-3) var(--page-pad) calc(var(--space-5) + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        background: 'linear-gradient(to top, var(--surface-page) 60%, transparent)',
      }}
    >
      <button
        type="button"
        onClick={onRestartPage}
        aria-label="Start this page again"
        style={iconBtn}
      >
        ↻
      </button>

      <Transport
        playing={playing}
        onPlay={onPlay}
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev}
        canNext={canNext}
      />

      <button
        type="button"
        onClick={cycleRate}
        aria-label={`Playback speed ${RATE_LABEL[rate]} — tap to change`}
        style={{
          ...iconBtn,
          minWidth: 52,
          width: 'auto',
          padding: '0 12px',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {RATE_LABEL[rate]}
      </button>
    </footer>
  );
}
