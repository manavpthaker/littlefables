import { redirect } from 'next/navigation';
import { isHouseholdAuthed, isHouseholdGateEnabled } from '@/lib/server/household-gate';
import { GateForm } from './gate-form';

// Household password gate — shown when HOUSEHOLD_PASSWORD env is set and the
// visitor doesn't have a valid gate cookie. Falls straight through when the
// gate is off (dev) or the user is already unlocked.

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (!isHouseholdGateEnabled() || (await isHouseholdAuthed())) redirect(target);

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
          Little Fables
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          Enter the household password to open storytime.
        </p>
        <GateForm nextPath={target} />
      </div>
    </main>
  );
}

/** Prevent open-redirects — only allow same-origin paths. */
function safeNext(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return '/';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}
