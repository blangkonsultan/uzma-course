# Payroll Guru Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an auditable monthly Payroll Guru ledger with immutable fee lines, allowance snapshots, admin period controls, and read-only Guru statements.

**Architecture:** Add four normalized payroll tables and three admin-only transactional RPCs. Keep fee calculation in pure tested functions and database close logic as the transaction boundary. Expose all reads/mutations through `src/lib/payroll.ts` and Server Actions; replace the current honor placeholder with a read-only statement and add a dedicated Admin payroll page.

**Tech Stack:** Next.js 16.3.7 App Router, React 19.2.8, TypeScript, Supabase/Postgres migrations and RPC, Tailwind CSS v4, Vitest 5, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-16-payroll-guru-design.md`

## Global Constraints

- Period lifecycle MUST be `open -> closed -> paid`.
- Fee lines MUST come only from submitted `teaching_session_students` rows.
- `present` pays `teacher_fee_snapshot`; `absent`, `excused`, and `cancelled` pay zero automatically.
- Fixed allowances and `minimum_income` MUST be snapshotted at close; fixed allowances contribute to total, `minimum_income` does not yet create a morning-floor adjustment.
- Adjustments MUST be append-only and allowed only for `closed` periods; `paid` periods are immutable.
- Admin mutations MUST require `requireAdminAction()` and database RPC authorization.
- Guru payroll data is read-only; no UI raw Supabase query is allowed.
- All schema changes MUST be versioned migrations.
- No new third-party dependency, automatic bank transfer, SPP billing, or typed allowance migration.
- Responsive surfaces MUST pass 360px, 375px, and 1280px with zero horizontal overflow.

## Review Focus

- Closing a period twice or paying an open/paid period must fail atomically without duplicate lines or mutated totals.
- A draft/unsubmitted Teaching Log must never produce a payroll line; a source child must never appear in two periods.
- Fee, allowance, and minimum-income master changes after close must not alter closed/paid snapshots.
- Cancelled lines must be zero and signed adjustments must affect only the target teacher/period with a required reason.
- Guru must see only own statements and no mutation controls; Admin controls must reflect period status.

---

### Task 1: Payroll schema, close/paid/adjustment RPCs, types, and RLS

**Files:**
- Create: `supabase/migrations/20261016150000_create_payroll_guru.sql`
- Modify: `src/types/database.ts` to add payroll tables and RPC signatures
- Create: `tests/security/payroll-migration-schema.test.ts`

**Interfaces:**
- Tables: `payroll_periods`, `payroll_session_lines`, `payroll_entries`, `payroll_adjustments`.
- RPCs: `close_payroll_period(p_period_id uuid)`, `mark_payroll_period_paid(p_period_id uuid)`, `add_payroll_adjustment(p_period_id uuid, p_teacher_id uuid, p_amount integer, p_reason text)`.
- RLS: Admin full access; Guru SELECT own rows only; Guru no payroll mutations.

- [ ] **Step 1: Write failing schema/security tests**
  - Assert all four table definitions, unique/source constraints, period status/timestamp constraints, payable/amount checks, indexes, RLS, admin/Guru policies, and all RPC names.
  - Assert RPC SQL references submitted Teaching Log rows, `teacher_fee_snapshot`, `public.is_admin()`, row locks, and `status = 'paid'` transition.
  - Assert `src/types/database.ts` exposes table and function contracts.

- [ ] **Step 2: Run focused schema tests to verify failure**
  - Run: `npx vitest run tests/security/payroll-migration-schema.test.ts --coverage.enabled=false`
  - Expected: FAIL because payroll migration/types do not exist.

- [ ] **Step 3: Implement migration and types**
  - Create tables, history-preserving FKs, indexes, timestamp triggers, status consistency checks, and RLS.
  - Implement `close_payroll_period` as one admin transaction: lock open period, insert unique submitted source lines, snapshot active Guru allowances/minimum income, create zero-inclusive entries, apply existing closed-period adjustments, calculate totals, and close the period.
  - Implement `mark_payroll_period_paid` with closed-only locking and immutable paid transition.
  - Implement `add_payroll_adjustment` with closed-only validation, append-only insert, and atomic affected-entry total update.
  - Add generated-style database table/function types.

- [ ] **Step 4: Run focused schema tests to verify green**
  - Run: `npx vitest run tests/security/payroll-migration-schema.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 5: Commit the schema task**
  - Run: `git add supabase/migrations/20261016150000_create_payroll_guru.sql src/types/database.ts tests/security/payroll-migration-schema.test.ts && git commit -m "feat: add Payroll Guru schema and RPCs"`

### Task 2: Payroll calculations, DAL, and Admin Server Actions

**Files:**
- Create: `src/lib/payroll.ts`
- Create: `src/app/admin/payroll/actions.ts`
- Create: `tests/crud/payroll-calculation.test.ts`
- Create: `tests/crud/payroll-dal.test.ts`
- Create: `tests/security/payroll-actions.test.ts`

**Interfaces:**
- `PayrollStatus = "open" | "closed" | "paid"`.
- `calculatePayrollTotals(lines, allowances, adjustments): { fee_sessions_total; fixed_allowances_total; adjustments_total; total_amount }`.
- `getOpenPayrollPeriod(periodMonth)`.
- `getPayrollPeriodForAdmin(periodId)`.
- `getTeacherPayrollStatement(teacherId, periodId)`.
- `createPayrollPeriod(adminId, periodMonth)`.
- `closePayrollPeriod(adminId, periodId)`.
- `markPayrollPeriodPaid(adminId, periodId)`.
- `addPayrollAdjustment(adminId, input)`.
- Server Actions call `requireAdminAction()` and return explicit `{ data?, error? }` results.

- [ ] **Step 1: Write failing calculation/DAL/action tests**
  - Calculation tests cover present/absent/excused/cancelled lines, fixed allowance sum, signed adjustments, zero-fee teachers, and total formula.
  - Snapshot tests prove calculation consumes stored snapshot values, not current program/profile values.
  - DAL tests cover explicit database errors and statement shaping.
  - Action tests cover non-admin rejection, invalid month/amount/reason, and explicit error results.

- [ ] **Step 2: Run focused tests to verify failure**
  - Run: `npx vitest run tests/crud/payroll-calculation.test.ts tests/crud/payroll-dal.test.ts tests/security/payroll-actions.test.ts --coverage.enabled=false`
  - Expected: FAIL because Payroll DAL/calculation/actions do not exist.

- [ ] **Step 3: Implement pure calculations and DAL**
  - Implement `calculatePayrollTotals` without database access.
  - Implement DAL queries for period/statement reads and RPC calls for mutations; map failures to explicit domain errors.
  - Do not recompute closed amounts from mutable master records.

- [ ] **Step 4: Implement Admin Server Actions**
  - Add actions for period creation, close, mark-paid, and signed adjustment.
  - Require admin before validation/mutation; reject paid-period adjustments.

- [ ] **Step 5: Run focused tests to verify green**
  - Run: `npx vitest run tests/crud/payroll-calculation.test.ts tests/crud/payroll-dal.test.ts tests/security/payroll-actions.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 6: Commit the DAL/action task**
  - Run: `git add src/lib/payroll.ts src/app/admin/payroll/actions.ts tests/crud/payroll-calculation.test.ts tests/crud/payroll-dal.test.ts tests/security/payroll-actions.test.ts && git commit -m "feat: add Payroll Guru DAL and actions"`

### Task 3: Admin payroll controls and Guru honor statement

**Files:**
- Create: `src/app/admin/payroll/page.tsx`
- Create: `src/components/admin/payroll/payroll-period-client.tsx`
- Create: `src/components/admin/payroll/payroll-adjustment-form.tsx`
- Modify: `src/app/guru/honor/page.tsx`
- Create: `tests/components/payroll-period-client.test.tsx`
- Modify/Create: `tests/pages/guru-honor.test.tsx`

**Interfaces:**
- Admin page uses `requireAdminPage()` and DAL read models; no raw Supabase calls.
- Admin client calls the four Server Actions and renders period status/controls.
- Guru honor page uses `requireGuruPage()` and `getTeacherPayrollStatement()`; it has no mutation action.

- [ ] **Step 1: Write failing UI tests**
  - Admin tests cover period selection/creation, close confirmation state, paid transition, signed adjustment validation, and disabled controls for paid periods.
  - Guru tests cover open estimate, closed/paid statement, fee/allowance/adjustment/total rows, and absence of mutation controls.
  - Test mobile action bars and status cards at the component level.

- [ ] **Step 2: Run focused UI tests to verify failure**
  - Run: `npx vitest run tests/components/payroll-period-client.test.tsx tests/pages/guru-honor.test.tsx --coverage.enabled=false`
  - Expected: FAIL because the Admin payroll page and statement replacement do not exist.

- [ ] **Step 3: Implement Admin payroll page/client**
  - Use existing Admin shell/PageHeader/Card/Button conventions.
  - Render period status, teacher entries, line detail, fixed allowance snapshot, adjustments, and totals.
  - Replace browser `confirm()` with state-driven confirmation UI.
  - Disable close/paid/adjustment controls according to period status.

- [ ] **Step 4: Implement Guru statement**
  - Replace placeholder `/guru/honor` amount with current open estimate or selected closed/paid statement.
  - Render immutable fee sessions, fixed allowances, adjustments, total, and payout status.
  - Preserve existing bank information and minimum-income display as snapshot metadata, not an uncomputed floor.

- [ ] **Step 5: Run focused UI tests to verify green**
  - Run: `npx vitest run tests/components/payroll-period-client.test.tsx tests/pages/guru-honor.test.tsx --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 6: Commit the user workflow task**
  - Run: `git add src/app/admin/payroll src/components/admin/payroll src/app/guru/honor/page.tsx tests/components/payroll-period-client.test.tsx tests/pages/guru-honor.test.tsx && git commit -m "feat: add Payroll Guru controls and statement"`

### Task 4: Full verification, smoke checks, and artifacts

**Files:**
- Modify: `progress.md`
- Modify: `session-handoff.md`
- Modify: `feature_list.json`

**Interfaces:**
- Consumes completed schema, calculations, DAL/actions, Admin page, and Guru statement.
- Produces evidence for the Payroll Guru sub-project while leaving Student Billing unstarted.

- [ ] **Step 1: Run full verification**
  - Run: `./init.sh`
  - Expected: zero lint errors/warnings, all Vitest suites pass above thresholds, clean Webpack build.

- [ ] **Step 2: Run real local smoke**
  - Use local non-production Supabase test accounts.
  - Admin: create an open period, close it, add a closed-period adjustment, mark it paid.
  - Guru: read open and paid statements; verify no mutation controls.
  - Verify 360px, 375px, and 1280px with zero horizontal overflow.

- [ ] **Step 3: Update artifacts**
  - Record Payroll Guru evidence in `progress.md`, `session-handoff.md`, and `feature_list.json`.
  - Keep Student Billing explicitly not started and note its dependency on the next sub-project.

- [ ] **Step 4: Commit artifacts and confirm clean state**
  - Run: `git diff --check && git status --short`
  - Commit: `git add progress.md session-handoff.md feature_list.json && git commit -m "docs: record Payroll Guru completion"`
