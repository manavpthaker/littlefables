'use client';

import { PaintingWash } from '@ds/components/reader/PaintingWash.jsx';
import { StoryText } from './story-text';
import type { ReaderPage } from '@/lib/reader/types';
import { useLandscapeSpread } from '@/lib/reader/use-landscape';

// The narrative page.
//
// The illustration is full bleed — edge to edge, no card, no radius, no
// margin. It is the thing the buyer paid for, and framing it inside a rounded
// container made it read as a thumbnail in an app rather than a plate in a
// book.
//
// Landscape: picture left, words right, crease between them.
// Portrait:  picture on top, words beneath.
// Night:     no picture at all; words centred on dark paper.
//
// Controls are passed in and rendered at the foot of the words rather than
// across the full width, so nothing ever sits over the art.

export function PageSpread({
  page,
  pageKey,
  coverImage,
  useWashFallback,
  currentIndex,
  narrating,
  hideArt = false,
  controls,
  onHearWord,
}: {
  page: ReaderPage;
  pageKey: string;
  coverImage?: string;
  useWashFallback: boolean;
  currentIndex: number;
  narrating: boolean;
  /** Night mode: skip the art pane entirely; text-only page. */
  hideArt?: boolean;
  /** Pill + menu, anchored under the words. */
  controls?: React.ReactNode;
  onHearWord: (word: string, wordIdx: number) => void;
}) {
  // Nothing slides. A bound book does not move when you change page — the
  // picture simply arrives, and the words set themselves after it.
  const art = 'lf-art-in var(--motion-chime) var(--ease-pendulum) both';

  const landscape = useLandscapeSpread();
  const artUrl = hideArt ? undefined : (page.img ?? coverImage);
  const hasArtPane = !hideArt && (Boolean(artUrl) || useWashFallback);

  const storyText = (
    <StoryText
      words={page.words.map((w) => ({ w: w.w }))}
      currentIndex={currentIndex}
      dimUpcoming={narrating}
      reveal={!narrating}
      onHearWord={onHearWord}
    />
  );

  const picture = artUrl ? (
    <div
      key={artUrl}
      style={{
        position: 'absolute',
        inset: 0,
        background: `url(${artUrl}) center/cover no-repeat`,
        animation: art,
      }}
    />
  ) : (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaintingWash height="100%" label="this one's still being painted for you…" />
    </div>
  );

  // Night: words alone, centred, generous. The chapter title lives in the
  // capsule now, so nothing labels the page above the story.
  if (hideArt) {
    return (
      <main
        key={pageKey}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: '1fr auto',
          padding: 'var(--space-6) var(--page-pad)',
          boxSizing: 'border-box',
        }}
      >
        <article
          style={{
            minHeight: 0,
            overflowY: 'auto',
            display: 'grid',
            alignContent: 'center',
            justifySelf: 'center',
            maxWidth: 620,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {storyText}
        </article>
        <div style={{ display: 'grid', justifyItems: 'center', paddingBottom: 'var(--space-3)' }}>
          {controls}
        </div>
      </main>
    );
  }

  if (landscape && hasArtPane) {
    return (
      <main
        key={pageKey}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 48%) minmax(0, 52%)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}>{picture}</div>

        <div
          style={{
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: '1fr auto',
            padding: 'var(--space-7) var(--space-7) var(--space-5)',
            boxSizing: 'border-box',
          }}
        >
          <article
            style={{
              minHeight: 0,
              overflowY: 'auto',
              display: 'grid',
              alignContent: 'center',
              maxWidth: 520,
              width: '100%',
            }}
          >
            {storyText}
          </article>
          {controls}
        </div>

        {/* Drawn last so the fold lies over both leaves. `left` matches the
            grid's column boundary; the class re-centres itself on it. */}
        <div aria-hidden className="lf-gutter" style={{ left: '48%' }} />
      </main>
    );
  }

  return (
    <main
      key={pageKey}
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'minmax(0, var(--reader-art-share)) minmax(0, 1fr) auto',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}>{picture}</div>
      <article
        style={{
          // minHeight:0 + stretch is what lets this scroll. With
          // alignSelf:'center' the item sizes to its content instead of the
          // track, overflow-y never engages, and a long page runs on under
          // the capsule below it. Short pages still centre — that is the
          // inner grid's alignContent, not the item's alignment.
          minHeight: 0,
          overflowY: 'auto',
          display: 'grid',
          alignContent: 'center',
          padding: 'var(--space-5) var(--page-pad) 0',
          maxWidth: 'var(--reader-measure)',
          width: '100%',
          marginInline: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {storyText}
      </article>
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          padding: 'var(--space-4) var(--page-pad) var(--space-5)',
        }}
      >
        {controls}
      </div>
    </main>
  );
}
