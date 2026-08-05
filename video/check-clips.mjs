// Do the recordings outlast the beats that use them?
//
//   node check-clips.mjs
//
// Remotion's OffthreadVideo holds the last frame when a sequence runs past the
// end of its source, which on screen looks like the film freezing rather than
// like an error. Nothing in the render fails, so it has to be checked.
//
// WINDOWS must match the startFrom/len pairs in src/Walkthrough.tsx.

import { execFileSync } from 'node:child_process';

const WINDOWS = {
  '02-open.mp4': { startFrom: 1.0, len: 7 },
  '03-intake.mp4': { startFrom: 4, len: 18 },
  '06-payoff.mp4': { startFrom: 7.5, len: 24 },
  '07-night.mp4': { startFrom: 4.2, len: 8 },
};

const seconds = (file) =>
  Number(
    execFileSync('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration',
      '-of', 'default=nw=1:nk=1', `public/recordings/${file}`,
    ]).toString().trim(),
  );

let bad = 0;
console.log(`${'clip'.padEnd(20)}${'have'.padStart(7)}${'need'.padStart(7)}   headroom`);
for (const [file, w] of Object.entries(WINDOWS)) {
  let have;
  try {
    have = seconds(file);
  } catch {
    console.log(`${file.padEnd(20)}${'—'.padStart(7)}${'—'.padStart(7)}   missing`);
    continue;
  }
  const need = w.startFrom + w.len;
  const slack = have - need;
  if (slack < 0) bad++;
  console.log(
    `${file.padEnd(20)}${have.toFixed(2).padStart(7)}${need.toFixed(2).padStart(7)}   ` +
      (slack < 0 ? `SHORT by ${(-slack).toFixed(2)}s` : `${slack.toFixed(2)}s`),
  );
}
process.exit(bad ? 1 : 0);
