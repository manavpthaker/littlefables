import Link from 'next/link';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';

// Shell for every /intake surface — the token form, the walk-up form,
// the thanks page, and the invalid-link screen. Keeps the branding
// consistent and gives every page one obvious escape hatch to the FAQ
// or a way to reach a human.
//
// The header intentionally has no navigation. This is a task surface,
// not a marketing page — the buyer is here to answer a small number of
// questions and leave.

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-density="outward"
      style={{
        minHeight: '100dvh',
        background: 'var(--paper)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(14px, 3vw, 22px) clamp(18px, 5vw, 32px)',
          borderBottom: '1px solid rgba(138, 113, 86, 0.16)',
          background: 'var(--paper)',
          gap: 'var(--space-4)',
        }}
      >
        <Link href="/" aria-label="Little Fables home" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Wordmark layout="horizontal" markSize={28} />
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', fontSize: 14 }}>
          <Link href="/faq" style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}>
            FAQ
          </Link>
          <a
            href="mailto:hello@littlefables.app"
            style={{ color: 'var(--ink-soft)', textDecoration: 'none' }}
          >
            Contact
          </a>
        </nav>
      </header>

      <main style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      <footer
        style={{
          padding: 'clamp(16px, 3vw, 24px) clamp(18px, 5vw, 32px)',
          borderTop: '1px solid rgba(138, 113, 86, 0.16)',
          background: 'var(--paper)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-4)',
          fontSize: 13,
          color: 'var(--ink-faint)',
          flexWrap: 'wrap',
        }}
      >
        <span>Little Fables · a picture book made for one child</span>
        <span style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link href="/faq" style={{ color: 'var(--ink-faint)', textDecoration: 'none' }}>
            Questions?
          </Link>
          <a
            href="mailto:hello@littlefables.app"
            style={{ color: 'var(--ink-faint)', textDecoration: 'none' }}
          >
            hello@littlefables.app
          </a>
        </span>
      </footer>
    </div>
  );
}
