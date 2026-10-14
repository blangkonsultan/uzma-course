# Progress Log
## 2026-10-14 (Phase 1 Security & Authorization Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 1 remediation: `docs/superpowers/specs/2026-10-14-phase1-security-hardening-design.md`.
  - Covers S1 (role hardcoding in `handle_new_user` trigger), S2 (enabling RLS on `program_variants` and `branch_shifts`), S3 (explicit `NetworkOnly` boundary on `/admin/*` in `sw.ts` with legacy cache purge, preserving IndexedDB), S4 (`sanitizeNextUrl` to prevent open redirects and script injection), and S5 (admin authorization and strict HTTPS host allowlist for `extractCoordinatesFromUrl`).
  - Established zero-downtime cutover sequence and test plan across Vitest unit suites and production smoke tests.
  - No code or database mutations performed in this step. Awaiting user review gate before implementation planning.

## 2026-10-14 (Guru Profile Notification Polish & Mobile PWA Service Worker Fix)
- **Status**: Completed.
- **Evidence**:
  - Investigated mobile notification failure on Brave & Edge Android: Next.js 16 defaults to Turbopack which bypassed Serwist's Webpack plugin on Vercel, leaving `/sw.js` as 404 in production. Desktop browsers fell back to `new Notification()`, while mobile Chromium strictly requires `ServiceWorkerRegistration.showNotification()`.
  - Configured `package.json` `"build": "next build --webpack"` to guarantee Serwist compiles `public/sw.js` during production builds.
  - Generated and included `public/sw.js` in the repository, adding it to `globalIgnores` in `eslint.config.mjs`.
  - Polished `NotificationTestButton` UI with progressive disclosure, pill-shaped action button (`rounded-full`), preventing layout squeeze and awkward text wrapping on mobile viewports.
  - Resolved React 19 / ESLint `react-hooks/set-state-in-effect` by initializing client-side permission state via asynchronous microtask queue.
  - Hardened notification trigger in `notification-test-button.tsx` to actively register `/sw.js` and wait for `navigator.serviceWorker.ready` with `tag: "uzma-test-notification"`.
  - Aligned Guru profile role badge to `DESIGN.md` brand palette (`bg-primary-50 text-primary-700 border border-primary-200/60`).
  - Added comprehensive unit test suite `tests/components/notification-test-button.test.tsx` (5 passing tests).
  - Removed unused import `formatTimeString` in `src/app/guru/page.tsx`.
  - Verified `./init.sh`: 0 ESLint errors/warnings, 28 test suites (242 tests passing), and clean production build.

## 2026-10-10 (Village-Based Branch Refactor & Administrative Hierarchy)
- **Status**: Completed.
- **Evidence**:
  - Investigated and resolved empty guru list on `/admin/guru`: PostgREST query in `src/lib/gurus.ts` previously attempted an inline join with `profile_branches` table which caused error `PGRST200` (relationship not found in schema cache). Refactored `getPaginatedGurus` and `getGuruById` to query `profiles` reliably with graceful fallback for branch assignments. Verified all 11 active teachers render properly.
  - Added new comprehensive test suite `tests/gurus.test.ts` (4 new tests, 237 total passing tests across 27 suites).
  - Migrated branches to be village-based: `balongbendo` -> `sumokembangsri` (Cabang Sumokembangsri) and `krian` -> `junwangi` (Cabang Junwangi).
  - Added structured regional fields `kecamatan` and `desa` to `branches` table with schema migration `20261010140000_village_based_branch_refactor.sql`.
  - Atomically relinked all 40 students, 11 teacher/admin profiles, 5 branch shifts, and 2 active schedule drafts with 0 orphan records.
  - Updated DAL (`src/lib/branches.ts`, `src/types/database.ts`), Admin server actions, Branch form, table views, and detail page to display and manage `kecamatan` and `desa`.
  - Updated public landing page footer, CMS locations config, and SEO JSON-LD structured data.
  - Full verification suite `./init.sh` passed with 0 ESLint errors/warnings, 237 Vitest tests passing, and clean Turbopack production build.
## 2026-10-08 (Global DAL Migration Phase 2)
- **Status**: Completed.
- **Evidence**:
  - Refactored all remaining modules (Cabang, Guru, Murid, Program, Draft, Shift, Landing CMS).
  - Eliminated all raw `supabase.from(...)` queries from `src/app/` and `src/components/`, moving them into `src/lib/` (DAL).
  - Centralized authorization by creating `requireAdminAction()` in `src/lib/auth.ts`.
  - Vitest test suite updated to mock new DAL interfaces, all 230 tests passing.
  - Linting passed with 0 errors. Pushed to remote (`dcd6241`).

- **Status**: Completed.
- **Evidence**:
  - Performed security and production readiness audit. Confirmed route protection via Next.js `proxy.ts` instead of deprecated `middleware.ts`.
  - Refactored `src/app/admin/cabang/page.tsx` to abstract raw Supabase queries into a Data Access Layer (DAL) function `getPaginatedBranchesWithStats` in `src/lib/branches.ts`.
  - Demonstrated best practices for Server Components without exposing raw queries in the UI.
  - Linting passed cleanly; architecture set up for further DAL migrations.

## 2026-10-02 (Impeccable Audit & Remediation - Phase 2)
- **Status**: Completed secondary sweep requested by user.
- **Evidence**:
  - Replaced remaining `confirm()` calls in Kanban Board with `ConfirmDialog` state-driven UI.
  - Rewrote `draft/page.tsx` and `shift/page.tsx` completely to match UI standards (using `DataTable`, `MasterMobileCard`, and `SearchFilterBar`), solving layout discrepancies.
  - Test suite re-ran with 225 passing tests, ESLint passed zero errors.

## 2026-10-02 (Post-Audit Hardening & Shift Actions)
- **Status**: Completed.
- **Evidence**:
  - `npm run lint` passes with 0 errors and 0 warnings (strictly enforced).
  - `npm test` passes all 225 unit tests.
  - `npm run build` succeeds cleanly.
  - Eliminated `confirm()` in `kanban-board.tsx`.
  - Added `<ShiftStatusButton>` at `src/components/admin/shift/shift-status-button.tsx`.
  - Shift table and mobile card both support status toggles alongside editing.

## 2026-10-02 (Kanban Board Program Filter & Polish)
- **Status**: Completed.
- **Evidence**:
  - Added program dropdown filter and instant search clear button in Kanban Board sidebar (`src/components/admin/board/kanban-board.tsx`).
  - Teachers and students in the scheduling sidebar can now be filtered by active educational program (AHE, ASE, BEE, MAPEL, etc.) or viewed all at once.
  - Active tab badges in Kanban Board dynamically display accurate counts of available/unplaced candidates matching the active filter.
  - Cards highlight program badges and enrolled variant tags.
  - Added unit test in `tests/components/kanban-board.test.tsx` verifying multi-program filtering across both teacher and student tabs.
  - `./init.sh` succeeds with zero errors (226 tests passed, 0 lint errors, build succeeded).

## 2026-10-02 (Unified Status Toggle Icons)
- **Status**: Completed.
- **Evidence**:
  - Unified all 5 status buttons (`BranchStatusButton`, `GuruStatusButton`, `StudentStatusButton`, `ProgramStatusButton`, `ShiftStatusButton`) to use `PowerOff` (for deactivating, in rose) and `Power` (for activating, in emerald).
  - Added `Loader2` transition indicator and `showLabel` support to all status toggle buttons.
  - Eliminated visual collision with the `Eye` icon used for Detail views.
  - `npm run lint` passes with 0 errors and 0 warnings.
  - `npm test` passes all 226 tests.
  - `npm run build` production build succeeds.

## 2026-10-02 (Dynamic Scheduling Time Bounds)
- **Status**: Completed.
- **Evidence**:
  - Dropped `uq_teacher_shift_day` unique constraint via migration.
  - Added `start_time` and `end_time` to `schedule_classes`.
  - Created `ClassTimeModal` for assigning specific times during drag-and-drop on Kanban Board.
  - Updated backend `createScheduleClass` with validation for shift time boundaries and teacher class overlaps.
  - Sidebar reactively filters teachers based on available shift minutes vs scheduled minutes.
  - Supabase types updated and migrations pushed to remote production.
  - `npm run build` and `npm test` verified 100% passing.

## 2026-10-02 (Redistribute Dummy Students)
- **Status**: Completed.
- **Evidence**:
  - Pushed migration `20261002164312_redistribute_dummy_students.sql` to randomly assign the 20 dummy students to diverse programs (AHE, ASE, BEE, etc.) instead of everyone defaulting to the first variant.

## 2026-10-02 (Kanban Board Polish)
- **Status**: Completed.
- **Evidence**:
  - Added visual highlight/dimming search logic to Kanban board containers and placements.
  - Fixed DND-Kit event bubbling bug where full class blocked new session drop underneath.
  - Added "Kembali ke Draft" back button to `/admin/draft/[id]/board` page.
