# Progress Log — Uzma Course

## Current State

**Last Updated:** 2026-10-01 20:30
**Session ID:** 2026-10-01-master-cabang
**Current Objective:** Master Data Cabang module implementation (`feat-011`).
**Recommended Next Step:** Phase 2b ERP - Teacher Presence & Geolocation (`feat-008`).
### What's Done

- [x] Standardized mobile card layout with reusable `MasterMobileCard` across Master Program, Guru, and Murid (`feat-006`).
- [x] Established Vitest automated testing suite with 26 passing unit tests (`feat-007`).
- [x] Created `init.sh` standard verification entrypoint (`npm run lint && npm test && npm run build`).
- [x] Created `feature_list.json` tracking 11 core features with dependency graph and explicit status.
- [x] Implemented Master Data Cabang module: CRUD, detail view, status toggle, map embed, and dashboard link (`feat-011`).

### What's In Progress

- [ ] Ready for Phase 2b ERP - Teacher Presence & Geolocation (`feat-008`).
  - Details: Geofencing radius validation against `branches` coordinates.
  - Blockers: None.

### What's Next

1. Teacher mobile attendance check-in/out (`feat-008`).
2. Digital learning progress card / teaching log (`feat-009`).
3. Payroll & SPP billing calculations (`feat-010`).
## Blockers / Risks

- [ ] None currently blocking. All builds and test suites are passing.

## Decisions Made

- **Reusable MasterMobileCard**: Encapsulated standard 5-row responsive mobile card layout in `src/components/admin/master-mobile-card.tsx` to prevent UI drift across master menus.
- **Vitest over Jest**: Selected Vitest for native ESM and Next.js 16/Turbopack compatibility with sub-second execution times.
- **Preserve Next.js in AGENTS.md**: Maintained the auto-generated Next.js header in `AGENTS.md` while adding comprehensive harness instructions.

## Files Modified This Session

- `src/lib/branches.ts` - Added `getBranchById`
- `src/app/admin/cabang/actions.ts` - Server actions for branch CRUD and active status toggle
- `src/components/admin/cabang/branch-status-button.tsx` - Reusable optimistic status toggle button with dialog
- `src/components/admin/cabang/branch-form.tsx` - Responsive form for branch creation and edit
- `src/app/admin/cabang/page.tsx` - Master Cabang list with search, filter, and MasterMobileCard
- `src/app/admin/cabang/tambah/page.tsx` - Create branch page
- `src/app/admin/cabang/[id]/page.tsx` - Branch detail view with KPI cards and Google Maps iframe
- `src/app/admin/cabang/[id]/edit/page.tsx` - Edit branch page
- `src/components/admin/admin-shell.tsx` - Added "Data Cabang" sidebar item
- `src/app/admin/page.tsx` - Linked dashboard branch KPI cards to branch detail
- `tests/branches.test.ts` - Unit tests for branch fetchers and slug regex validation
- `feature_list.json` - Added feat-011 (Master Data Cabang)
- `session-handoff.md` - Updated handoff documentation
- `progress.md` - Session progress log
## Evidence of Completion

- [x] Tests pass: `npm test` - 4 test files passed, 26 tests passed in 335ms.
- [x] Linter clean: `npm run lint` - 0 errors, 0 warnings.
- [x] Production build clean: `npm run build` - Compiled successfully in 1.0s with Turbopack (18 routes).
- [x] Full harness verification: `./init.sh` - passes with `set -e`.
- [x] Responsive verification: 0 horizontal overflow across 360px, 375px, 1280px on all Cabang pages.

## Session: 2026-09-30 (Phase 1 — Public Landing Page & Project Foundation)

### Summary of Completed Work
- **Scaffold**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Turbopack.
- **Branding & Identitas Asli**: Mengintegrasikan tagline resmi *"Reader now, Leader tomorrow!"*, profil berdiri sejak 2022 di bawah Ahe Indonesia, serta foto pengajar dan galeri kegiatan autentik dari landing page Canva (`ahesumokembangsrijunwangi.my.canva.site`).
- **Program Belajar Spesifik**: Menampilkan 4 program terperinci dengan rasio murid (1 guru max 2 murid, private 1 guru 1 murid), durasi 30 menit/sesi, 3x seminggu (12x/bulan), dan fasilitas modul buku penghubung/piala kelulusan.
- **Section Fasilitas**: Grid 8 fasilitas lengkap (Guru Berlisensi, Ruang Belajar Nyaman, Piagam & Piala Kelulusan, Kursi Tunggu, Free Air Mineral & Wi-Fi, Permainan Edukasi, Diskon SPP Bulanan, Trial Class Gratis).
- **Section Pengelola & Galeri**: Profil Ibu Nurul Ilmi Mega Puspita, S.Pd., foto tim pendidik asli, dan galeri kolase wisuda/kegiatan belajar.
- **Media Sosial & Kontak Lengkap**: Integrasi link resmi Instagram (@ahesumokembangsri.ahejunwangi), Facebook, kedua nomor WhatsApp (085708110736 & 085730332379), dan link navigasi Google Maps.
- **Shared Data & Utilities**: `src/lib/constants.ts` with `PROGRAMS`, `BRANCHES`, `PROMO_VIDEOS`, and `WA_NUMBER`. `src/lib/whatsapp.ts` with `buildWaLink(context?)`.
- **Reusable UI Primitives**: `Button`, `Card`, `Badge`, `SectionHeading`, `Container` in `src/components/ui/`.
- **Landing Page Sections**:
  - `Navbar`: fixed header with scroll transition, mobile hamburger drawer, accessible navigation links.
  - `HeroSection`: gradient background, value proposition, CTAs to WhatsApp and programs.
  - `ProgramsSection`: cards for AHE, BEE, and Bimbel SD–SMP with WhatsApp inquiry links.
  - `WhyUsSection`: 4 key USPs with Lucide icons.
  - `TestimonialsSection`: horizontal snap-scrolling testimonials from parents.
  - `VideoSection`: promo video embed section (conditionally hidden when empty).
  - `FAQSection`: animated accessible accordion (5 items).
  - `CTASection`: full-width gradient call-to-action banner.
  - `LocationsSection`: cards for Balongbendo and Krian branches with interactive Google Maps embeds, direct Google Maps navigation links, and WhatsApp location query links.
  - `FloatingWhatsApp`: sticky green WhatsApp floating button with intro pulse animation.
- **Supabase Integration**: `@supabase/supabase-js` and `@supabase/ssr` installed, browser client (`client.ts`), server client (`server.ts`), session middleware (`middleware.ts`), and route protection for `/admin/*`.
- **SEO & Metadata**: Title, description, keywords, OpenGraph in `layout.tsx`, `robots.ts`, `sitemap.ts`.
- **Project Harness**: Standardized `CLAUDE.md`.

### Verification Evidence
- Auto-deployment Vercel: Commit `bad122b` otomatis ter-deploy ke Production (`https://uzma-course.vercel.app`) dalam status ● Ready.
- `npm run lint`: ESLint passed with 0 warnings/errors.
- Route generation: `/`, `/_not-found`, `/robots.txt`, `/sitemap.xml`.

### Next Steps (Phase 2 — Mini ERP)
- Create database migrations for users, roles, schedules, attendance, billing, and payouts.
- Build authentication flow for `/admin/login`.
- Implement admin dashboard and teacher portal.

## Session: 2026-09-30 (Phase 2c — Landing Page CMS & Dynamic Content Management)

### Summary of Completed Work
- **Database Schema & Migration**: Created `landing_content` table with `section TEXT PRIMARY KEY`, `content JSONB NOT NULL DEFAULT '{}'`, `updated_at TIMESTAMPTZ`, and `updated_by UUID REFERENCES auth.users(id)`. Enabled RLS with public read (`USING (true)`) and admin-only management (`USING (public.is_admin())`). Seeded all 13 sections with authentic existing content via migration `20260930105713_landing_content.sql`.
- **Type Layer**: Added `landing_content` table type in `src/types/database.ts` and `LandingContent` in `src/types/index.ts`. Created comprehensive interfaces for all 13 sections in `src/types/landing.ts`.
- **Data Access Layer**: Created `src/lib/landing-content.ts` with typed `DEFAULT_LANDING_CONTENT`, `getLandingContent()` fetching all sections, and `getLandingSectionContent(section)` for single-section retrieval with graceful fallback to defaults.
- **Admin Sidebar Menu**: Added "Landing Page" navigation item with `Globe` icon in `src/components/admin/admin-shell.tsx` after "Data Murid", restricted to `admin` role.
- **Admin Section List**: Built `src/app/admin/landing/page.tsx` displaying 13 editable section cards with timestamps, icons, descriptions, and action links.
- **Admin Section Edit Routing**: Built `src/app/admin/landing/[section]/page.tsx` with dynamic routing, Indonesian breadcrumbs, and role-guarded server component dispatch.
- **Server Action**: Implemented `updateLandingSection(section, formData)` in `src/app/admin/landing/actions.ts` with `requireAdmin()`, JSON payload parsing, database upsert, cache revalidation (`/`, `/admin/landing`, `/admin/landing/[section]`), and redirect.
- **Reusable CMS Primitives**:
  - `ImageUrlField`: URL input, alt text input, aspect-ratio preview thumbnail, and broken-URL fallback.
  - `SortableItemList`: Generic numbered list manager with reorder (up/down), add, remove, and collapsible card headers.
  - `CheckboxField`: Added accessible single checkbox primitive to `src/components/admin/form-field.tsx`.
- **Section Form Components**: Built 13 dedicated client form components in `src/components/admin/landing/`: `hero-form`, `programs-form`, `why-us-form`, `facilities-form`, `team-form`, `testimonials-form`, `videos-form`, `locations-form`, `faq-form`, `cta-form`, `footer-form`, `navbar-form`, and `floating-wa-form`.
- **Landing Page Dynamic Integration**: Updated `src/app/page.tsx` and all 13 section components in `src/components/landing/` to accept `data?: SectionData` with backward-compatible defaults. Dynamicized Schema.org JSON-LD for `EducationalOrganization`, `LocalBusiness`, and `FAQPage`.

### Verification Evidence
- **Database Migration**: `supabase db push` applied `20260930105713_landing_content.sql` to remote Supabase instance (`tnqudnltxblfbbgzkcwb`). Verified 13 rows present.
- **Round-Trip Smoke Test**: Automated script tested `getLandingContent()`, single section fetch, live DB update, live DB revert, and missing section fallback. All passed.
- **Browser E2E Verification**: Headless Chromium logged into `/login` with `admin@uzmacourse.com`, verified "Landing Page" sidebar item, navigated to `/admin/landing` (13 section cards rendered), opened `/admin/landing/hero` and verified populated form fields, and inspected `/admin/landing/team` verifying image preview thumbnail and values manager.
- **Build Verification**: `npm run build` completed with zero errors and generated all routes. `npm run lint` passed with 0 errors.

### Next Steps (Phase 2 — Mini ERP)
- Proceed with Phase 2b ERP modules (Presensi Guru with geolocation, Kartu Mengajar, Penggajian & SPP, Laporan) as planned.

## Session: 2026-09-30 (Mobile UI Polish & Fixes — Landing Page Management & Admin Shell)

### Summary of Completed Work
- **SortableItemList Mobile Overhaul (`src/components/admin/landing/sortable-item-list.tsx`)**:
  - Fixed truncation and clipping defect where item action buttons (Move Up, Move Down, Delete) were pushed off-screen (rendered at 514px on 375px screens).
  - Rebuilt item header bar using `min-w-0 flex-1` for label button, `truncate min-w-0` on label text, and `shrink-0` on action buttons with 36px+ comfortable touch target hit areas.
  - Fixed header counter badge (`{items.length} item`) from awkward two-line text wrapping by adding `shrink-0 whitespace-nowrap`.
  - Adjusted nested card padding to responsive `p-3.5 sm:p-4`.
- **Form Actions Component (`src/components/admin/landing/form-actions.tsx`)**:
  - Created reusable mobile-first action footer replacing squashed side-by-side buttons.
  - On mobile: full-width primary submit button (`w-full`, min 44px thumb target) with loading spinner state, cleanly stacked above full-width secondary back button.
  - On desktop (`sm:`): clean side-by-side layout (Back on left, Save on right).
- **All 13 Landing Section Forms Refactored**:
  - Updated `hero-form`, `programs-form`, `why-us-form`, `facilities-form`, `team-form`, `testimonials-form`, `videos-form`, `locations-form`, `faq-form`, `cta-form`, `footer-form`, `navbar-form`, `floating-wa-form`.
  - Converted outer cards from rigid `p-6` to responsive `p-4 sm:p-6`, reclaiming 16px of horizontal space on mobile devices.
  - Added `min-w-0 flex-1` on feature input fields (`programs-form`, `hero-form`, etc.) to prevent inputs with long placeholders from pushing the "+ Tambah" button out of the viewport.
- **ImageUrlField (`src/components/admin/landing/image-url-field.tsx`)**:
  - Added responsive padding (`p-3.5 sm:p-4`) and responsive preview thumbnail width constraint (`max-w-[280px] sm:max-w-xs`).
- **Admin Shell & Top Navbar (`src/components/admin/admin-shell.tsx`)**:
  - Added prominent brand icon + "Uzma Course" text anchor to the top navbar on mobile, eliminating the empty blank bar between hamburger and logout icons.
  - Increased mobile drawer nav link touch targets (`py-3`) and added bottom safe area padding (`pb-8 md:pb-3`) for gesture bars / home indicators.
  - Enhanced logout button tap target (`min-h-[38px]`).
- **Form Inputs & Typography (`src/components/admin/form-field.tsx`)**:
  - Set input/textarea/select font size to `text-base sm:text-sm` (16px on mobile, 14px on desktop) to prevent iOS Safari auto-viewport zoom jump.
  - Polished touch padding to `py-2.5 sm:py-2`.
- **PageHeader (`src/components/admin/page-header.tsx`)**:
  - Applied responsive heading scale `text-xl sm:text-2xl` and `self-start sm:self-auto` for action buttons.
- **Root Layout Viewport (`src/app/layout.tsx`)**:
  - Exported standard Next.js `Viewport` metadata with `width: "device-width", initialScale: 1`.

### Verification Evidence
- **Automated 360px Viewport Scan**: Batch script verified all 13 edit routes (`/admin/landing/*`) at 360×640px. 0 horizontal overflows detected across all 13 sections (`hasOverflow: false`, `overflowingCount: 0`).
- **Visual Inspection**: Captured mobile screenshots at 360px and 375px across index (`/admin/landing`), drawer menu, `programs-form`, and bottom action bar.
- **Form Submission Test**: Exercised live save via server action on mobile viewport, verified redirect and success alert banner.
- **Impeccable Mechanical Detector**: Ran `/impeccable detect` on all modified files, returning 0 violations (`[]`).
- **Production Build & Lint**: `npm run build` succeeded with 0 errors across all routes. `npm run lint` clean.

### Next Steps
- Proceed with Phase 2b ERP modules (Presensi Guru with geolocation, Kartu Mengajar, Penggajian & SPP, Laporan) as planned.

## Session: 2026-09-30 (Full App Mobile Audit & Zero-Broken Responsiveness Invariant)

### Summary of Completed Work
- **Mandatory Responsiveness Rules Added to `CLAUDE.md` and `~/.agents/AGENTS.md`**:
  - Formulated and enforced the **Zero-Broken Mobile Invariant** across all project documentation and global agent baseline:
    1. Strict 0 overflow rule on mobile viewports down to 360px.
    2. No clipped or squashed action buttons.
    3. Minimum touch target standard (36–44px).
    4. Anti-zoom input typography (`text-base sm:text-sm`).
    5. Responsive card padding (`p-4 sm:p-6` / `p-4 sm:p-8`) without deep nested card traps.
    6. Flex input `min-w-0 flex-1` requirement.
    7. Thumb-friendly full-width mobile action bars.
- **Full Multi-Surface Mobile Audit Executed**:
  - **Public Landing Page (`/`)**: Audited all 13 sections (Navbar, Hero, Programs, WhyUs, Facilities, Team, Testimonials, Videos, Locations, FAQ, CTA, Footer). Mobile dropdown navigation tested and verified clean with 0 horizontal overflow.
  - **Login Portal (`/login`)**: Audited at 360px; verified clean card layout, centered inputs, and full-width login button.
  - **Admin Dashboard (`/admin`)**: Eliminated broken glyph square (missing `👋` emoji font on Linux/Windows) in the greeting banner, made "Tambah Guru" and "Tambah Murid" action buttons responsive and equal-width on mobile.
  - **Data Murid Module (`/admin/murid`, `/tambah`, `/[id]`, `/[id]/edit`)**:
    - Replaced `span` container in `DataTable` mobile card with `div min-w-0 flex-1 flex justify-end` to prevent HTML nesting anomalies.
    - Enhanced `StudentForm` padding and buttons (`flex-col-reverse sm:flex-row`, full-width min 44px thumb targets).
    - Verified student detail cards, action buttons, and edit form at 360px with 0 overflow.
  - **Data Guru Module (`/admin/guru`, `/tambah`, `/[id]/edit`)**:
    - Enhanced `GuruForm` with responsive padding and full-width mobile buttons.
    - Audited teacher cards, search filter bar, and edit form at 360px with 0 overflow.

### Verification Evidence
- **Headless Browser Automated Audits**: Verified `/`, `/login`, `/admin`, `/admin/murid`, `/admin/murid/tambah`, `/admin/murid/[id]`, `/admin/murid/[id]/edit`, `/admin/guru`, `/admin/guru/tambah`, and `/admin/guru/[id]/edit` at 360px viewport. All routes reported `hasHorizontalScroll: false` and `overflowingCount: 0`.
- **Build & Typecheck**: `npm run build` completed with zero TypeScript errors across all dynamic and static routes. `npm run lint` clean.

### Next Steps
- Proceed with Phase 2b ERP modules (Presensi Guru with geolocation, Kartu Mengajar, Penggajian & SPP, Laporan) as planned.

## Session: 2026-09-30 (Official Logo Asset Integration & Favicon / Globe Icon Replacement)

### Summary of Completed Work
- **Logo Asset Ingestion**: Located and copied authentic 1280x1280 logo from Windows Downloads directory (`/mnt/c/Users/bagas/Downloads/logo uzma course.jpeg`) to `public/images/logo-uzma-course.jpg`.
- **Favicon & Root Favicon.ico Generation**:
  - Created standard `public/favicon.ico` (256x256, 32-bit Windows icon resource) serving `image/x-icon` with HTTP 200 OK directly from root domain, fixing 404 response on crawler root requests.
  - Added `src/app/icon.jpeg` and `src/app/apple-icon.jpeg` for automatic Next.js App Router metadata generation.
  - Updated `src/app/layout.tsx` metadata icons to declare multi-format icons: `/favicon.ico` (sizes: any), `/images/logo-uzma-course.jpg` (type: image/jpeg), and Apple touch icon, plus OpenGraph and Twitter cards.
  - Diagnosed Google Search favicon indexing behavior: verified Google CDN cache currently returns 404 fallback globe, identified asynchronous `Google Favicon` crawler latency (days to weeks), and outlined Google Search Console live test & indexing request procedure.
- **Admin Sidebar & Navbar Branding**:
  - Replaced generic letter "U" box in `admin-shell.tsx` (sidebar header and mobile header) with the official logo image.
  - Replaced `Globe` icon on the "Landing Page" navigation item with `LayoutTemplate` from Lucide.
  - Updated public navbar (`navbar.tsx`) to display the official logo image next to the brand name.
  - Updated login portal (`login-form.tsx`) to display the official logo image in the card header.

### Verification Evidence
- **Visual Verification**: Captured screenshots of desktop admin sidebar, mobile header, mobile drawer menu, and public navbar showing the official logo rendered sharply.
- **Endpoint Verification**: Tested `curl -IL http://localhost:3000/favicon.ico` (HTTP 200 OK image/x-icon) and `http://localhost:3000/icon.jpeg` (HTTP 200 OK image/jpeg).
- **Build & Typecheck**: `npm run build` succeeded with zero errors, generating static `/icon.jpeg` and `/apple-icon.jpeg` routes automatically. `npm run lint` clean.
### Next Steps
- Proceed with Phase 2b ERP modules (Presensi Guru with geolocation, Kartu Mengajar, Penggajian & SPP, Laporan) as planned.
