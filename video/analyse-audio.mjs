// Measure a music bed against the brief in AUDIO.md: does it stay level, or
// does it build? A bed that swells will fight the narration in beat 6 no matter
// how the duck is set.

import { execFileSync } from 'node:child_process';

const BLOCK = 15;
const SPAN = Number(process.env.SPAN ?? 120); // film is 114s; look past it

// ffmpeg writes volumedetect stats to stderr, not stdout.
const rms = (file, start) => {
  let text = '';
  try {
    execFileSync(
      'ffmpeg',
      ['-hide_banner', '-nostats', '-ss', String(start), '-t', String(BLOCK),
       '-i', file, '-af', 'volumedetect', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (e) {
    text = String(e.stderr ?? '');
  }
  if (!text) {
    text = execFileSync(
      'bash',
      ['-c', `ffmpeg -hide_banner -nostats -ss ${start} -t ${BLOCK} -i ${JSON.stringify(file)} -af volumedetect -f null - 2>&1`],
      { encoding: 'utf8' },
    );
  }
  const m = text.match(/mean_volume:\s*(-?[\d.]+)/);
  return m ? parseFloat(m[1]) : null;
};

for (const file of process.argv.slice(2)) {
  const name = file.split('/').pop();
  console.log(`\n=== ${name} ===`);

  const vals = [];
  for (let s = 0; s < SPAN; s += BLOCK) {
    const v = rms(file, s);
    vals.push(v);
    const bar = v === null ? '' : '#'.repeat(Math.max(0, Math.round((v + 42) * 1.8)));
    console.log(`  ${String(s).padStart(3)}s  ${String(v).padStart(7)} dB  ${bar}`);
  }

  const clean = vals.filter((v) => v !== null);
  const first = clean.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
  const last = clean.slice(-2).reduce((a, b) => a + b, 0) / 2;
  const drift = last - first;
  const spread = Math.max(...clean) - Math.min(...clean);

  console.log(`  drift start→end: ${drift.toFixed(1)} dB`);
  console.log(`  block spread:    ${spread.toFixed(1)} dB`);
  console.log(
    `  verdict: ${Math.abs(drift) < 2 && spread < 4 ? 'steady — good bed' : drift > 2 ? 'BUILDS — will fight narration' : 'uneven'}`,
  );
}
