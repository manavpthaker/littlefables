import type { Metadata } from 'next';
import { admin } from '@/lib/supabase/admin';
import { PhotoChoice } from './photo-choice';

export const metadata: Metadata = {
  title: 'Your photo',
};
export const dynamic = 'force-dynamic';

// The buyer's side of the photo retention promise.
//
// The intake form tells them: kept until your book arrives, then you choose,
// and silence means deletion. This is where the choosing happens. The link
// goes out with the delivery email, reusing the same per-order token as the
// intake form — a buyer who can reach their book can reach this.
//
// Deliberately reachable after the choice is made, and reversible: someone who
// picked "keep" in October should be able to come back in March and change
// their mind without emailing anyone. A privacy control you can only use once,
// in the moment you were asked, is not much of a control.

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: '1 1 auto',
        display: 'grid',
        placeItems: 'center',
        padding: 'clamp(28px, 6vw, 72px) 24px',
      }}
    >
      <div style={{ maxWidth: 560, display: 'grid', gap: 'var(--space-4)' }}>{children}</div>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          margin: 0,
          color: 'var(--ink)',
          lineHeight: 1.15,
          textAlign: 'center',
        }}
      >
        {title}
      </h1>
      <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 17, lineHeight: 1.6, textAlign: 'center' }}>
        {body}
      </p>
    </Shell>
  );
}

export default async function PhotoChoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const supa = admin();
  const { data: row } = await supa
    .from('intakes')
    .select('id, child_name, photo_path, photo_retention, photo_deleted_at')
    .eq('token', token)
    .maybeSingle();

  if (!row) {
    return (
      <Message
        title="We couldn't find that link"
        body="It may have expired or been replaced by a newer one. Message us on Etsy and we'll sort it out."
      />
    );
  }

  // Already gone. Say so plainly — this is the outcome we promised by default,
  // so it should read as the system working, not as an error.
  if (row.photo_deleted_at || !row.photo_path) {
    return (
      <Message
        title="Your photo has been deleted"
        body={
          row.photo_deleted_at
            ? 'It is no longer on our systems. Nothing further is needed — thank you for letting us draw from it.'
            : "There's no photo on file for this order, so there's nothing to delete."
        }
      />
    );
  }

  return (
    <Shell>
      <PhotoChoice
        token={token}
        childName={row.child_name}
        current={(row.photo_retention as 'pending' | 'keep' | 'delete') ?? 'pending'}
      />
    </Shell>
  );
}
