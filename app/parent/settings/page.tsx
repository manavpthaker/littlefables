import { admin } from '@/lib/supabase/admin';
import { currentHouseholdId } from '@/lib/server/current-household';
import { getParentSession } from '@/lib/server/parent-session';
import { parseChildSettings } from '@/lib/models/settings';
import { AccountSection } from '../account-section';
import { ChildrenSection, type ChildRow } from '../children-section';
import { SharesSection } from '../shares-section';
import { SettingsForm } from './settings-form';

// Parent Settings — the only surface a grown-up sees. Per-child bedtime
// window + optional voice overrides, plus device/child management, plus
// share-link management per book.

const KID_VISIBLE_STATUSES = ['complete', 'published'];

export default async function ParentSettingsPage() {
  // Session is guaranteed by the /parent layout gate; getParentSession is
  // cache()-wrapped so this doesn't cost a second JWT verification round-trip.
  const session = (await getParentSession())!;
  const householdId = await currentHouseholdId();

  const [{ data: household }, { data: parent }, { data: children }, { data: bookRows }] =
    await Promise.all([
      admin().from('households').select('name').eq('id', householdId).maybeSingle(),
      admin()
        .from('parents')
        .select('display_name, email')
        .eq('id', session.parentId)
        .maybeSingle(),
      admin()
        .from('children')
        .select('id, display_name, band, settings')
        .eq('household_id', householdId)
        .order('created_at', { ascending: true }),
      admin()
        .from('books')
        .select('id, title')
        .eq('household_id', householdId)
        .in('status', KID_VISIBLE_STATUSES)
        .order('title'),
    ]);

  const childRows: ChildRow[] = (children ?? []).map((c) => ({
    id: c.id,
    displayName: c.display_name,
    band: c.band,
  }));

  const shareableBooks = (bookRows ?? []).map((b) => ({ id: b.id, title: b.title }));

  return (
    <main style={{ display: 'grid', gap: 'var(--space-7)' }}>
      <header style={{ display: 'grid', gap: 'var(--space-2)' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-size)',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          Settings
        </h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 'var(--text-body-size)' }}>
          Bedtime window and voices, per child. The kid never sees any of this.
        </p>
      </header>

      <AccountSection
        parentDisplayName={parent?.display_name?.trim() || 'Parent'}
        parentEmail={parent?.email ?? session.parentEmail}
        householdName={household?.name?.trim() || 'Your household'}
      />

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

      {shareableBooks.length > 0 && <SharesSection books={shareableBooks} />}
    </main>
  );
}
