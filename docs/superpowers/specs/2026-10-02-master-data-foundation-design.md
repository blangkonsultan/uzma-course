# Technical Specification: Master Data Foundation for ERP Transactions (Phase 2b Readiness)

- **Date:** 2026-10-02
- **Status:** Approved Draft (Architectural Brainstorming Consensus)
- **Target Modules:** Phase 2b ERP Foundation (Presensi, Kartu Mengajar, Jadwal, SPP, Payroll)
- **Author:** Assistant (CEO Engineering Partner) & Project Owner

---

## 1. Executive Summary & Problem Context

Uzma Course is transitioning from basic Master Data management (Phase 2a: Programs, Branches, Teachers, Students) into operational ERP transaction workflows (Phase 2b: Teacher Presence & Geofence, Digital Teaching Cards, Payroll Engine, Student Billing).

During business logic analysis of historical teaching logs (`docs/rumus-gaji-guru.md`) and operational requirements, critical gaps were identified:
1. **Program Duration & Fee Variability**: Programs like BEE have multiple session lengths (30, 45, 60 minutes) with varying teacher fees and SPP rates. Hardcoding single flat fees on parent programs is insufficient.
2. **Individual Student SPP & Multi-Program Enrollment**: A student can enroll in multiple programs/variants. Tuition rates (`spp_amount`) vary per student, and parents receive an on-time payment incentive discount.
3. **Rolling 28-Day Cycle**: Each student operates on an independent 28-day cycle starting on their personal enrollment date. Billing occurs on the first day of each new cycle, with on-time discount eligibility expiring at 23:59 WIB on Day 1.
4. **Child-Centric Interactive Scheduling (Auto-Drafting)**: Because tutoring young children requires evaluating child personality and chemistry, scheduling cannot be a black-box batch generator. Instead, the system must provide an intelligent **Drafting Generator** that recommends available slots and qualified teachers, allowing admins to adjust/swap slots before committing.
5. **Flexible Branch Shifts**: Operating shifts and hours differ by branch and season (e.g. shorter hours during Ramadan) and must not be hardcoded in application logic.

---

## 2. Core Architectural Decisions

### 2.1 Entity Separation: Brand Program vs. Operational Variant
- **`programs` (Parent)**: Represents public brand catalog on landing page (`ahe`, `ase`, `bee`, `mapel`).
- **`program_variants` (Child)**: Encapsulates operational execution parameters:
  - `duration` (integer minutes: 30, 45, 60)
  - `system` (integer student capacity per teacher: 1 for private, 2 for AHE/BEE, 4 for group)
  - `teacher_fee` (honorarium per session, immutable snapshot source for teaching logs)
  - `default_spp` (benchmark monthly SPP for 28-day cycle)

### 2.2 Relational Junction: `student_programs` with Variant Mapping
- Maps `students` $\leftrightarrow$ `program_variants` (and references parent `programs`).
- Stores per-student financial and cycle parameters:
  - `spp_amount`: Agreed individual tuition for this variant.
  - `on_time_discount_type`: `'nominal'` or `'percentage'` or `'none'`.
  - `on_time_discount_value`: Integer value (Rp amount or 0–100%).
  - `cycle_start_date`: Date student begins the current 28-day period.
  - `cycle_days`: Default 28 days.
  - `status`: `'active'`, `'cuti'`, `'lulus'`, `'keluar'`.

### 2.3 Branch Shift Master: `branch_shifts`
- Replaces hardcoded shift assumptions with database-configurable branch operational shifts.
- Fields: `branch_id`, `name` (e.g., `'PAGI'`, `'SORE'`, `'RAMADHAN_SIANG'`), `day_of_week` (1=Mon .. 7=Sun), `start_time` (TIME), `end_time` (TIME), `is_active`.
- Determines valid time slots for attendance check-ins and session scheduling.

### 2.4 Teacher Availability & Compensation Baseline
- **Pool Availability**: Teachers are available across their branch operating hours according to certified programs (`profile_programs`), unless on approved leave (`ijin`/`sakit`).
- **Home Branch Priority**: Teachers default to their primary `branch_id`. Cross-branch substitution is supported but reserved for exceptional force-majeure reassignments.
- **Allowance Configuration**: Monthly allowances (`allowance_transport`, `allowance_presence`, `allowance_creativity`, `allowance_education`, `morning_guarantee_threshold`) stored in `profiles` to power the automated payroll engine.

### 2.5 28-Day Billing & On-time Discount Rules
- **Cycle Calculation**: For start date $D_0$, cycle ends on $D_0 + 27$. Next cycle starts on $D_0 + 28$.
- **Invoice Generation**: Auto-generated on Day 1 of the new cycle.
- **On-time Discount Validity**:
  - Payment timestamp $\le$ Day 1 23:59:59 WIB $\rightarrow$ apply `on_time_discount_value` (or if paid in advance before the cycle begins).
  - Payment timestamp $\ge$ Day 2 00:00:00 WIB $\rightarrow$ revert to full `spp_amount`.

### 2.6 Payment Workflows, Arrears & Advance Payments
- **Cash Payments & Bank Accounts**: Teacher compensation is primarily cash, but optional bank account fields are provided for flexibility. SPP collection is handled via cash to the teacher, who informs the admin off-system. Admin marks the invoice as `PAID` in the system.
- **Advance Payments**: Parents paying multiple cycles in advance (e.g., 3 months) receive the on-time discount for all future cycles paid upfront.
- **Arrears**: If a parent is late by 2 months and pays in the 3rd month on the first cycle day, the 2 late months are billed at the full rate (no discount), while the 3rd (current) month receives the on-time discount.
- **Teacher UI Alert**: When a teacher marks attendance on the first day of a student's cycle, the UI displays a reminder that SPP is due, including the specific nominal/discount amount, so the teacher can remind the parent.

### 2.7 Schedule Drafting Engine (Auto-Draft + Tweak)
- **Quota Target**: Calculated as $\text{frequency (sessions/week)} \times 4 \text{ weeks} = \text{total sessions per 28 days}$.
- **Draft Generator Algorithm**:
  1. Scan student's enrolled variants and session quota.
  2. Filter branch operating shifts for valid days.
  3. Identify qualified teachers (`profile_programs`) with remaining capacity in that time slot (respecting variant `system` limit).
  4. Output proposed draft schedule.
- **Admin Review**: Admin reviews proposed draft in an interactive matrix, swaps slots or reassigns teachers based on child demeanor, and commits the finalized schedule.
---

## 3. Database Schema Blueprint (DDL)

```sql
-- 1. Program Variants Table
CREATE TABLE public.program_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 30, -- minutes
    system INTEGER NOT NULL DEFAULT 2,   -- max students per teacher
    teacher_fee INTEGER NOT NULL DEFAULT 3000, -- IDR fee per session
    default_spp INTEGER NOT NULL DEFAULT 150000, -- IDR default tuition
    sort_order INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_program_variants_program ON public.program_variants(program_id);

-- 2. Branch Shifts Table
CREATE TABLE public.branch_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'PAGI', 'SORE', 'KHUSUS'
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_branch_shifts_branch_day ON public.branch_shifts(branch_id, day_of_week);

-- 3. Upgrade student_programs Junction
ALTER TABLE public.student_programs
    ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.program_variants(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS on_time_discount_type TEXT CHECK (on_time_discount_type IN ('none', 'nominal', 'percentage')) DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS on_time_discount_value INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cycle_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS cycle_days INTEGER NOT NULL DEFAULT 28;

-- 4. Teacher Monthly Allowance Baseline on profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
    ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
    ADD COLUMN IF NOT EXISTS allowance_transport INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_presence INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_creativity INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS allowance_education INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS morning_guarantee_threshold INTEGER NOT NULL DEFAULT 250000;
```

---

## 4. UI & Admin Workflows

1. **Master Program Enhancement (`/admin/program/[id]` & edit)**:
   - Dedicated "Varian & Tarif" management section.
   - Admin can add/edit variants (e.g. BEE 30 Menit, BEE 45 Menit, BEE 60 Menit) with respective duration, capacity, teacher fee, and default SPP.
2. **Master Murid Enrollment (`/admin/murid/[id]/edit` & tambah)**:
   - Multi-variant selector allowing parents to enroll in multiple programs/variants.
   - Per-variant pricing inputs: Individual `spp_amount`, discount toggle (`nominal` / `percentage`), discount value, and `cycle_start_date`.
3. **Master Shift Cabang (`/admin/cabang/[id]/shifts`)**:
   - Manage operational shifts per branch, adjusting morning/afternoon start and end times.
4. **Drafting Calendar Board (`/admin/jadwal`)**:
   - Filter by student, branch, and cycle period.
   - One-click "Generate Rekomendasi Jadwal".
   - Visual slot grid with drag-and-drop or modal slot replacement (swap with another student or change assigned teacher).
   - "Simpan Jadwal 28 Hari" action.

---

## 5. Verification & Testing Strategy

- **Schema Integrity**: Migration runs cleanly with zero regressions on existing student and program rows.
- **Discount Calculation Tests**: Unit test suites covering:
  - Exact on-time payment on Day 1 ($D_0 \le 23:59:59$) $\rightarrow$ discount deducted.
  - Late payment on Day 2 ($D_1 \ge 00:00:00$) $\rightarrow$ full tuition charged.
  - Percentage discount math ($10\%$ of Rp 200.000 = Rp 20.000).
  - Nominal discount math (Rp 15.000 off Rp 150.000 = Rp 135.000).
- **Quota & Schedule Generator Tests**:
  - Program with 3x/week frequency produces exactly 12 draft session slots for 28 days.
  - System capacity limit respected: 2 students max per AHE slot; 1 student max per MAPEL slot.
  - Teacher eligibility respected: only teachers with `profile_programs` match are assigned.
- **Harness Verification**: `./init.sh` must execute with 100% pass rate (ESLint, Vitest, Turbopack Build).
