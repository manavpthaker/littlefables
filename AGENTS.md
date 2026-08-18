# Repository Guidelines

## Project Structure & Module Organization

Little Fables is a Next.js storytelling reader and custom-book app. Routes live in
`app/`: the reader is under `app/read`, parent tools under `app/parent`, and buyer flows under
`app/intake`, `app/gift`, and `app/share`. Shared code is in `lib/`; tests are in `tests/`;
database SQL is in `supabase/migrations/`.

Books are authored in `content/households/<household>/books/<slug>/`; these files are the source of
truth, while database rows and Storage objects are caches. Commerce runbooks live in
`docs/commerce/`. Do not edit `design-system/**/*.jsx`; wrap components in `app/` and add types to
`design-system.d.ts`.

## Build, Test, and Development Commands

- `pnpm dev` — run the Next.js development server.
- `pnpm build` — validate the production build.
- `pnpm typecheck` — run TypeScript checks without emitting files.
- `pnpm lint` — run the Next.js ESLint configuration.
- `pnpm test` / `pnpm test:watch` — run Vitest once or in watch mode.
- `pnpm db:reset` / `pnpm db:types` — reset Supabase or regenerate database types.
- `pnpm content:add <folder>` — upload and upsert an authored book.
- `pnpm order:new`, `pnpm order:preview`, `pnpm order:full-book`, `pnpm order:publish` — run the
  custom-order pipeline in `docs/commerce/intake-flow.md`.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation, single quotes, semicolons, trailing commas, and a
100-character print width. Keep strict types. Use kebab-case for book slugs and timestamp-prefixed
migrations such as `20260817090000_add_field.sql`. Keep modules near 400 effective lines; extract
reader logic into `lib/reader/use-*.ts` hooks.

## Testing Guidelines

Name tests `*.spec.ts` under the matching `tests/` area. Add reducer/selector tests for reader
state, route integration tests for data boundaries, and schema-sync coverage for enum changes.
Before a PR, run `pnpm typecheck`, `pnpm test`, and `pnpm lint`; run `pnpm build` for routing or
deployment changes.

## Architecture, Security & Assets

Do not add generative-model calls to runtime `app/` or `lib/`; manual tooling in `scripts/` is
allowed. Preserve day mode as illustrated/day-voice and night mode as text-only/sleepy-voice, with
soft audio fallbacks. Every child API route must call `requireChildDevice()`; parent routes must
verify the OTP session server-side. Use `currentHouseholdId()`, never `SEED_HOUSEHOLD_ID`, in app
code. Never commit buyer photos, illustrations, narration, tokens, or secrets. Check
`supabase migration list --linked` before pushing migrations.

## Commits & Pull Requests

Write short, imperative, outcome-focused commit subjects. Keep commits scoped. PRs should explain
the change, list verification, note migrations or environment changes, link issues, and include
screenshots for UI work. Do not commit generated assets or unrelated worktree changes.
