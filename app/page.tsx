import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Little Fables — a storybook, for your kid',
  description:
    'Custom illustrated bedtime storybooks where your kid is the main character. Delivered in days, opens on any iPad.',
};

// Bare-domain landing. Rendered for anyone hitting `/` — no auto-redirect,
// ever. The reader entry is /f/<token> (soon /read/<slug>-<token>) and
// /gift/<code>; a parent who wants to manage settings clicks "Parent
// sign-in" and OTPs into /login. See docs/commerce/delivery-flow.md.
//
// Rotates: the demo path below points at the demo household's magic URL
// (content/households/demo/household.yaml → device.magic_url). When we
// re-mint that token, update the constant here too. Using the path form
// (no origin) so it works in dev and prod without env plumbing.
const DEMO_PATH = '/read/lantern-of-round-pond/C5KeWk4ej5eq3Dq_A4ck7G36y4vya-tWwbvn2CyAfVs';

export default function LandingPage() {
  return (
    <main
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-body)',
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      <section
        style={{
          display: 'grid',
          placeItems: 'center',
          padding: 'clamp(32px, 8vw, 96px) 24px',
        }}
      >
        <div style={{ maxWidth: 640, textAlign: 'center', display: 'grid', gap: 'var(--space-5)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Little Fables
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)',
              lineHeight: 1.55,
              color: 'var(--ink-muted)',
              margin: 0,
            }}
          >
            Your kid, in their own storybook. Written for who they are, illustrated in a
            style you helped choose, narrated with care. Delivered in days — and saved
            to their iPad like a favorite app.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 'var(--space-3)',
            }}
          >
            <Link
              href={DEMO_PATH}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--oxblood)',
                color: 'var(--paper)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--text-body-size)',
              }}
            >
              See the demo →
            </Link>
            {/* TODO: replace `#` with the Etsy shop URL once the listing is live —
                positioning.md has etsy.com/shop/LittleFablesStories reserved. */}
            <a
              href="#"
              aria-disabled="true"
              style={{
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--ink-faint)',
                color: 'var(--ink-muted)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--text-body-size)',
                pointerEvents: 'none',
              }}
            >
              Order on Etsy (coming soon)
            </a>
          </div>
        </div>
      </section>
      <footer
        style={{
          padding: 'var(--space-4) 24px',
          borderTop: 'var(--border-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          color: 'var(--ink-muted)',
          fontSize: 'var(--text-small-size)',
        }}
      >
        <span>© Little Fables</span>
        <Link href="/login" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>
          Parent sign-in
        </Link>
      </footer>
    </main>
  );
}
