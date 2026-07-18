// Privacy notice (PRD D9). Truth-pass 2026-07-18: every claim verified
// against the code as it stands. Honest personal-project statement, not a
// legal policy — that comes when a second household joins (V2 wave 2.5).

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
          <li>The household&apos;s parent password (SHA-256 hashed into an HttpOnly cookie — the plain text never leaves the parent&apos;s device).</li>
          <li>Your child&apos;s reading history: which books they open, which page they&apos;re on, which words they star, which choices they pick on interactive pages.</li>
          <li>Comprehension checkpoints: the question, the transcript of the child&apos;s spoken answer, and how the buddy judged it.</li>
          <li>Buddy choice, badges earned, reading-day set.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>What we never do</h2>
        <ul>
          <li>Sell or share reading history with anyone.</li>
          <li>Train external models on your child&apos;s voice or transcripts. Our AI providers (Anthropic, OpenAI Whisper, Google Gemini, ElevenLabs) receive request-scoped calls only; nothing is opted into their training corpora.</li>
          <li>Show ads or track across sites. No ad SDKs, no analytics beacons.</li>
          <li>Send any data cross-household. Every table row is scoped by household_id and enforced by RLS + server-side household resolution.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Audio recordings</h2>
        <p>
          <strong>Checkpoint answers:</strong> when the child speaks an answer, the audio blob is sent to OpenAI Whisper for
          transcription and is <em>not persisted server-side</em> — only the resulting text transcript lives on the
          <code style={{ padding: '0 4px' }}>comprehension_records</code> row.
        </p>
        <p>
          <strong>Retellings (future — not yet wired):</strong> when we ship the &ldquo;tell it back&rdquo; feature, the child&apos;s audio
          will be stored in a private Supabase Storage bucket (<code>retells</code>) and only Papa can read it via a
          household-scoped policy. Papa can delete any recording from Parent Corner.
        </p>
        <p>
          <strong>Narration:</strong> pre-generated ElevenLabs narration for family books is generated once per page and
          stored in the public <code>page-audio</code> bucket. This is derived content (from the book text, not from any
          child data) and is safe to be public.
        </p>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Cost + safety guardrails</h2>
        <p>
          Every call to an external AI service (Anthropic story generation, OpenAI Whisper transcription, Gemini art
          generation, ElevenLabs live TTS) increments a per-household daily counter <em>before</em> the external call
          runs. When the counter exceeds the environment&apos;s daily budget, the call fails closed and the child is shown a
          warm fallback instead. A stranger who found the URL cannot spend the family&apos;s money.
        </p>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Deleting data</h2>
        <p>
          Household delete: for now, delete the <code>households</code> row in your Supabase project — every child, book,
          progress record, checkpoint, badge, wordbook entry, and art artifact cascades. Individual-record deletion
          from Parent Corner is on the roadmap.
        </p>
      </section>

      <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
        This notice is a personal-project honesty statement, not a legal privacy policy. When Little Fables onboards a
        second household, this becomes a real COPPA-shaped policy with data export and a delete-my-household action.
      </p>
    </main>
  );
}
