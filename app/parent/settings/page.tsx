import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';
import { parseChildSettings } from '@/lib/models/settings';
import { loadWorldState } from '@/lib/world/state';
import { ChildrenSection, type ChildRow } from '../children-section';
import { BuddyPicker } from '../buddy-picker';
import { SettingsForm } from './settings-form';

// Parent · Settings (brief §III.5): reading level (Ease/Auto/Stretch),
// comprehension checks on/off, bedtime window, daily limit, narrator voice,
// band — per child. Plus device/child management and the buddy picker.

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

  const firstChildId = children?.[0]?.id ?? '';
  const world = firstChildId ? await loadWorldState(firstChildId) : null;

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
          Reading level, checks, bedtime, limits — the child never sees any of this.
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
      {world && <BuddyPicker currentBuddyId={world.activeBuddyId} />}
    </main>
  );
}
