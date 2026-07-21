'use client';

import { PaintingWash } from '@ds/components/system/SystemStates.jsx';
import { StoryText } from '@ds/components/reader/StoryText.jsx';
import type { ReaderPage } from '@/lib/reader/types';
import { useLandscapeSpread } from '@/lib/reader/use-landscape';
import { Hotspots } from './hotspots';

// The narrative page's visual layout, in both orientations (PRD F2).
//
// PORTRAIT (phones — the primary device): unchanged from the original reader —
// full-bleed art behind, the text floating over it in the DS panel pattern
// (rules-of-use: over-art content uses scrim/capsule/panel/sheet only).
//
// LANDSCAPE ≥640px (phone sideways, iPad, laptop): a book spread — the art
// becomes the left page (edge to edge in its half), the words sit on plain
// paper as the right page. Text is never over art here, so no over-art
// treatment applies; a soft gutter shadow sells the fold between the pages.

export function PageSpread({
  page,
  pageKey,
  chapterTitle,
  useWashFallback,
  currentIndex,
  starredWords,
  onHearWord,
  onStarWord,
}: {
  page: ReaderPage;
  pageKey: string;
  chapterTitle: string | null;
  useWashFallback: boolean;
  currentIndex: number;
  starredWords: string[];
  onHearWord: (word: string, wordIdx: number) => void;
  onStarWord: (stem: string) => void;
}) {
  const landscape = useLandscapeSpread();
  const hasArtPane = Boolean(page.img) || useWashFallback;

  const chapterLabel = chapterTitle ? (
    <p
      style={{
        fontFamily: 'var(--font-hand)',
        color: 'var(--text-muted)',
        margin: '0 0 var(--space-4)',
        textAlign: 'center',
        fontSize: 'var(--text-hand)',
      }}
    >
      {chapterTitle}
    </p>
  ) : null;

  const storyText = (
    <StoryText
      words={page.words.map((w) => ({ w: w.w }))}
      currentIndex={currentIndex}
      starredWords={starredWords}
      onHearWord={onHearWord}
      onStarWord={onStarWord}
      overArt={!landscape && Boolean(page.img)}
    />
  );

  if (landscape && hasArtPane) {
    return (
      <main
        key={pageKey}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 45%) minmax(0, 55%)',
          animation: 'lf-page-in var(--dur-page) var(--ease-page) 1',
        }}
      >
        {/* Left page: the art, edge to edge in its half. */}
        <div style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}>
          {page.img ? (
            <div
              key={page.img}
              style={{
                position: 'absolute',
                inset: 0,
                background: `url(${page.img}) center/cover no-repeat`,
                animation: 'var(--motion-develop)',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0 }}>
              <PaintingWash fullBleed label="painting this page…" />
            </div>
          )}
          {page.img && page.hotspots && page.hotspots.length > 0 && (
            <Hotspots hotspots={page.hotspots} />
          )}
          {/* Gutter: the fold where the art page meets the text page. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: '0 0 0 auto',
              width: 22,
              background: 'linear-gradient(to left, rgba(70,54,42,0.16), transparent)',
              pointerEvents: 'none',
            }}
          />
        </div>
        {/* Right page: words on paper — no over-art treatment needed. */}
        <div
          style={{
            minHeight: 0,
            overflowY: 'auto',
            display: 'grid',
            placeItems: 'center',
            padding: 'var(--space-6) var(--space-7)',
          }}
        >
          <article style={{ maxWidth: 560, width: '100%' }}>
            {chapterLabel}
            {storyText}
          </article>
        </div>
      </main>
    );
  }

  // Portrait (and landscape with no art at all): the original layout.
  return (
    <main
      key={pageKey}
      style={{
        flex: 1,
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-6) var(--page-pad)',
        position: 'relative',
        animation: 'lf-page-in var(--dur-page) var(--ease-page) 1',
      }}
    >
      {page.img && (
        <div
          key={page.img}
          style={{
            position: 'absolute',
            inset: 0,
            background: `url(${page.img}) center/cover no-repeat`,
            animation: 'var(--motion-develop)',
            pointerEvents: 'none',
          }}
        />
      )}
      {useWashFallback && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <PaintingWash fullBleed label="painting this page…" />
        </div>
      )}
      {page.img && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(70,54,42,0.15), rgba(70,54,42,0.05) 40%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}
      {page.img && page.hotspots && page.hotspots.length > 0 && (
        <div aria-hidden={false} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          <Hotspots hotspots={page.hotspots} />
        </div>
      )}
      <article
        style={{
          maxWidth: 'var(--reader-measure)',
          width: '100%',
          background: page.img ? 'var(--wash-panel)' : 'transparent',
          backdropFilter: page.img ? 'blur(6px)' : undefined,
          padding: page.img ? 'var(--space-5) var(--space-6)' : 0,
          borderRadius: page.img ? 'var(--radius-lg)' : 0,
          boxShadow: page.img ? 'var(--elev-card)' : 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {chapterLabel}
        {storyText}
      </article>
    </main>
  );
}
