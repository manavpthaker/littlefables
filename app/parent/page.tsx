import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { SendToDeviceButton } from './send-to-device';

// Parent Corner home. Phase 0 stub: lists the household's children with a
// "Send to this device" affordance that mints a child-device token.
export default async function ParentHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/parent/auth/login');

  // Use service role to sidestep the parent-provisioning-timing edge case.
  const { data: parent } = await admin()
    .from('parents')
    .select('id, household_id, email')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (!parent) {
    return (
      <main>
        <h1>Parent Corner</h1>
        <p>Provisioning your household…</p>
      </main>
    );
  }

  const { data: children } = await admin()
    .from('children')
    .select('id, display_name, band')
    .eq('household_id', parent.household_id)
    .order('display_name');

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 'var(--space-4)' }}>
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Parent Corner</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 'var(--space-1) 0 0' }}>
          Signed in as {parent.email}
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
