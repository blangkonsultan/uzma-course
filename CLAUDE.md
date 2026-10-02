# CLAUDE.md

Project harness for agent-assisted development on Uzma Course.

## Project Overview

**Uzma Course** — a tutoring center web app with two active modules:
1. **Public Landing Page**: Dynamic showcase with categorized gallery (Lisensi, Wisuda, Kegiatan), program catalog, WhatsApp CTAs, testimonials, video embeds, and branch locations.
2. **Internal Admin & Teacher Portal**: Master Program Belajar, Master Guru, Master Murid, and 14-section Landing Page CMS.

Stack: Next.js 16 (Turbopack) · React 19 · Vitest · Supabase (Auth + Postgres) · Tailwind CSS v4 · TypeScript · Vercel.

## Startup Workflow

Before writing code:

1. Confirm `pwd` is `~/projects/laragon/uzma-course`
2. Read this file and `AGENTS.md` completely
3. Run `./init.sh` to verify environment is healthy
4. Read `feature_list.json` to see current feature state and dependencies
5. Read `progress.md` and `session-handoff.md` for session continuity
6. Review recent commits: `git log --oneline -5`

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

# Database migrations (Supabase CLI)
npx supabase migration new <name>
npx supabase db push --db-url "$DATABASE_URL"
```
## Architecture

### Directory Map

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Public landing page (composes landing sections)
│   ├── login/              # Portal authentication (admin & teacher)
│   ├── admin/              # Protected admin ERP & CMS routes
│   │   ├── guru/           # Master Guru list, tambah, edit, server actions
│   │   ├── murid/          # Master Murid list, tambah, detail, edit, server actions
│   │   ├── program/        # Master Program list, tambah, detail, edit, server actions
│   │   └── landing/        # Landing Page CMS (14 section editors & actions)
│   ├── layout.tsx          # Root layout (Poppins font, metadata, skip-link)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── admin/              # Admin CMS & ERP components (forms, tables, MasterMobileCard)
│   ├── landing/            # Landing page section components (hero, gallery, etc.)
│   └── ui/                 # Reusable UI primitives (Button, Card, Badge, etc.)
├── lib/
│   ├── constants.ts        # Programs, branches, WA config
│   ├── landing-content.ts  # Supabase CMS data fetcher & DEFAULT_LANDING_CONTENT
│   ├── programs.ts         # Master programs database query & mappers
│   ├── utils.ts            # Formatting helpers, image normalizer, cn()
│   └── supabase/           # Supabase client (client.ts, server.ts, middleware.ts)
├── types/                  # TypeScript interfaces (landing.ts, database.ts, index.ts)
└── proxy.ts                # Next.js edge proxy & auth session protection
tests/                      # Vitest unit test suites (utils, whatsapp, landing-content)
```

### Component Architecture

**Reusable UI primitives (`src/components/ui/`):**
Every visual building block that appears in 2+ places MUST be a reusable component here. Examples:
- `Button` — variants: `primary`, `outline`, `ghost`, `whatsapp`. Sizes: `sm`, `md`, `lg`. Renders `<a>` when `href` prop given, `<button>` otherwise.
- `Card` — container with `rounded-2xl shadow-md` border styling. Slots: `CardHeader`, `CardBody`, `CardFooter`.
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
### Database Policy

All schema changes via Supabase CLI migrations only (`supabase/migrations/`). Never inject SQL directly in dashboard or via `supabase db execute`. Create migrations with `npx supabase migration new <name>`, apply with `npx supabase db push`.

### Styling

- Tailwind CSS with custom `primary` and `accent` color scales (see `tailwind.config.ts`).
- Font: Poppins (AHE brand font).
- Neutrals: Tailwind's `slate` scale.
- Contrast rule: text-on-white uses `primary-700+` (WCAG AA). White/light text on `primary-600+` backgrounds.

## Code Conventions

- Path alias `@/*` → `./src/*`
- Prefer named exports over default exports
- Tailwind class merging: always use `cn()`, never string concatenation
- External links (wa.me): `target="_blank" rel="noopener noreferrer"`
- Environment variables: `NEXT_PUBLIC_` prefix for client-accessible values
- Supabase client: use `createClient()` from `@/lib/supabase/server` in server contexts, `@/lib/supabase/client` in `"use client"` components
- **Data Access Layer (DAL) Standard**: NEVER write raw database queries (`supabase.from(...)`) directly in UI components (`page.tsx`, `layout.tsx`). Abstract all database reads into dedicated service functions within the `src/lib/` directory and call those functions from your Server Components.
- **Centralized Authentication**: Use `await requireAdminPage()` from `src/lib/auth.ts` for role and session checks in admin pages instead of repeating inline Supabase profile queries.

## Design / UI Work

- Use `$impeccable` skill commands for design workflows when available (`.agents/skills/impeccable/`)
- Landing page mode: **Persuade** (visitor decides and acts)
- ERP mode: **Operate** (user completes a task)
- **Zero-Broken Mobile Invariant (Aturan Wajib Responsif Tanpa Broken)**:
  1. **Strict 0 Overflow**: Dilarang keras adanya horizontal scrollbar atau elemen yang meluber (`rect.right > window.innerWidth`) pada viewport terkecil (mulai 360px & 375px) hingga desktop (1280px+).
  2. **No Clipped / Squashed Actions**: Tombol aksi, panah urutan, dan tombol hapus tidak boleh terpotong atau terlempar ke luar layar oleh flex/truncation yang salah. Gunakan `min-w-0 flex-1` pada tombol berlabel dan `shrink-0` pada grup aksi.
  3. **Touch Targets Standard**: Seluruh tombol interaktif, link navigasi, dan input wajib memiliki area sentuh minimal 36–44px agar nyaman dijangkau jari/ibu jari di layar ponsel.
  4. **Pencegahan iOS Safari Auto-Zoom**: Seluruh field form (`input`, `textarea`, `select`) wajib menggunakan ukuran font `text-base sm:text-sm` (16px di mobile, 14px di desktop) untuk mencegah browser mobile melakukan auto-zoom paksa saat fokus.
  5. **Responsive Padding & Anti-Nested Cards**: Dilarang menggunakan padding kaku `p-6` pada kartu mobile di dalam container utama yang sudah ber-padding. Gunakan `p-4 sm:p-6` pada kartu dan `p-3.5 sm:p-4` pada kartu item. Hindari pembungkusan kartu di dalam kartu yang membuat ruang input menyempit.
  6. **Flex Inputs**: Input di dalam flex container wajib menyertakan `min-w-0` agar placeholder panjang tidak menabrak atau mendorong tombol di sebelahnya ke luar layar.
  7. **Mobile-First Action Bars**: Pada form panjang, tombol aksi utama (*Simpan*) wajib dibuat dominan/full-width di mobile di atas tombol sekunder (*Kembali*), dan kembali bersisian (*side-by-side*) di layar desktop (`sm:`).


### Master Entity Mobile Card Standard (Standar Kartu Mobile Master Data)
Setiap halaman master baru (misal: Master Cabang, Master Ruangan, Master Jadwal, Master Biaya, dll) yang menggunakan `<DataTable>` **WAJIB** menyertakan prop `mobileCard` menggunakan komponen baku `<MasterMobileCard>` dari `@/components/admin/master-mobile-card`. Dilarang membiarkan tampilan tabel mentah di layar ponsel.

**Anatomi Baku 5-Bagian MasterMobileCard:**
1. **Avatar Inisial**: Kotak 40×40px (`w-10 h-10 rounded-xl font-bold text-xs shrink-0`) dengan skema warna tematik:
   - Program Belajar: `color="purple"` (`bg-purple-100 text-purple-700`)
   - Guru / Pengajar: `color="emerald"` (`bg-emerald-100 text-emerald-800`)
   - Murid / Siswa: `color="blue"` (`bg-blue-100 text-blue-700`)
   - Cabang / Fasilitas / Operasional: `color="amber"` atau `color="slate"`
2. **Identitas**: Judul entitas (link semantik) + Subtitle 12px teks sekunder (`line-clamp-1`).
3. **Status**: `<StatusBadge isActive={...} />` di pojok kanan atas kartu.
4. **Pills Row**: Tag cabang / kategori (`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 border border-slate-200/80`) berdampingan dengan atribut meta.
5. **Summary Specs Box**: Kotak ringkasan 2 kolom (`p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs`) berisi label kapital 10px abu-abu dan nilai tebal di bawahnya.
6. **Action Bar**: Bilah aksi bawah (`flex items-center gap-2 pt-2 border-t border-slate-100`) berisi tombol pil sentuh ergonomis (`h-10 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs`) untuk Detail/Edit, serta tombol toggle status berbentuk kotak 40×40px (`w-10 h-10 rounded-xl`).
## Definition of Done

A feature is done only when ALL of the following are true:

- [ ] Target behavior implemented
- [ ] `./init.sh` succeeds with zero errors (lint, tests, build)
- [ ] `npm run lint` passes with zero errors/warnings
- [ ] `npm test` succeeds with zero failures
- [ ] `npm run build` succeeds with zero errors
- [ ] Responsive verified at 360px, 375px, and 1280px+ with 0 horizontal overflow, comfortable touch targets (min 36–44px), and zero broken/clipped elements
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
