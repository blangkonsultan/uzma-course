# Progress Log

## 2026-10-03 (Security Audit & Architecture Refactoring)
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
