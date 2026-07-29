import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Storytime · Settings' };

// Parent surface. One page: settings. No gate blocks the kid mode; no
// insights, no stories admin — the app is a curated reader and the parent
// surface only exists to configure it.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-density="parent"
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--text-body)',
      }}
    >
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: 'var(--surface-card)',
          borderBottom: 'var(--border-soft)',
          padding: 'var(--space-3) clamp(14px, 3.5vw, 24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <Link
          href="/parent"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            color: 'var(--text-strong)',
            textDecoration: 'none',
          }}
        >
          Little Fables
        </Link>
        <Link
          href="/read"
          style={{
            color: 'var(--action)',
            textDecoration: 'none',
            fontSize: 'var(--text-body)',
            fontWeight: 600,
          }}
        >
          Open storytime →
        </Link>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(14px, 3.5vw, 24px)' }}>
        {children}
      </div>
    </div>
  );
}
