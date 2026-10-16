# Progress Log
## 2026-10-16 (Phase 5 CMS Integrity & Landing Polish Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - **A20 — TikTok resolver hardening**: `resolveTikTokShortlink()` now requires admin authorization, parses HTTPS URLs, enforces the exact TikTok host allowlist, rejects credentials, validates the final redirect, and extracts only valid 15–22 digit video IDs with a path boundary that prevents truncation or suffix acceptance. The CMS editor recognizes both `vt.tiktok.com` and `vm.tiktok.com`, including case-insensitive input.
  - **A21 — Image normalization and gallery fallback**: `normalizeImageUrl()` rejects `javascript:`, `data:`, and `vbscript:` schemes, converts protocol-relative URLs to HTTPS, and preserves local/Google Drive conversions. Gallery previews now render a placeholder after load failure, reset when the URL changes, and retain failure state by image identity through image/group reorder and deletion.
  - **A22 — Sortable CMS state**: `SortableItemList` swaps collapse state on moves and shifts surviving indices after deletion.
  - **A24 — Public landing polish**: all landing section anchors use `scroll-mt-20`, the floating WhatsApp control uses only safe-area-aware bottom/right positioning, and `landing-content.ts` uses a top-level `Program` type import.
  - Added regression suites: `tests/security/tiktok-resolver.test.ts`, `tests/utils/image-normalizer.test.ts`, `tests/components/gallery-form.test.tsx`, and `tests/components/sortable-item-list.test.tsx`; extended CMS and landing component coverage.
  - Full `./init.sh` passed: 0 ESLint errors/warnings, **52 Vitest suites / 334 tests passed**, coverage at **63.74% statements, 59.03% branches, 66.45% functions, 64.88% lines**, and clean production Webpack build.
  - Final browser smoke passed at **360px, 375px, and 1280px** with zero horizontal overflow. The desktop `#programs` anchor settled at `80px` below the viewport top; safe-area-aware WhatsApp positioning stayed inside the viewport at all tested widths.
  - **Commits**: `1dd30c4` (plan), `d915383` (A20), `7f9fd0b` (A21), `1457a39` (A22), `ce3da03` (A24), `2f1d44c` (review fixes).

## 2026-10-16 (feat-009 Teaching Log Completed)
- **Status**: Completed; authenticated local Guru smoke passed and local Supabase smoke data was reset afterward.
- **Evidence**:
  - Added `supabase/migrations/20261016120000_create_teaching_logs.sql` with normalized session/student tables, RLS, teacher-owned draft rules, fee snapshots, and transactional save/submit RPCs.
  - Added typed DAL/actions in `src/lib/teaching-logs.ts` and `src/app/guru/mengajar/actions.ts`.
  - Added `/guru/mengajar/[id]`, `TeachingLogForm`, weekday-aware schedule links, editable historical date selection, per-student attendance/capaian/catatan fields, draft save, submit-that-saves-in-memory-edits, submitted locking, archived-draft history readback, and invalid-date fallback.
  - Added migration, validation, DAL/action, route-security, form, and schedule-link regression tests.
  - Full `./init.sh` passed: **59 Vitest suites / 363 tests**, 65.38% statements, 60.40% branches, 68.18% functions, 66.50% lines, 0 lint errors/warnings, and clean Webpack build.
  - Authenticated local Guru smoke passed: login → `/guru/jadwal` → `/guru/mengajar/[id]`, draft save, reload persistence, direct submit with in-memory edits, submitted read-only reload, and zero horizontal overflow at 360px, 375px, and 1280px. Local smoke accounts/data were reset after verification.
- **Commits**: `8a0b831` (schema/RPC), `e6bd138` (plan/test alignment), `b824dc0` (DAL/actions), `c8aa975` (workflow plan alignment), `b536d87` (teacher workflow), `cc08a84` (review fixes), `be85f86` (RLS/date fixes).

## 2026-10-15 (Phase 5 CMS Integrity & Landing Polish Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 5: `docs/superpowers/specs/2026-10-15-phase5-cms-integrity-landing-polish-design.md`.
  - Covers A20 (TikTok shortlink resolver SSRF hardening, HTTPS enforcement, and host allowlist), A21 (image normalizer scheme sanitization, protocol-relative normalization, and gallery preview fallback), A22 (`SortableItemList` collapse state stability on reorder and delete), and A24 (landing section anchor offsets `scroll-mt-20`, floating WhatsApp iOS safe area, and type annotation standard).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 4 Scheduling Invariants, Multi-Branch Allocation & Modal Accessibility Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - **Task 1: Multi-Branch Teacher Allocation & Cross-Branch Overlap Validation (A4, A5, A14)**: Updated `getBoardData` in `src/lib/board.ts` to include teachers assigned via `profile_branches` junction table. Enforced positive time ordering (`start_time < end_time`), shift boundaries, and cross-branch teacher overlap detection across active drafts in `insertScheduleClass` (`tests/crud/multi-branch-scheduling.test.ts` passing 3 tests).
  - **Task 2: Student Number Format (01001 / 02001) & Preservation on Edit (A10)**: Implemented canonical 5-digit format (`01001` for Sumokembangsri, `02002` for Junwangi) in `generateStudentNumber` in `src/lib/students.ts`, and preserved existing student numbers during ordinary edits in `src/app/admin/murid/actions.ts:updateStudent` (`tests/crud/student-number-stability.test.ts` passing 2 tests).
  - **Task 3: Active Enrollment Filtering & Weekly Quota Enforcement (A11, A12, A13)**: Filtered active program enrollments (`status = 'active'`) and enforced weekly frequency quotas (`variant.frequency`) in `AddStudentModal` and `src/lib/board.ts:insertSchedulePlacement`. Filtered inactive variants in `student-form.tsx` (`tests/crud/weekly-quota-placement.test.ts` passing 2 tests).
  - **Task 4: Positive Ordered Shift Ranges, Safe Shift Narrowing & Variant Numbers Validation (A15, A16, A23)**: Enforced `start_time < end_time` on shift create/update in `src/app/admin/shift/actions.ts`, prevented shift narrowing when existing classes are stranded in `src/lib/shifts.ts:updateBranchShift`, and validated positive operational numbers (`duration > 0, frequency > 0, system > 0`) in `src/app/admin/program/actions.ts` (`tests/crud/shift-time-validation.test.ts` and `tests/crud/program-numbers-validation.test.ts` passing 5 tests).
  - **Task 5: Kanban Board Modal Focus Traps, Accessibility & Day Locking (A26)**: Added dialog semantics (`role="dialog"`, `aria-modal="true"`), Tab focus traps, Escape key listeners, and day locking across `AddClassModal`, `AddStudentModal`, and `ClassTimeModal` (`tests/components/board-modal-accessibility.test.tsx` passing 3 tests).
  - **Task 6: Full Verification Harness & Documentation Gate**: Verified via `./init.sh`: 0 ESLint errors/warnings, 48 Vitest suites (302 tests passing, 63.07% statements, 58.74% branches, 65.79% functions, 64.23% lines exceeding all thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 4 Scheduling Invariants & Modal Accessibility Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 4: `docs/superpowers/specs/2026-10-15-phase4-scheduling-class-allocation-design.md`.
  - Documented automated test suites across Vitest and clear Definition of Done.

## 2026-10-15 (Phase 3 Teacher Attendance Lifecycle & PWA Offline Model Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - Added `getWIBDateBounds` in `src/lib/attendances.ts` and created database migration `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql` adding `shift_id` to `teacher_attendances` with session index (`tests/utils/wib-timezone.test.ts` and `tests/security/attendance-migration-schema.test.ts` passing 5 tests).
  - Enforced strict database mutation error throwing in `insertCheckIn` / `updateCheckOut`, deterministic client UUID upsert with idempotency, and server-side geofence radius validation in `src/app/guru/absen/actions.ts:processOnlineCheckIn` (`tests/crud/attendance-server-validation.test.ts` passing 4 tests).
  - Modernized `src/lib/pwa/db.ts` with `transaction.oncomplete` disk persistence, added `attendance_id` and `shift_id` to `PendingAttendance`, isolated offline queues per teacher ID, and synchronized targeted check-outs in `syncOfflineAttendances` (`tests/pwa/offline-queue-lifecycle.test.ts` passing 3 tests).
  - Stabilized attendance client state with `isSyncingRef` preventing infinite re-sync loops, guarded location unmount lifecycle with `isMountedRef`, cleared stale coordinates on GPS error, handled empty branches without crashing, sorted shifts by teacher bounds, and updated toast mobile geometry (`tests/components/toast-responsive.test.tsx` passing 1 test).
  - Verified full test suite and build via `./init.sh`: 0 ESLint errors/warnings, 42 Vitest suites (287 tests passing, 61.83% statements, 58.22% branches, 64.92% functions, 62.92% lines exceeding all thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 3 Teacher Attendance Lifecycle & PWA Offline Model Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 3: `docs/superpowers/specs/2026-10-15-phase3-teacher-attendance-pwa-design.md`.
  - Covers G1 (database error checking before acknowledgement), G2 (server-side geofence and schedule validation in `processOnlineCheckIn`), G3 (targeted offline checkout matching `record.attendance_id`), G4 (shift-aware attendance schema with `shift_id` on `teacher_attendances`), G5 & G7 (deterministic client UUID generation and idempotent insertion), G8 (teacher-scoped queue isolation), G9 (single-flight sync guard stopping infinite re-sync loops), G10 (canonical `Asia/Jakarta` date/weekday normalization), G11 & G12 (replacing `Promise.withResolvers` with standard `Promise` and confirming on `transaction.oncomplete`), and G21 (responsive mobile toast layout).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 2 Master Data CRUD Integrity Implementation Completed)
- **Status**: Completed.
- **Evidence**:
  - Aligned student enrollment status vocabulary to canonical schema constraint (`active`, `cuti`, `lulus`, `keluar`) in `src/types/index.ts`, `src/components/admin/murid/student-form.tsx`, and `src/app/admin/murid/[id]/page.tsx` (`tests/crud/student-form-status.test.tsx` passing 2 tests).
  - Made student enrollment updates atomic and non-destructive with pre-validation and memory backup/compensating restore in `src/lib/students.ts:updateStudentData` (`tests/crud/student-enrollment-sync.test.ts` passing 3 tests).
  - Pre-allocated UUIDs upfront for new program variants in `src/app/admin/program/actions.ts:updateProgram` and safely retained all IDs in `src/lib/programs.ts:updateProgramData` with human-friendly FK restrict error reporting (`tests/crud/program-variant-sync.test.ts` passing 2 tests).
  - Added compensating rollback deleting orphan Auth accounts on failed teacher provisioning in `src/lib/gurus.ts:insertGuruProfile` and verified `{ error }` inspection on `profile_branches` mutations (`tests/crud/guru-provisioning-rollback.test.ts` passing 2 tests).
  - Removed obsolete destructive `seed-variants.mjs` script from repository root (`tests/crud/seed-script-quarantine.test.ts` passing 2 tests).
  - Verified full test suite and build via `./init.sh`: 0 ESLint errors/warnings, 37 Vitest suites (274 tests passing, 62.05% statements, 58.59% branches, 65.02% functions, 63.07% lines exceeding all global coverage thresholds), and clean Webpack production build.

## 2026-10-15 (Phase 2 Master Data CRUD Integrity Spec Completed)
- **Status**: Completed (Design & Specification Gate).
- **Evidence**:
  - Formulated full architectural specification for Phase 2: `docs/superpowers/specs/2026-10-15-phase2-master-data-crud-integrity-design.md`.
  - Covers A1 (student enrollment status vocabulary alignment to `active|cuti|lulus|keluar` and data-loss prevention on update), A2 & A3 (upfront client UUID generation for new program variants and safe retention in delete query), A17 (FK constraint error surface for in-use variant deletions), A18 (explicit error checks for `profile_branches` mutations), A25 (compensating rollback for failed teacher provisioning deleting orphan auth users), and O2 (removal of obsolete destructive `seed-variants.mjs`).
  - Documented automated test suites across Vitest and clear Definition of Done.
  - No implementation code touched yet; awaiting user review gate before implementation planning.

## 2026-10-15 (Phase 1 Security & Database Authorization Hardening Implementation)
- **Status**: Completed.
- **Evidence**:
  - Implemented `sanitizeNextUrl` in `src/lib/security.ts` and integrated into `src/components/admin/login-form.tsx` to prevent open redirects, executable script schemes, and protocol-relative URLs (`tests/security/login-redirect.test.ts` passing 7 tests).
  - Hardened `extractCoordinatesFromUrl` in `src/lib/maps.ts` with `requireAdminAction()` and strict HTTPS Google Maps host allowlisting (`tests/security/maps-action.test.ts` passing 6 tests).
  - Hardened Service Worker in `src/app/sw.ts` with top-priority `NetworkOnly` boundary on `/admin/*`, `/api/*`, `/login`, and `/logout`, and added activation cache cleanup for legacy response caches while strictly preserving IndexedDB offline queues (`tests/pwa/sw-cache-policy.test.ts` passing 4 tests).
  - Created migration `supabase/migrations/20261015100000_phase1_security_hardening.sql` hardcoding `role = 'guru'` in `handle_new_user()` and enabling RLS with admin mutation policies on `program_variants` and `branch_shifts` (`tests/security/migration-schema.test.ts` passing 4 tests).
  - Full verification suite `./init.sh` passed: 0 ESLint errors/warnings, 32 Vitest suites (263 tests passing, 60.64% statements, 57.33% branches, 64.27% functions, 61.61% lines), and clean Webpack production build.

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
