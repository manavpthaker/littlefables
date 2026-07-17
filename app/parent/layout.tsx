import type { Metadata } from 'next';

// Parent Corner: adult-density surfaces. WCAG-scalable (no viewport lock).
export const metadata: Metadata = { title: 'Parent Corner · Little Fables' };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-density="parent" style={{ minHeight: '100dvh', padding: 'var(--space-4)' }}>
      {children}
    </div>
  );
}
