# Technical Specification: Payroll Guru

- **Date:** 2026-10-16
- **Status:** Draft for Review
- **Parent Feature:** `feat-010` — Phase 2b ERP Payroll & Student Billing
- **Sub-project:** Payroll Guru
- **Dependencies:** `feat-008` Teacher Presence & Geolocation, `feat-009` Teaching Log & Student Session Cards
- **Related Business Spec:** `docs/rumus-gaji-guru.md`

---

## 1. Context and Scope

Uzma Course now has submitted Teaching Log rows with per-student fee snapshots and attendance statuses. The existing `/guru/honor` page only displays `minimum_income` and JSON allowances; it does not calculate a monthly statement, close a payroll period, or preserve a payment audit trail.

This sub-project implements the first half of `feat-010`: an auditable Payroll Guru ledger.

### In scope

- Monthly payroll periods with lifecycle `open -> closed -> paid`.
- Immutable fee lines derived from submitted `teaching_session_students`.
- Per-teacher monthly entries with fixed allowance snapshots.
- Append-only admin adjustments.
- Admin workflow to create/close/mark-paid periods and inspect totals.
- Guru workflow to read the current estimate and closed/paid statements.
- Fee calculation from submitted Teaching Log rows only.

### Explicitly out of scope

- Student Billing/SPP invoices; separate follow-up sub-project.
- Automatic bank transfer or payment gateway integration.
- Automatic `minimum_income` morning-floor calculation; the value is snapshotted for audit but excluded from the first total until typed allowance semantics exist.
- Automatic attendance/transport allowance ratios; existing `profiles.allowances` has only `{ name, amount }` fixed components.

---

## 2. Approved Business Rules

### 2.1 Period identity and lifecycle

- A payroll period is identified by the first day of a calendar month in WIB (`period_month`, e.g. `2026-10-01`).
- There is at most one period per month.
- `open`: source Teaching Logs may still be submitted; preview is live/read-only.
- `closed`: Admin has generated immutable fee lines and allowance snapshots; source changes after close do not change the period.
- `paid`: Admin confirms payout manually; monetary data remains immutable.
- Closing and marking paid are admin-only transitions and must be idempotence-safe; repeating a completed transition returns an explicit domain error.

### 2.2 Fee lines

At close, include every submitted `teaching_session_students` row whose parent `teaching_sessions.session_date` falls within the period:

- `present`: `payable_amount = teacher_fee_snapshot`.
- `absent`, `excused`, `cancelled`: `payable_amount = 0`.
- `cancelled` compensation is not automatic; Admin uses an adjustment row when policy requires it.
- A source child row can appear in at most one payroll period line.
- Draft Teaching Logs and unsubmitted rows are excluded.

### 2.3 Fixed allowances and minimum income

At close, snapshot the teacher's current `profiles.allowances` JSON and sum each numeric `amount` as fixed monthly allowances. Snapshot `profiles.minimum_income` as a separate audit field, but do not add a morning-floor adjustment in this sub-project.

Changes to profile allowances or minimum income after close MUST NOT mutate a closed/paid payroll entry.

### 2.4 Adjustments

- Admin adjustments are append-only rows with signed integer `amount` and required `reason`.
- Positive values add to payout; negative values deduct.
- Adjustments apply only to `closed` periods before payout; `paid` periods are immutable and require a separate correction period/adjustment process.
- Guru read access includes applied adjustments but no mutation access.

### 2.5 Total formula

```text
fee_sessions_total = SUM(payroll_session_lines.payable_amount)
allowances_total   = payroll_entries.fixed_allowances_total
adjustments_total  = SUM(payroll_adjustments.amount)
total_amount       = fee_sessions_total + allowances_total + adjustments_total
```

---

## 3. Data Model

### 3.1 `payroll_periods`

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_month DATE NOT NULL` with first-day-of-month CHECK
- `status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid'))`
- `closed_at TIMESTAMPTZ NULL`
- `closed_by UUID NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `paid_at TIMESTAMPTZ NULL`
- `paid_by UUID NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `created_at`, `updated_at`
- `UNIQUE(period_month)`

Status timestamp consistency:

- open: `closed_at`, `paid_at`, `closed_by`, `paid_by` null.
- closed: close fields set; paid fields null.
- paid: close and paid fields set.

### 3.2 `payroll_session_lines`

Immutable source snapshot per submitted Teaching Log child:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE RESTRICT`
- `teaching_session_student_id UUID NOT NULL REFERENCES teaching_session_students(id) ON DELETE RESTRICT`
- `teaching_session_id UUID NOT NULL REFERENCES teaching_sessions(id) ON DELETE RESTRICT`
- `teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT`
- `session_date DATE NOT NULL`
- `attendance_status TEXT NOT NULL CHECK (attendance_status IN ('present', 'absent', 'excused', 'cancelled'))`
- `teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0)`
- `payable_amount INTEGER NOT NULL CHECK (payable_amount >= 0)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `UNIQUE(teaching_session_student_id)`

Index `(period_id, teacher_id, session_date)` supports monthly statements.

### 3.3 `payroll_entries`

One teacher-period aggregate snapshot:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE RESTRICT`
- `teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `fee_sessions_total INTEGER NOT NULL DEFAULT 0 CHECK (fee_sessions_total >= 0)`
- `fixed_allowances_total INTEGER NOT NULL DEFAULT 0 CHECK (fixed_allowances_total >= 0)`
- `minimum_income_snapshot INTEGER NOT NULL DEFAULT 0 CHECK (minimum_income_snapshot >= 0)`
- `allowances_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb`
- `adjustments_total INTEGER NOT NULL DEFAULT 0`
- `total_amount INTEGER NOT NULL DEFAULT 0`
- `created_at`, `updated_at`
- `UNIQUE(period_id, teacher_id)`

Entries are generated for every active Guru profile at close, including zero-fee teachers, so the Admin period has a complete roster.

### 3.4 `payroll_adjustments`

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE RESTRICT`
- `teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `amount INTEGER NOT NULL CHECK (amount <> 0)`
- `reason TEXT NOT NULL CHECK (length(trim(reason)) > 0)`
- `created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

No update/delete policy is provided to preserve adjustment audit history.

---

## 4. Transactional Operations and Authorization

### 4.1 Close period RPC

Create an invoker-safe admin-only RPC:

```text
close_payroll_period(p_period_id UUID) -> payroll_periods
```

It MUST:

1. Resolve `auth.uid()` and require `public.is_admin()`.
2. Lock the open period row.
3. Reject a non-open period.
4. Insert one immutable `payroll_session_lines` row for every submitted Teaching Log child within the month; enforce source uniqueness.
5. Snapshot every active Guru's current allowances and minimum income.
6. Create/update one `payroll_entries` row per active Guru.
7. Include existing adjustments for the period in `adjustments_total`.
8. Calculate `total_amount` using the formula above.
9. Set period status to `closed`, with `closed_at` and `closed_by`.
10. Return the closed period.

The operation is one database transaction; partial period close is not acceptable.

### 4.2 Mark paid RPC

Create:

```text
mark_payroll_period_paid(p_period_id UUID) -> payroll_periods
```

It MUST require admin, lock the row, require `status = 'closed'`, set `paid_at`, `paid_by`, and `status = 'paid'`, then return the row.

### 4.3 Adjustment RPC

Create:

```text
add_payroll_adjustment(p_period_id UUID, p_teacher_id UUID, p_amount INTEGER, p_reason TEXT) -> payroll_adjustments
```

It MUST require admin, reject open and paid periods, validate non-zero amount/reason, insert append-only data, and update the affected `payroll_entries.adjustments_total` and `total_amount` atomically.

### 4.4 RLS

- Admin: full access to periods, lines, entries, and adjustments through `public.is_admin()`.
- Guru: SELECT own `payroll_entries`, own `payroll_session_lines`, and own `payroll_adjustments` through `teacher_id = auth.uid()`.
- Guru: no INSERT/UPDATE/DELETE on payroll tables.
- Close, paid, and adjustment RPCs enforce admin authorization independently of UI/RLS.

---

## 5. DAL and User Workflows

### 5.1 DAL

Create `src/lib/payroll.ts`:

- `getOpenPayrollPeriod(periodMonth)`
- `getPayrollPeriodForAdmin(periodId)`
- `getTeacherPayrollStatement(teacherId, periodId)`
- `createPayrollPeriod(adminId, periodMonth)`
- `closePayrollPeriod(adminId, periodId)`
- `markPayrollPeriodPaid(adminId, periodId)`
- `addPayrollAdjustment(adminId, input)`

All Supabase access remains in the DAL.

### 5.2 Admin workflow

Create `/admin/payroll` and Server Actions:

- Create/select an open month.
- Preview teacher roster, submitted fee lines, fixed allowances, adjustments, and totals.
- Close period with explicit confirmation state; no browser `confirm()`.
- Add signed adjustment with reason for closed periods before payout.
- Mark closed period Paid.
- Show immutable status badges and period totals.

### 5.3 Guru workflow

Replace the placeholder calculation in `/guru/honor` with a read-only statement:

- Current open-period estimate from submitted Teaching Logs plus current fixed allowances.
- Closed/paid period selector and statement details.
- Fee session total, fixed allowances, adjustments, total payout, and payout status.
- No Guru mutation controls.

---

## 6. Testing Strategy

### Schema/security

- Migration test verifies tables, constraints, indexes, RLS policies, RPC names, and status transitions.
- Domain tests verify only submitted rows close, absent/excused/cancelled payable amounts are zero, duplicate source rows cannot be inserted, and closed/paid transitions reject invalid order.

### Payroll calculation

- Pure calculation tests cover fee lines, fixed allowance sum, signed adjustments, zero-fee teachers, and total formula.
- Snapshot tests cover fee/allowance changes after close not changing stored values.
- Admin action tests cover unauthenticated/non-admin rejection and explicit error results.

### UI

- Admin payroll tests cover period creation, close/paid lifecycle, adjustment validation, and disabled controls by status.
- Guru honor tests cover open estimate, closed/paid statement, and absence of mutation controls.
- Responsive smoke covers 360px, 375px, and 1280px with zero horizontal overflow.

---

## 7. Definition of Done

- [ ] Payroll period lifecycle works: open, close, paid.
- [ ] Fee ledger is generated only from submitted Teaching Logs and is immutable after close.
- [ ] Fixed allowances and minimum income are snapshotted; fixed allowances contribute to total.
- [ ] Cancelled sessions pay zero automatically; Admin adjustments handle exceptions.
- [ ] Admin can create/close/mark-paid periods and add auditable adjustments.
- [ ] Guru can read open and closed/paid statements without mutation access.
- [ ] All schema changes are versioned migrations; DAL boundary is respected.
- [ ] `./init.sh` and responsive smoke pass.
- [ ] `feature_list.json`, `progress.md`, and `session-handoff.md` contain evidence.
