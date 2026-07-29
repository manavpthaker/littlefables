import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';
import { parseChildSettings } from '@/lib/models/settings';
import { ChildrenSection, type ChildRow } from '../children-section';
import { SettingsForm } from './settings-form';

// Parent Settings — the only surface a grown-up sees. Per-child bedtime
// window + optional voice overrides, plus device/child management.

export default async function ParentSettingsPage() {
  const householdId = await currentHouseholdId();

  const [{ data: household }, { data: children }] = await Promise.all([
    admin().from('households').select('name').eq('id', householdId).maybeSingle(),
    admin()
      .from('children')
      .select('id, display_name, band, settings')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true }),
  ]);

  const childRows: ChildRow[] = (children ?? []).map((c) => ({
    id: c.id,
    displayName: c.display_name,
    band: c.band,
  }));

  return (
    <main style={{ display: 'grid', gap: 'var(--space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            margin: 0,
            color: 'var(--text-strong)',
          }}
        >
          Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
          Bedtime window and voices, per child. The kid never sees any of this.
        </p>
      </header>

      {(children ?? []).map((c) => (
        <SettingsForm
          key={c.id}
          childId={c.id}
          displayName={c.display_name}
          band={c.band}
          initial={parseChildSettings(c.settings)}
        />
      ))}

      <ChildrenSection rows={childRows} householdName={household?.name ?? 'Household'} />
    </main>
  );
}
