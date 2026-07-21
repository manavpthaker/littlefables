'use client';

import { PaintingWash } from '@ds/components/system/SystemStates.jsx';
import { StoryText } from '@ds/components/reader/StoryText.jsx';
import type { ReaderPage } from '@/lib/reader/types';
import { useLandscapeSpread } from '@/lib/reader/use-landscape';
import { Hotspots } from './hotspots';

// The narrative page's visual layout, in both orientations (PRD F2).
//
// PORTRAIT (phones — the primary device): mockup layout — rounded art card
// above, prose on plain paper below (text is never over art anymore).
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
      overArt={false}
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

  // Portrait (and landscape with no art at all): mockup layout — the art is a
  // rounded card ABOVE the prose (hotspots live inside it); the words sit on
  // plain paper below, never over art.
  return (
    <main
      key={pageKey}
      style={{
        flex: 1,
        display: 'grid',
        alignContent: 'start',
        gap: 'var(--space-5)',
        padding: 'var(--space-4) var(--page-pad) var(--space-6)',
        maxWidth: 'var(--reader-measure)',
        width: '100%',
        marginInline: 'auto',
        boxSizing: 'border-box',
        animation: 'lf-page-in var(--dur-page) var(--ease-page) 1',
      }}
    >
      {(page.img || useWashFallback) && (
        <div
          style={{
            position: 'relative',
            aspectRatio: '4/3',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: 'var(--elev-raised)',
          }}
        >
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
          {page.img && page.hotspots && page.hotspots.length > 0 && <Hotspots hotspots={page.hotspots} />}
        </div>
      )}
      <article>
        {chapterLabel}
        {storyText}
      </article>
    </main>
  );
}
