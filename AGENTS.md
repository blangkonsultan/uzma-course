<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Operating Harness — Uzma Course

Project harness for reliable agent-assisted development on Uzma Course.

## Startup Workflow

Before writing code:

1. **Confirm working directory** with `pwd` (must be `~/projects/laragon/uzma-course`)
2. **Read this file**, `CLAUDE.md`, `PRODUCT.md`, dan `DESIGN.md` secara keseluruhan. Jangan ambil keputusan arsitektur UI/UX tanpa merujuk ke desain sistem.
3. **Run `./init.sh`** to verify environment is healthy
4. **Read `feature_list.json`** to see current feature state and dependencies
5. **Read `progress.md`** and `session-handoff.md` for session continuity
6. **Review recent commits** with `git log --oneline -5`

If baseline verification is failing, repair that first before adding new scope.

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Stay in scope**: Do not modify files unrelated to the active feature
- **Data Access Layer (DAL) Standard**: NEVER write raw database queries (`supabase.from(...)`) in UI components. Abstract all DB reads into `src/lib/` services and call them from Server Components.
- **Centralized Authentication**: Admin pages MUST use `await requireAdminPage()` from `src/lib/auth.ts` instead of inline role checks.
- **Verification required**: Don't claim done without running `./init.sh` or documented verification commands
- **Update artifacts**: Before ending session, update `progress.md`, `session-handoff.md`, and `feature_list.json`
- **Leave clean state**: Next session must be able to run `./init.sh` immediately and be restartable

## Required Artifacts

- `feature_list.json` — Feature state tracker and dependency tree (source of truth)
- `progress.md` — Session continuity log with current state, restart markers, and evidence
- `init.sh` — Standard startup and verification entrypoint (`set -e`)
- `session-handoff.md` — Handoff documentation for multi-session work

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior is implemented
- [ ] `./init.sh` succeeds with zero errors (lint, tests, build)
- [ ] `npm run lint` passes with zero errors/warnings
- [ ] `npm test` succeeds with zero failures (vitest)
- [ ] `npm run build` succeeds with zero errors
- [ ] Responsive verified at 360px, 375px, and 1280px+ with 0 horizontal overflow
- [ ] Evidence recorded in `feature_list.json` or `progress.md`
- [ ] Repository remains restartable from standard startup path

## End of Session

Before ending a session:

1. Update `progress.md` with current state and evidence.
2. Update `feature_list.json` with new feature status.
3. Update `session-handoff.md` with blockers, files, and recommended next step.
4. Commit with descriptive message once work is in safe state.
5. Leave repo clean enough for next session to run `./init.sh` immediately.

## Verification Commands

```bash
# Full verification entrypoint
./init.sh
```

Required checks:
- `npm run dev` — Next.js dev server (Turbopack, bound to 0.0.0.0:3000)
- `npm run lint` — ESLint
- `npm test` — Vitest unit test suite
- `npm run build` — Next.js Turbopack production build
- `npx supabase migration new <name>` — Create new migration
- `npx supabase db push --db-url "$DATABASE_URL"` — Apply migrations to database

## Project Overview

**Uzma Course** — a tutoring center web app with two active modules:
1. **Public Landing Page**: Dynamic showcase with categorized gallery (Lisensi, Wisuda, Kegiatan), program catalog, WhatsApp CTAs, testimonials, video embeds, and branch locations.
2. **Internal Admin & Teacher Portal**: Master Program Belajar, Master Guru, Master Murid, and 14-section Landing Page CMS.

Stack: Next.js 16 (Turbopack) · React 19 · Vitest · Supabase (Auth + Postgres) · Tailwind CSS v4 · TypeScript · Vercel.

## Testing Accounts

- **Admin Portal**: `admin@uzmacourse.com` / `admin123456`
  - Login URL: `http://localhost:3000/login` or `https://uzmacourse.com/login`
  - Role: `admin` (Full access to Master Data & CMS)
