'use client';

// The one thing left at the top of the reader.
//
// It stays visible rather than folding into the menu because day/night is the
// only control a child flips mid-story, and because the mode is a promise the
// app makes about what happens next — a moon showing at bedtime is worth more
// than the tap it saves.
//
// It floats over the page rather than sitting in a header bar, so the
// illustration can run to the top edge behind it.

export function ReaderChip({ isNight, onToggle }: { isNight: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isNight ? 'Switch to daytime reading' : 'Switch to bedtime reading'}
      style={{
        position: 'absolute',
        top: 'calc(var(--space-4) + env(safe-area-inset-top, 0px))',
        right: 'var(--space-4)',
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: '50%',
        border: 'none',
        display: 'grid',
        placeItems: 'center',
        fontSize: 17,
        // Night is a bare glyph on dark paper, as in the mockup. Day sits over
        // the illustration in portrait, where it needs a disc to stay legible
        // against whatever the picture happens to be doing underneath.
        background: isNight ? 'transparent' : 'var(--wash-capsule)',
        // --ink in both modes, never --paper. [data-mode="night"] swaps the two
        // — ink becomes the light colour and paper becomes the dark ground — so
        // the usual "pass paper on a dark surface" advice paints the glyph dark
        // on dark and it disappears entirely.
        color: 'var(--ink-soft)',
        boxShadow: isNight ? 'none' : 'var(--shadow-rest)',
      }}
    >
      {isNight ? '☾' : '☀'}
    </button>
  );
}
