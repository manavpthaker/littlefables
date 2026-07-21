#!/usr/bin/env tsx
// Fail the build when we're producing a production bundle without the
// parent gate configured. Local dev builds (NODE_ENV != 'production') pass
// through unchanged so a fresh clone can `pnpm build` without secrets. This
// exists because the gate was intentionally left toggleable via an env var
// (so single-family dev installs are frictionless) and we don't want that
// convenience to silently ship to Vercel.

const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const hasPassword = Boolean(process.env.PARENT_PASSWORD?.trim());

if (isProd && !hasPassword) {
  console.error(
    '\n' +
    '✗ PARENT_PASSWORD is not set for this production build.\n' +
    '  The parent surface (transcripts, spend, publish/block) would be\n' +
    '  publicly reachable — every API budget could be drained by anyone\n' +
    '  with the URL. Refusing to build.\n\n' +
    '  Set PARENT_PASSWORD in Vercel project env (Production + Preview),\n' +
    '  then rebuild. To bypass locally, run `NODE_ENV=development pnpm build`.\n',
  );
  process.exit(1);
}
