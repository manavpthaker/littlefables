'use client';

import { useEffect, useRef, useState } from 'react';

// The muted autoplay loops for the landing "How your book is made" section,
// and the opt-in lightbox for the full walkthrough film. Both are client
// components because the section is otherwise server-rendered and the
// interaction lives in the browser.
//
// Rules of the section:
//   - Loops autoplay when ≥50% visible, pause when they leave.
//   - prefers-reduced-motion never autoplays — shows the poster still instead.
//   - Aspect-ratio reserved on the box so no CLS.
//   - The initial page load carries zero video weight (preload="none",
//     posters are eager but small).
//   - The film has audio and controls. Nothing else on the page does.
//   - No third-party player, embed, or beacon.

interface StepLoopProps {
  src: string;
  poster: string;
  /** Description of the loop content — becomes the aria-label on the still. */
  alt: string;
}

export function StepLoop({ src, poster, alt }: StepLoopProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const on = () => setReduced(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          el.play().catch(() => {
            /* autoplay blocked — leave the poster showing */
          });
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster} alt={alt} className="lf-how-loop" loading="lazy" />
    );
  }

  return (
    <video
      ref={ref}
      className="lf-how-loop"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-label={alt}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

interface FullFilmRowProps {
  src: string;
  poster: string;
}

function fireAnalytics(name: 'film_played' | 'film_completed') {
  if (typeof window === 'undefined') return;
  // No analytics layer is wired into the site today; fire through the two
  // conventional globals so if either is added later, these events flow
  // without another change here.
  const w = window as unknown as {
    plausible?: (event: string) => void;
    posthog?: { capture?: (event: string) => void };
  };
  w.plausible?.(name);
  w.posthog?.capture?.(name);
}

export function FullFilmRow({ src, poster }: FullFilmRowProps) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    fireAnalytics('film_played');
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    videoRef.current?.pause();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="lf-how-watch"
        onClick={() => setOpen(true)}
      >
        Watch the whole thing — two minutes →
      </button>
      {open ? (
        <div
          className="lf-film-scrim"
          role="dialog"
          aria-modal="true"
          aria-label="Little Fables walkthrough film"
          onClick={close}
        >
          <div className="lf-film-frame" onClick={(e) => e.stopPropagation()}>
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              poster={poster}
              onEnded={() => fireAnalytics('film_completed')}
            >
              <source src={src} type="video/mp4" />
            </video>
            <button
              type="button"
              className="lf-film-close"
              onClick={close}
              aria-label="Close film"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
