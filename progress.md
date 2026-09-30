# Progress Log — Uzma Course

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

### Next Steps
- Proceed with Phase 2b ERP modules (Presensi Guru with geolocation, Kartu Mengajar, Penggajian & SPP, Laporan) as planned.
