'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Interactive cover builder — the centerpiece of the landing page.
//
// Picks one of six illustration styles + types a name + a "one thing they
// love", and shows a live sample cover. "Download this cover" rasterizes
// the composition to a 1200×1500 PNG via canvas. State persists to
// localStorage so a return visit keeps the last choice.
//
// Deliberately client-only (interactivity + canvas). The rest of the
// landing page is server-rendered.

interface StyleDef {
  key: string;
  name: string;
  /** Thumbnail (cropped background) — the button face. */
  thumb: string;
  /** Focal x for the thumbnail background, 0..1. */
  thumbFx: number;
  /** Panel art (the full-cover preview). */
  panel: string;
  /** Focal x for the panel, 0..1. */
  panelFx: number;
  alt: string;
}

const STYLES: StyleDef[] = [
  {
    key: 'painted-storybook',
    name: 'painted storybook',
    thumb: '/landing/sample-1-painted-storybook.jpg',
    thumbFx: 0.5,
    panel: '/landing/panel-1-painted-storybook.jpg',
    panelFx: 0.55,
    alt: 'a boy and his dog on a porch at dusk',
  },
  {
    key: 'cut-paper-collage',
    name: 'cut-paper collage',
    thumb: '/landing/sample-2-cut-paper-collage.jpg',
    thumbFx: 0.5,
    panel: '/landing/panel-3-cut-paper-collage.png',
    panelFx: 0.35,
    alt: 'a girl flying a red kite through tall grass',
  },
  {
    key: 'watercolor-classic',
    name: 'watercolor classic',
    thumb: '/landing/sample-2-watercolor-classic.jpg',
    thumbFx: 0.55,
    panel: '/landing/panel-2-watercolor-classic.jpg',
    panelFx: 0.55,
    alt: 'a girl in a straw hat finding a hedgehog under a strawberry leaf',
  },
  {
    key: 'woodcut-ink',
    name: 'woodcut & ink',
    thumb: '/landing/sample-3-woodcut-ink.jpg',
    thumbFx: 0.5,
    panel: '/landing/panel-4-woodcut-ink.jpg',
    panelFx: 0.42,
    alt: 'a boy and a fox walking under a gold moon',
  },
  {
    key: 'manga-anime',
    name: 'manga & anime',
    thumb: '/landing/sample-5-manga-anime.jpg',
    thumbFx: 0.22,
    panel: '/landing/panel-5-manga-anime.jpg',
    panelFx: 0.3,
    alt: 'a girl with a small companion looking over a harbor town at sunset',
  },
  {
    key: 'crayon-pencil',
    name: 'crayon & pencil',
    thumb: '/landing/sample-6-crayon-pencil.jpg',
    thumbFx: 0.58,
    panel: '/landing/panel-6-crayon-pencil.jpg',
    panelFx: 0.6,
    alt: 'a boy in a red cape leaping off the couch while his dog watches',
  },
];

const NAME_KEY = 'lf.cover.name';
const SUB_KEY = 'lf.cover.subtitle';
const STYLE_KEY = 'lf.cover.style';

function subtitleFor(thing: string): string {
  const raw = thing.trim();
  if (!raw) return 'a story of the pond and the yellow boots.';
  const lower = raw.toLowerCase();
  const asIs = lower.startsWith('a ') || lower.startsWith('the ') || lower.startsWith('an ');
  let s = asIs ? raw : `a story of ${raw}`;
  if (!/[.!?]$/.test(s)) s += '.';
  return s;
}

function utmUrl(base: string, campaign: string): string {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=littlefables&utm_campaign=${campaign}`;
}

export function CoverBuilder({ startBookUrl }: { startBookUrl: string }) {
  const [name, setName] = useState('');
  const [thing, setThing] = useState('');
  const [styleIdx, setStyleIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const persistTimer = useRef<number | null>(null);

  // Rehydrate from localStorage on mount. Deliberately after render — we
  // don't SSR user choices; the initial paint is the neutral "Ada" default.
  useEffect(() => {
    try {
      const n = window.localStorage.getItem(NAME_KEY) ?? '';
      const t = window.localStorage.getItem(SUB_KEY) ?? '';
      const rawIdx = Number.parseInt(window.localStorage.getItem(STYLE_KEY) ?? '0', 10);
      const idx = Number.isNaN(rawIdx) ? 0 : Math.min(STYLES.length - 1, Math.max(0, rawIdx));
      setName(n);
      setThing(t);
      setStyleIdx(idx);
    } catch {
      /* localStorage disabled — no-op */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: { name?: string; thing?: string; styleIdx?: number }) => {
    if (persistTimer.current !== null) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      try {
        if (next.name !== undefined) window.localStorage.setItem(NAME_KEY, next.name);
        if (next.thing !== undefined) window.localStorage.setItem(SUB_KEY, next.thing);
        if (next.styleIdx !== undefined) window.localStorage.setItem(STYLE_KEY, String(next.styleIdx));
      } catch {
        /* localStorage disabled — no-op */
      }
    }, 120);
  }, []);

  const sel = STYLES[styleIdx] ?? STYLES[0]!;
  const displayName = name.trim() || 'Ada';
  const sub = useMemo(() => subtitleFor(thing), [thing]);
  const primaryReady = Boolean(name.trim() && thing.trim());
  const builderLabel = primaryReady ? 'Tell us what you’re imagining →' : 'Start with an idea';
  const builderUrl = utmUrl(startBookUrl, primaryReady ? 'cover_builder_completed' : 'cover_builder');

  async function downloadCover() {
    const def = sel;
    try {
      await document.fonts.ready;
    } catch {
      /* fonts API missing — proceed anyway */
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = def.panel;
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('cover art failed to load'));
      });
    } catch {
      return;
    }
    const W = 1200;
    const H = 1500;
    const artH = 1100;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#F3EBD8';
    ctx.fillRect(0, 0, W, H);
    const targetAR = W / artH;
    let sw = img.width;
    let sh = img.height;
    let sx = 0;
    let sy = 0;
    if (img.width / img.height > targetAR) {
      sw = img.height * targetAR;
      sx = (img.width - sw) * def.panelFx;
    } else {
      sh = img.width / targetAR;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, artH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#A67C3A';
    ctx.font = '36px "IM Fell English SC", Georgia, serif';
    // Canvas letter-spacing has patchy browser support; treat as best-effort.
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '6px';
    ctx.fillText('little fables', W / 2, artH + 96);
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px';
    ctx.fillStyle = '#2A1D12';
    ctx.font = '84px "IM Fell English", Georgia, serif';
    const nameLine = `For ${displayName} —`;
    if (ctx.measureText(nameLine).width > 1040) {
      ctx.font = '62px "IM Fell English", Georgia, serif';
    }
    ctx.fillText(nameLine, W / 2, artH + 188);
    ctx.fillStyle = '#57432E';
    ctx.font = 'italic 44px "EB Garamond", Georgia, serif';
    const words = sub.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      if (ctx.measureText(test).width > 900 && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    lines.push(current);
    if (lines.length > 2) {
      lines.length = 2;
      lines[1] = `${lines[1]!}…`;
    }
    lines.forEach((line, i) => ctx.fillText(line, W / 2, artH + 254 + i * 58));
    const ruleY = artH + 254 + (lines.length - 1) * 58 + 40;
    ctx.strokeStyle = '#B89154';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 80, ruleY);
    ctx.lineTo(W / 2 + 80, ruleY);
    ctx.stroke();
    ctx.fillStyle = 'rgba(138,113,86,0.5)';
    ctx.fillRect(24, 18, 4, H - 36);
    ctx.strokeStyle = 'rgba(42,29,18,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    const safe = displayName.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'Ada';
    const a = document.createElement('a');
    a.download = `For-${safe}-little-fables.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  const coverArtStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    aspectRatio: '4/5',
    backgroundImage: `url(${sel.panel})`,
    backgroundSize: 'cover',
    backgroundPosition: `${Math.round(sel.panelFx * 100)}% 50%`,
    backgroundColor: 'var(--paper-deep)',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 48,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          flex: '1 1 480px',
          maxWidth: 660,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px 20px',
        }}
      >
        {STYLES.map((s, i) => {
          const on = i === styleIdx;
          return (
            <figure key={s.key} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${s.name} — ${s.alt}`}
                title={s.name}
                onClick={() => {
                  setStyleIdx(i);
                  persist({ styleIdx: i });
                }}
                style={{
                  padding: 0,
                  border: 'none',
                  background: 'var(--paper-deep)',
                  cursor: 'pointer',
                  width: '100%',
                  aspectRatio: '4/3',
                  borderRadius: 10,
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  outline: on ? '2px solid var(--oxblood)' : '1px solid var(--border-card)',
                  outlineOffset: 2,
                  backgroundImage: `url(${s.thumb})`,
                  backgroundSize: 'cover',
                  backgroundPosition: `${Math.round(s.thumbFx * 100)}% 50%`,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    boxShadow: on
                      ? 'inset 0 0 0 2px rgba(125,46,43,0.28), inset 0 0 14px rgba(125,46,43,0.22)'
                      : 'none',
                    pointerEvents: 'none',
                  }}
                />
              </button>
              <figcaption
                style={{
                  fontFamily: 'var(--font-sc)',
                  fontSize: 14,
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  color: on ? 'var(--oxblood)' : 'var(--ink-soft)',
                }}
              >
                {s.name}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div style={{ flex: '0 1 380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            className="lf-cover-frame"
            style={{
              width: 'min(360px, 84vw)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--paper)',
              margin: '0 auto',
            }}
          >
            <span
              role="img"
              aria-label="Preview of the selected illustration style on a book cover"
              style={coverArtStyle}
            />
            <div
              style={{
                padding: '22px 30px 26px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                textAlign: 'center',
              }}
            >
              <span style={{ fontFamily: 'var(--font-sc)', fontSize: 12, letterSpacing: '0.14em', color: 'var(--brass)' }}>
                little fables
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  lineHeight: 1.2,
                  overflowWrap: 'anywhere',
                }}
              >
                For {ready ? displayName : 'your story'} —
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: 'var(--ink-soft)',
                  maxWidth: '16em',
                  overflowWrap: 'anywhere',
                }}
              >
                {sub}
              </span>
              <div style={{ width: 44, borderTop: '1px solid var(--gilt)', marginTop: 2 }} />
            </div>
          </div>
          <figcaption
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-sc)',
              fontSize: 13,
              letterSpacing: '0.08em',
              color: 'var(--ink-soft)',
            }}
          >
            {sel.name}
          </figcaption>
        </figure>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            htmlFor="lf-cover-name"
            style={{
              fontFamily: 'var(--font-sc)',
              fontSize: 'var(--text-label-size)',
              letterSpacing: 'var(--track-label)',
              color: 'var(--brass)',
            }}
          >
            try a name or story detail
          </label>
          <input
            id="lf-cover-name"
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              setName(v);
              persist({ name: v });
            }}
            placeholder="a name, place, or group"
            aria-label="a name, place, or group"
            maxLength={24}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              background: 'var(--paper)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              color: 'var(--ink)',
            }}
          />
          <input
            value={thing}
            onChange={(e) => {
              const v = e.target.value;
              setThing(v);
              persist({ thing: v });
            }}
            placeholder="one thing they love"
            aria-label="one thing they love"
            maxLength={60}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              padding: '10px 12px',
              background: 'var(--paper)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              color: 'var(--ink)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            className="lf-btn lf-btn--primary"
            href={builderUrl}
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            {builderLabel}
          </a>
          <button className="lf-btn lf-btn--quiet" type="button" onClick={downloadCover}>
            Download this cover
          </button>
        </div>
      </div>
    </div>
  );
}
