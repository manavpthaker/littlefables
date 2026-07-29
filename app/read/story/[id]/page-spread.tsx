'use client';

import { PaintingWash } from '@ds/components/system/SystemStates.jsx';
import { StoryText } from '@ds/components/reader/StoryText.jsx';
import type { ReaderPage } from '@/lib/reader/types';
import { useLandscapeSpread } from '@/lib/reader/use-landscape';

// The narrative page's visual layout.
//
// Day (illustrated): portrait shows a rounded art card above the prose;
// landscape shows a book spread (art left, words right). Text is never over
// art in either orientation.
//
// Night (hideArt=true): text-only rendering, no art card, no wash. Warm
// paper, generous line height. The reader becomes a bedtime page-turner.

export function PageSpread({
  page,
  pageKey,
  chapterTitle,
  coverImage,
  useWashFallback,
  currentIndex,
  narrating,
  hideArt = false,
  onHearWord,
}: {
  page: ReaderPage;
  pageKey: string;
  chapterTitle: string | null;
  coverImage?: string;
  useWashFallback: boolean;
  currentIndex: number;
  narrating: boolean;
  /** Night mode: skip the art pane entirely; text-only page. */
  hideArt?: boolean;
  onHearWord: (word: string, wordIdx: number) => void;
}) {
  const landscape = useLandscapeSpread();
  const artUrl = hideArt ? undefined : (page.img ?? coverImage);
  const hasArtPane = !hideArt && (Boolean(artUrl) || useWashFallback);

  const chapterLabel = chapterTitle ? (
    <p
      style={{
        fontFamily: 'var(--font-body)',
        color: 'var(--text-muted)',
        margin: '0 0 var(--space-4)',
        textAlign: 'center',
        fontSize: 13,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      {chapterTitle}
    </p>
  ) : null;

  const storyText = (
    <StoryText
      words={page.words.map((w) => ({ w: w.w }))}
      currentIndex={currentIndex}
      dimUpcoming={narrating}
      onHearWord={onHearWord}
      overArt={false}
    />
  );

  // Night mode: single-column text-only. Same shape in portrait and landscape.
  if (hideArt) {
    return (
      <main
        key={pageKey}
        style={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          padding: 'var(--space-6) var(--page-pad)',
          maxWidth: 'var(--reader-measure, 640px)',
          width: '100%',
          marginInline: 'auto',
          boxSizing: 'border-box',
          animation: 'lf-page-in var(--dur-page) var(--ease-page) 1',
        }}
      >
        <article style={{ maxWidth: 560, width: '100%' }}>
          {chapterLabel}
          {storyText}
        </article>
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
          gridTemplateColumns: 'minmax(0, 45%) minmax(0, 55%)',
          animation: 'lf-page-in var(--dur-page) var(--ease-page) 1',
        }}
      >
        <div style={{ position: 'relative', minHeight: 0, overflow: 'hidden' }}>
          {artUrl ? (
            <div
              key={artUrl}
              style={{
                position: 'absolute',
                inset: 0,
                background: `url(${artUrl}) center/cover no-repeat`,
                animation: 'var(--motion-develop)',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0 }}>
              <PaintingWash fullBleed label="this one's still being painted for you…" />
            </div>
          )}
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
      <div className="lf-art-card">
        {artUrl ? (
          <div
            key={artUrl}
            style={{
              position: 'absolute',
              inset: 0,
              background: `url(${artUrl}) center/cover no-repeat`,
              animation: 'var(--motion-develop)',
            }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0 }}>
            <PaintingWash fullBleed label="this one's still being painted for you…" />
          </div>
        )}
      </div>
      <article>
        {chapterLabel}
        {storyText}
      </article>
    </main>
  );
}
