import { admin } from '@/lib/supabase/admin';
import { SEED_HOUSEHOLD_ID } from '@/lib/models/seed';
import { SendToDeviceButton } from './send-to-device';

// Parent Corner home. Single-household mode (Phase 0): no auth gate — anyone
// with the URL is Papa. Add a PARENT_PASSWORD env-gate before deploying.
// The multi-tenant schema stays (PRD Goal 6); we just hardcode the seed
// household here. A household picker replaces this in Phase 5.

export default async function ParentHomePage() {
  const { data: household } = await admin()
    .from('households')
    .select('name')
    .eq('id', SEED_HOUSEHOLD_ID)
    .maybeSingle();

  const { data: children } = await admin()
    .from('children')
    .select('id, display_name, band')
    .eq('household_id', SEED_HOUSEHOLD_ID)
    .order('display_name');

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Parent Corner</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 'var(--space-1) 0 0' }}>
          {household?.name ?? 'Household'}
        </p>
      </header>

      <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>Children</h2>
        {(children ?? []).map((child) => (
          <div
            key={child.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-3)',
              background: 'var(--wash-panel)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{child.display_name}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Band {child.band}</div>
            </div>
            <SendToDeviceButton childId={child.id} childName={child.display_name} />
          </div>
        ))}
      </section>
    </main>
  );
}
