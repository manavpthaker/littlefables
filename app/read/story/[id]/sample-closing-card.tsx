'use client';

import Link from 'next/link';

// End-of-sample card. Shown on the last page when the reader was opened
// via /sample. Deliberately quiet — the sample's promise is that nothing
// interrupts the book, so the card only appears once the story is over.
//
// No price on this surface. The price lives on Etsy and the landing
// page; a third source is how mismatches happen.

const ETSY_URL =
  'https://www.etsy.com/shop/LittleFablesStories?utm_source=littlefables&utm_campaign=sample_end';

export function SampleClosingCard({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label="The end of the sample book"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(16px, 4vw, 32px)',
        background: 'color-mix(in srgb, var(--surface-page) 92%, transparent)',
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--paper-warm, var(--paper))',
          border: '1px solid var(--border-soft, var(--pill-edge))',
          borderRadius: 'var(--radius-md, 12px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
          padding: 'clamp(20px, 4vw, 32px)',
          display: 'grid',
          gap: 'var(--space-3, 14px)',
          fontFamily: 'var(--font-body)',
          color: 'var(--ink)',
          textAlign: 'center',
        }}
      >
        <TreeMark />
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 3.4vw, 26px)',
            lineHeight: 1.25,
            color: 'var(--ink)',
          }}
        >
          This was Rosa&rsquo;s book, made for one real kid.
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(20px, 3.4vw, 26px)',
            lineHeight: 1.25,
            color: 'var(--ink)',
          }}
        >
          Yours is written fresh &mdash; about your kid.
        </p>
        <a
          href={ETSY_URL}
          style={{
            marginTop: 'var(--space-2, 10px)',
            justifySelf: 'center',
            display: 'inline-block',
            padding: '12px 22px',
            background: 'var(--oxblood)',
            color: 'var(--on-oxblood, var(--paper))',
            border: 'none',
            borderRadius: 'var(--radius-sm, 8px)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-size)',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}
        >
          Start your book
        </a>
        <Link
          href="/"
          style={{
            justifySelf: 'center',
            fontFamily: 'var(--font-sc)',
            fontSize: 13,
            letterSpacing: '0.08em',
            color: 'var(--ink-faint, var(--ink-soft))',
            textDecoration: 'none',
          }}
        >
          back to littlefables.app
        </Link>
      </div>
    </aside>
  );
}

function TreeMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      aria-hidden="true"
      style={{ justifySelf: 'center', color: 'var(--brass, var(--oxblood))' }}
    >
      <path
        d="M16 3 L23 14 L20 14 L26 22 L21 22 L27 29 L5 29 L11 22 L6 22 L12 14 L9 14 Z"
        fill="currentColor"
      />
      <rect x="14.5" y="27" width="3" height="4" fill="currentColor" />
    </svg>
  );
}
