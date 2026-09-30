# CLAUDE.md

Project harness for agent-assisted development on Uzma Course.

## Project Overview

**Uzma Course** — a tutoring center web app with two modules:
1. **Public Landing Page** (Phase 1 — current): Program showcase, WhatsApp CTA, branch locations.
2. **Internal Mini ERP** (Phase 2 — planned): User management, session scheduling, teacher pay, student billing, reports.

Stack: Next.js 16 (App Router) · React 19 · Supabase (Auth + Postgres) · Tailwind CSS · TypeScript · Vercel.

## Startup Workflow

1. Confirm `pwd` is `~/projects/laragon/uzma-course`
2. Read this file completely
3. Run `npm run build` to verify environment
4. Read `progress.md` for session continuity (if exists)
5. Review recent commits: `git log --oneline -5`

## Commands

```bash
npm run dev          # Next.js dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
```

## Architecture

### Directory Map

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # Landing page routes (future: multi-page public)
│   ├── admin/              # ERP routes (Phase 2, protected by middleware)
│   ├── api/                # Route handlers
│   ├── layout.tsx          # Root layout (Poppins font, metadata, skip-link)
│   ├── page.tsx            # Landing page (composes landing sections)
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── landing/            # Landing page section components
│   └── ui/                 # Reusable UI primitives (Button, Card, Badge, etc.)
├── lib/
│   ├── constants.ts        # PROGRAMS, BRANCHES, PROMO_VIDEOS, WA_NUMBER
│   ├── whatsapp.ts         # buildWaLink() utility
│   ├── utils.ts            # cn() and shared utilities
│   └── supabase/           # Supabase client (client.ts, server.ts, middleware.ts)
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── middleware.ts            # Supabase auth session refresh (/admin/* only)
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

### Data Flow

- **Landing page**: All data from `src/lib/constants.ts` (static). No API calls, no Supabase.
- **WhatsApp links**: All generated via `buildWaLink(context?)` from `src/lib/whatsapp.ts`.
- **ERP (Phase 2)**: Server Actions in `src/app/admin/actions/`, Supabase server client, Zod validation.

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

## Design / UI Work

- Use `$impeccable` skill commands for design workflows when available (`.agents/skills/impeccable/`)
- Landing page mode: **Persuade** (visitor decides and acts)
- ERP mode: **Operate** (user completes a task)

## Definition of Done

- [ ] Target behavior implemented
- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes
- [ ] Responsive verified at 375px and 1280px+
- [ ] All new components follow ui/ primitives pattern
- [ ] Evidence recorded in `progress.md`

## End of Session

Before ending, append a handoff block to `progress.md`:
1. What was done (files changed, features completed)
2. Verification evidence (build output, visual checks)
3. Exact next step for the following session
