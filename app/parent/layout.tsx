import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Parent Corner · Little Fables' };

// Parent Corner: adult-density surfaces (WCAG-scalable, no viewport lock).
// Fixed top nav with brand + tabs.
export default function ParentLayout({ children }: { children: React.ReactNode }) {
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
          padding: 'var(--space-4) var(--space-6)',
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
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link
            href="/parent"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
          >
            Home
          </Link>
          <Link
            href="/parent/make"
            style={{ color: 'var(--action)', textDecoration: 'none', fontSize: 'var(--text-body)', fontWeight: 600 }}
          >
            + Make a story
          </Link>
          <Link
            href="/parent/privacy"
            style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
          >
            Privacy
          </Link>
        </div>
      </nav>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--space-6)' }}>{children}</div>
    </div>
  );
}
