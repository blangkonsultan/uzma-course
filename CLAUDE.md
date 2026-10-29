# CLAUDE.md

Project harness for agent-assisted development on Uzma Course.

## Project Overview

**Uzma Course** — a tutoring center web app with three active modules:
1. **Public Landing Page**: Dynamic showcase with categorized gallery (Lisensi, Wisuda, Kegiatan), program catalog, WhatsApp CTAs, testimonials, video embeds, and branch locations.
2. **Internal Admin ERP & CMS**: Master Data (Cabang, Shift, Program, Guru, Murid), Scheduling Kanban Board (`/admin/draft`), SPP 28-Day Billing & Kwitansi (`/admin/spp`), Teacher Payroll (`/admin/payroll`), 14-section Landing Page CMS, and Admin User Guide (`/admin/panduan`).
3. **Teacher Mobile Portal (`/guru`)**: Geofence GPS Attendance with IndexedDB Offline Queue (`/guru/absen`), Teacher Schedule (`/guru/jadwal`), Digital Teaching Logs / Kartu Kendali (`/guru/mengajar/[id]`), Personal Payroll Slip (`/guru/honor`), Profil & Device Notifications (`/guru/profil`), and Teacher User Guide (`/guru/panduan`).

Stack: Next.js 16 (Turbopack / Webpack) · React 19 · Vitest · Supabase (Auth + Postgres) · Tailwind CSS v4 · TypeScript · Serwist PWA · Vercel.

## Startup Workflow

Before writing code:

1. Confirm `pwd` is `~/projects/laragon/uzma-course`
2. Read this file, `AGENTS.md`, `PRODUCT.md`, and `DESIGN.md` completely.
3. Do not make UX or architectural decisions without referring to the source of truth in `PRODUCT.md` and `DESIGN.md`.
4. Run `./init.sh` to verify environment is healthy
5. Read `feature_list.json` to see current feature state and dependencies
6. Read `progress.md` and `session-handoff.md` for session continuity
7. Review recent commits: `git log --oneline -5`

If baseline verification is failing, repair that first before adding new scope.

## Working Rules

- **One feature at a time**: Pick exactly one unfinished feature from `feature_list.json`
- **Stay in scope**: Do not modify files unrelated to the active feature
- **Verification required**: Don't claim done without running `./init.sh` or documented verification commands
- **Update artifacts**: Before ending session, update `progress.md`, `session-handoff.md`, and `feature_list.json`
- **Leave clean state**: Next session must be able to run `./init.sh` immediately and be restartable

## Required Artifacts

- `feature_list.json` — Feature state tracker and dependency tree (source of truth)
- `progress.md` — Session continuity log with current state, restart markers, and evidence
- `init.sh` — Standard startup and verification entrypoint (`set -e`)
- `session-handoff.md` — Handoff documentation for multi-session work
## Commands

```bash
# Full verification entrypoint
./init.sh

# Individual commands
npm run dev          # Next.js dev server (Turbopack, bound to 0.0.0.0:3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest unit test suite
npm run test:watch   # Vitest interactive watcher
npm run seed:local   # Seed local database with deterministic demo fixtures & accounts

# Database migrations (Supabase CLI)
npx supabase migration new <name>
npx supabase db push --db-url "$DATABASE_URL"

# CodeGraph (code intelligence index)
codegraph sync       # Sync index after file additions or changes
codegraph explore "<query>" # Inspect symbol callers, callees, and definitions
```
## Architecture

### Directory Map

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Public landing page (composes landing sections)
│   ├── login/              # Portal authentication (admin & teacher)
│   ├── admin/              # Protected admin ERP & CMS routes
│   │   ├── cabang/         # Master Cabang (village-based hierarchy)
│   │   ├── shift/          # Master Shift operasional
│   │   ├── guru/           # Master Guru list, tambah, detail, edit, server actions
│   │   ├── murid/          # Master Murid list, tambah, detail, edit, server actions
│   │   ├── program/        # Master Program list, tambah, detail, edit, server actions
│   │   ├── draft/          # Scheduling Kanban board & draft management
│   │   ├── spp/            # Tagihan SPP siklus 28 hari, catat bayar, kwitansi, export PDF
│   │   ├── payroll/        # Penggajian guru, penutupan periode, manual adjustment
│   │   ├── landing/        # Landing Page CMS (14 section editors & actions)
│   │   └── panduan/        # Illustrated Admin User Guide (44 topics)
│   ├── guru/               # Protected Teacher Portal (mobile-first layout)
│   │   ├── absen/          # Geofence GPS attendance with offline IndexedDB sync
│   │   ├── jadwal/         # Daily schedule across assigned branches
│   │   ├── mengajar/[id]/  # Teaching log / kartu kendali per session
│   │   ├── honor/          # Personal monthly honor breakdown & statement
│   │   ├── profil/         # Profile, password update, device notifications
│   │   └── panduan/        # Illustrated Teacher User Guide (15 topics)
│   ├── layout.tsx          # Root layout (Poppins font, metadata, skip-link)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── admin/              # Admin CMS & ERP components (forms, tables, MasterMobileCard)
│   ├── guru/               # Teacher mobile portal components (attendance, teaching log, etc.)
│   ├── guides/             # Reusable illustrated guide reader, shell, figure modal, print
│   ├── landing/            # Landing page section components (hero, gallery, etc.)
│   └── ui/                 # Reusable UI primitives (Button, Card, Badge, etc.)
├── lib/
│   ├── constants.ts        # Programs, branches, WA config
│   ├── auth.ts             # Centralized route/action auth guards (admin & guru)
│   ├── landing-content.ts  # Supabase CMS data fetcher & DEFAULT_LANDING_CONTENT
│   ├── programs.ts         # Master programs database query & mappers
│   ├── branches.ts, shifts.ts, gurus.ts, students.ts # Core Master Data DAL
│   ├── board.ts            # Scheduling conflict resolution & placement DAL
│   ├── billing.ts          # SPP invoice generation, payments, receipt DAL
│   ├── payroll.ts          # Teacher payroll calculation, snapshots & adjustments DAL
│   ├── teaching-logs.ts    # Teaching session cards & attendance status DAL
│   ├── attendances.ts      # Geofence check-in/out & WIB date bounding DAL
│   ├── guides/             # Server-only guide registries & navigation helpers
│   ├── pwa/                # IndexedDB queue (db.ts) & haversine distance
│   ├── utils.ts            # Formatting helpers, image normalizer, cn()
│   └── supabase/           # Supabase client (client.ts, server.ts, admin.ts, middleware.ts)
├── types/                  # TypeScript interfaces (landing.ts, database.ts, index.ts)
└── proxy.ts                # Next.js edge proxy & auth session protection
tests/                      # Vitest unit test suites (utils, whatsapp, landing-content)
```

### Component Architecture

**Reusable UI primitives (`src/components/ui/`):**
Every visual building block that appears in 2+ places MUST be a reusable component here. Examples:
- `Button` — variants: `primary`, `outline`, `outline-white`, `secondary`, `ghost`, `whatsapp`. Sizes: `sm`, `md`, `lg`. Renders `<a>` when `href` is given and `<button>` otherwise; caller-owned target sizing follows `DESIGN.md`.
- `Card` — structural surface with `rounded-2xl shadow-md` border styling. The exported content slots are `CardHeader` and `CardBody`; see `DESIGN.md` for responsive usage.
- `Badge` — inline label (e.g., age range). Variants: `primary`, `accent`, `neutral`.
- `SectionHeading` — centered section title (`<h2>`) with optional subtitle. Used by every landing section.
- `Container` — `max-w-6xl mx-auto px-4`. Wraps all section content.
- `IconBox` — icon wrapper with consistent sizing and color theming.

**Do not** inline one-off styled divs in page sections when a reusable component exists or should exist. Check `src/components/ui/` first; if no match, create the primitive there, then use it.

**Landing sections (`src/components/landing/`):**
Each section is a self-contained component importing from `ui/` primitives and `lib/constants`. Sections must not cross-import from each other.

**Component conventions:**
- One component per file. Filename: `kebab-case.tsx`.
- Use `cn()` from `src/lib/utils.ts` (`clsx` + `tailwind-merge`) for conditional classes.
- Props interfaces: named `{ComponentName}Props`, exported.
- Server Components by default. Add `"use client"` only when React hooks or browser APIs are needed.
- Lucide icons: import individually (`import { BookOpen } from "lucide-react"`), never the entire library.
- Icon selectors: any admin UI that lets the user pick a Lucide icon MUST render a visual preview of each icon next to its label. Never use a plain text-only `<select>`. Use `IconSelectField` from `src/components/admin/landing/icon-select-field.tsx` or build an equivalent custom dropdown with rendered icon components.

### Data Flow

- **Landing page**: Dynamic data fetched from Supabase `landing_content` & `programs` tables via `src/lib/landing-content.ts` and `src/lib/programs.ts`, with resilient static fallback to `DEFAULT_LANDING_CONTENT`.
- **Admin CMS & ERP**: Server Actions colocated in `/admin/{module}/actions.ts`, protected with `requireAdmin()` and Supabase server client.
- **WhatsApp links**: All generated via `buildWaLink(context?)` from `src/lib/whatsapp.ts`.
- **Image assets**: Remote images (Google Drive, external CDN) MUST be normalized via `normalizeImageUrl()` from `@/lib/utils` with `referrerPolicy="no-referrer"`.

### Testing Accounts
- **Admin Portal**: `admin@uzmacourse.com` / `admin123456`
  - Login URL: `http://localhost:3000/login` or `https://uzmacourse.com/login`
  - Role: `admin` (Full access to Master Data & CMS)
- **Teacher Portal**: `guru.demo.01@uzmacourse.test` / `guru123456`
  - Login URL: `http://localhost:3000/login` (auto-redirects to `/guru`)
  - Role: `guru` (Access to Attendance, Schedule, Teaching Logs, Honor, Guides)
  - Full credentials manifest: `supabase/seed-credentials.local.json`
### Database Policy

All schema changes via Supabase CLI migrations only (`supabase/migrations/`). Never inject SQL directly in dashboard or via `supabase db execute`. Create migrations with `npx supabase migration new <name>`, apply with `npx supabase db push`.

### Styling

- Tailwind CSS v4: custom `primary`/`accent` tokens live in `src/app/globals.css`; radius, spacing, and neutral defaults come from the installed Tailwind theme. See `DESIGN.md` for the verified scale.
- Font: Poppins (AHE brand font).
- Neutrals: Tailwind's `slate` scale.
- Contrast: use the existing semantic palette and measure actual foreground/background pairs, including tinted and interactive states. Class names alone do not establish WCAG compliance.

## Code Conventions

- Path alias `@/*` → `./src/*`
- Prefer named exports over default exports
- Tailwind class merging: always use `cn()`, never string concatenation
- External links (wa.me): `target="_blank" rel="noopener noreferrer"`
- Environment variables: `NEXT_PUBLIC_` prefix for client-accessible values
- Supabase client: use `createClient()` from `@/lib/supabase/server` in server contexts, `@/lib/supabase/client` in `"use client"` components
- **Data Access Layer (DAL) Standard**: NEVER write raw database queries (`supabase.from(...)`) directly in UI components (`page.tsx`, `layout.tsx`). Abstract all database reads into dedicated service functions within the `src/lib/` directory and call those functions from your Server Components.
- **Centralized Authentication**: Use `await requireAdminPage()` from `src/lib/auth.ts` for role and session checks in admin pages instead of repeating inline Supabase profile queries.
- **Teacher Authentication**: Use `await requireGuruPage()` in teacher pages (`/guru/*`) and `await requireGuruAction()` in teacher Server Actions.

### Key Domain Rules & Gotchas

- **Rolling 28-Day SPP Cycle**: Student billing does NOT follow calendar months; invoices recur every 28 days based on `student_programs.cycle_start_date`. Invoices are branch-scoped and snapshotted.
- **Payroll Lifecycle (`open` → `closed` → `paid`)**: Manual adjustments can ONLY be added to `closed` periods prior to payment. The registered minimum guarantee is metadata for review, not an automatic top-up. Marking `paid` records status; it does not trigger bank transfers.
- **Teaching Cards / Kartu Mengajar**: Submitted cards are permanently locked (read-only). Clicking "Kirim Kartu" saves pending edits before locking. All pupil attendance statuses (Hadir, Tidak Hadir, Izin, Cancel) are required before submit.
- **PWA Offline Attendance Queue**: Only teacher attendance check-in/out is queued offline in IndexedDB (`UzmaCoursePWA`). Other portal surfaces require an active connection.

## Design / UI Work

- Use `$impeccable` workflows from `.claude/skills/impeccable/`. `DESIGN.md` is the canonical visual-token and new-feature UI-pattern guide; keep `.impeccable/design.json` synchronized when changing it rather than maintaining a parallel rule set here.
- Landing page mode: **Persuade** (visitor decides and acts)
- ERP mode: **Operate** (user completes a task)
- **Zero-Broken Mobile Invariant (Aturan Wajib Responsif Tanpa Broken)**:
  1. **Strict 0 Document Overflow**: Prevent layout-wide horizontal scrolling from 360px/375px through 1280px+. A deliberately bounded document/table scroller may contain wider content; its actions, focus, and touch/keyboard panning must remain usable. See `DESIGN.md`.
  2. **No Clipped / Squashed Actions**: Tombol aksi, panah urutan, dan tombol hapus tidak boleh terpotong atau terlempar ke luar layar oleh flex/truncation yang salah. Gunakan `min-w-0 flex-1` pada tombol berlabel dan `shrink-0` pada grup aksi.
  3. **Touch Targets Standard**: New mobile/touch controls require at least 44px in both dimensions; deliberately compact desktop controls may use 36px. Noninteractive avatar dimensions are not action-target exceptions. Follow the examples in `DESIGN.md`.
  4. **Pencegahan iOS Safari Auto-Zoom**: Seluruh field form (`input`, `textarea`, `select`) wajib menggunakan ukuran font `text-base sm:text-sm` (16px di mobile, 14px di desktop) untuk mencegah browser mobile melakukan auto-zoom paksa saat fokus.
  5. **Responsive Padding & Anti-Nested Cards**: Dilarang menggunakan padding kaku `p-6` pada kartu mobile di dalam container utama yang sudah ber-padding. Gunakan `p-4 sm:p-6` pada kartu dan `p-3.5 sm:p-4` pada kartu item. Hindari pembungkusan kartu di dalam kartu yang membuat ruang input menyempit.
  6. **Flex Inputs**: Input di dalam flex container wajib menyertakan `min-w-0` agar placeholder panjang tidak menabrak atau mendorong tombol di sebelahnya ke luar layar.
  7. **Mobile-First Action Bars**: Pada form panjang, tombol aksi utama (*Simpan*) wajib dibuat dominan/full-width di mobile di atas tombol sekunder (*Kembali*), dan kembali bersisian (*side-by-side*) di layar desktop (`sm:`).


### Master Entity Mobile Card Standard

New master lists using `<DataTable>` MUST supply `mobileCard` with `MasterMobileCard` from `@/components/admin/master-mobile-card`; do not leave a raw administrative table as the phone representation.

Use [DESIGN.md — Master data and CRUD](DESIGN.md#master-data-and-crud) for the six content responsibilities, supported avatar colours, and avatar-versus-action sizing. The `actions` slot belongs to the caller: the card does not enlarge supplied buttons automatically. Use the shared controls with the documented target sizes; do not copy legacy action-size examples.

## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior implemented
- [ ] `./init.sh` succeeds with zero errors (lint, tests, build)
- [ ] `npm run lint` passes with zero errors/warnings
- [ ] `npm test` succeeds with zero failures
- [ ] `npm run build` succeeds with zero errors
- [ ] Responsive verified at 360px, 375px, and 1280px+ with 0 document overflow, 44px mobile/touch targets (36px only for intentionally compact desktop controls), and no clipped actions
- [ ] All new components follow ui/ primitives pattern
- [ ] Evidence recorded in `feature_list.json` or `progress.md`
- [ ] Repository remains restartable from standard startup path

## End of Session

Before ending a session:

1. Update `progress.md` with current state and evidence.
2. Update `feature_list.json` with new feature status.
3. Update `session-handoff.md` with blockers, files, and recommended next step.
4. Commit with descriptive message once work is in safe state.
5. Leave repo clean enough for next session to run `./init.sh` immediately.
