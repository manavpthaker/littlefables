// Privacy notice (PRD D9). Kept simple and honest — this is Papa reading
// about a personal household product; when we productize (Phase 5) this
// needs a legal review + COPPA compliance sign-off.

export const dynamic = 'force-static';

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'var(--space-4)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <header>
        <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Privacy</h1>
        <p style={{ color: 'var(--ink-soft)', margin: 'var(--space-1) 0 0' }}>
          What Little Fables sees, keeps, and never shares.
        </p>
      </header>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>What we collect</h2>
        <ul>
          <li>The parent&apos;s email address (needed to sign in — currently not used).</li>
          <li>Your child&apos;s reading history: which books they open, which pages, which words they star.</li>
          <li>Comprehension checkpoints: the question, the child&apos;s spoken answer (transcribed), and how the buddy judged it.</li>
          <li>Buddy choice, badges earned, reading days.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>What we never do</h2>
        <ul>
          <li>Sell or share reading history with anyone.</li>
          <li>Train external models on your child&apos;s voice or transcripts.</li>
          <li>Show ads or track across sites.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Audio recordings</h2>
        <p>
          The child&apos;s spoken checkpoint answers are recorded on-device, sent to OpenAI Whisper for transcription,
          and stored alongside the transcript so you can review the exchange in Parent Corner. Audio blobs are
          not retained after transcription; only the transcript stays with the record.
        </p>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Deleting data</h2>
        <p>
          To delete any part of the household&apos;s data, contact us or delete rows directly in your Supabase
          project. A one-click household delete is on the roadmap.
        </p>
      </section>

      <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
        This notice is a personal-project honesty statement, not a legal privacy policy. When Little Fables
        onboards a second household, this becomes a real COPPA-shaped policy.
      </p>
    </main>
  );
}
