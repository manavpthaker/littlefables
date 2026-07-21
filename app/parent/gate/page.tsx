import { redirect } from 'next/navigation';
import { isGateEnabled, isParentAuthed } from '@/lib/server/parent-gate';
import { GateForm } from './gate-form';

// Parent password gate. Middleware redirects here when PARENT_PASSWORD is set
// and the cookie is missing. If the gate is disabled (dev) or the user is
// already authed, skip straight through to /parent.
export default async function ParentGatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNext(next);
  if (!isGateEnabled() || (await isParentAuthed())) {
    redirect(nextPath);
  }
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        background: 'var(--surface-page)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 'var(--space-6)',
          background: 'var(--surface-card)',
          border: 'var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gap: 'var(--space-3)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-title)',
            margin: 0,
            color: 'var(--text-strong)',
          }}
        >
          Grown-ups only
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          Enter the parent password to see stories, transcripts, and the
          maker.
        </p>
        <GateForm nextPath={nextPath} />
      </div>
    </main>
  );
}

// Guard against open-redirect / off-site jumps. Only allow same-app paths.
function safeNext(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return '/parent';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/parent';
  return raw;
}
