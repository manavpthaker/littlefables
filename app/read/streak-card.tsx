'use client';

// Reading-streak card (mockup-fidelity): butter card, caps label, "N ☀️",
// seven week segments — earned segments glow marigold→ember, days never turn
// off once earned (DS rule).
export function StreakCard({ earned, today, streak }: { earned: number[]; today: number; streak: number }) {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg,#FBEDCF,#F3E0BC)',
        border: '1.5px solid var(--sand-line)',
        borderRadius: 26,
        padding: 'var(--space-4) var(--space-5)',
        display: 'grid',
        gap: 'var(--space-3)',
        boxShadow: 'var(--elev-rest)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--marigold-deep)', fontWeight: 700 }}>
          Reading streak
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)' }}>{streak} ☀️</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const lit = earned.includes(i);
          return (
            <span
              key={i}
              aria-hidden="true"
              style={{
                flex: 1,
                height: 10,
                borderRadius: 6,
                background: lit ? 'var(--action-grad)' : 'var(--paper-deep)',
                outline: i === today && !lit ? '2px solid var(--marigold)' : 'none',
                outlineOffset: 1,
              }}
            />
          );
        })}
      </div>
    </section>
  );
}
