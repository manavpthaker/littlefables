// Whether a music bed has been dropped in. Remotion has no filesystem access at
// render time, so this is a manual switch rather than a real check — flip it
// after putting a file at public/audio/bed.mp3.
export const existsSync = true;
