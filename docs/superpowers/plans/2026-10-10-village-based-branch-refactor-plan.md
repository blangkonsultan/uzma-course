# Village-Based Branch Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor tutoring branches to be village-based (`Cabang Sumokembangsri` & `Cabang Junwangi`), add structured `kecamatan` and `desa` columns, migrate existing data with cascading updates, update Admin CRUD forms, and align public landing components and tests.

**Architecture:** Database schema migration using PostgreSQL `ON UPDATE CASCADE` to atomically update primary keys from `balongbendo` and `krian` to `sumokembangsri` and `junwangi`. Updating the Data Access Layer (DAL) to expose `kecamatan` and `desa`, adjusting Admin forms and server actions, dynamically formatting public landing metadata, and updating the Vitest test suite.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres & Migration CLI), TypeScript, Tailwind CSS v4, Vitest, React 19.

**Spec:** `docs/superpowers/specs/2026-10-10-village-based-branch-refactor-design.md`

## Global Constraints

- Never use raw `supabase.from(...)` in UI components; all database operations must go through the Data Access Layer (`src/lib/branches.ts`).
- Admin Server Actions must enforce admin authorization via `requireAdminAction()`.
- Responsive design: 0 horizontal overflow across 360px–1280px+.
- All migrations must be idempotent or clean version-controlled files applied via Supabase CLI.
- No `TODO` comments or unverified mock stubs in final deliverables.

## Review Focus

1. **Foreign key cascade failure:** If an existing child table foreign key lacks `ON UPDATE CASCADE`, updating `branches.id` will fail with foreign key violation 23503. Test ensures all foreign key constraints are dropped and re-added with `ON UPDATE CASCADE` before updating IDs.
2. **Missing required fields on create/update:** Creating or editing a branch without `kecamatan` or `desa` must return actionable validation errors.
3. **Empty desa/kecamatan display fallback:** If a legacy or incomplete branch record is read, UI must gracefully fall back to empty string without rendering `undefined` or broken badges.
4. **Landing page footer broken links:** If footer hardcodes branch IDs, updating to village IDs could break footer addresses. Test verifies footer renders new village branch links cleanly.
5. **SEO JSON-LD schema validity:** Schema generation on `src/app/page.tsx` must produce valid `addressLocality` formatted with the village and subdistrict.

---

### Task 1: Database Migration (Schema & Data Cascade)

**Files:**
- Create: `supabase/migrations/20261010140000_village_based_branch_refactor.sql`

**Interfaces:**
- Consumes: Existing tables `branches`, `branch_shifts`, `schedule_drafts`, `teacher_attendances`, `profile_branches`, `landing_content`.
- Produces: New columns `branches.kecamatan` and `branches.desa`; updated IDs `'sumokembangsri'` and `'junwangi'`.

- [ ] **Step 1: Write SQL migration file**
Create `supabase/migrations/20261010140000_village_based_branch_refactor.sql`:
1. Add columns `kecamatan TEXT NOT NULL DEFAULT ''` and `desa TEXT NOT NULL DEFAULT ''` to `public.branches`.
2. Alter foreign keys on `branch_shifts`, `schedule_drafts`, `teacher_attendances`, and `profile_branches` to include `ON UPDATE CASCADE`.
3. Update `branches` table records for `balongbendo` and `krian`.
4. Update `landing_content` table JSON for section `locations`.

- [ ] **Step 2: Apply migration to database**
Run: `node --env-file=.env.local -e "const { createClient } = require('@supabase/supabase-js'); ..."` or Supabase CLI to execute the migration.

- [ ] **Step 3: Verify data migration in database**
Query `branches`, `students`, `profiles`, `branch_shifts`, and `schedule_drafts` to ensure all reference `sumokembangsri` and `junwangi` with zero orphans.

- [ ] **Step 4: Commit**
```bash
git add supabase/migrations/20261010140000_village_based_branch_refactor.sql
git commit -m "feat(db): add kecamatan and desa columns and migrate branches to village identifiers"
```

---

### Task 2: Update Data Access Layer & Type Definitions

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/lib/branches.ts`
- Test: `tests/branches.test.ts`

**Interfaces:**
- Consumes: Database schema changes from Task 1.
- Produces: `Branch.kecamatan`, `Branch.desa`, `BranchWithStats.kecamatan`, `BranchWithStats.desa`, updated `insertBranch` and `updateBranchData`.

- [ ] **Step 1: Write failing unit test in `tests/branches.test.ts`**
Add test asserting `getBranchById('sumokembangsri')` returns `kecamatan: 'Balongbendo'` and `desa: 'Sumokembangsri'`.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/branches.test.ts`
Expected: FAIL (types or mocks missing new properties).

- [ ] **Step 3: Update `src/types/index.ts` and `src/lib/branches.ts`**
Add `kecamatan: string; desa: string;` to `BranchWithStats` and update `insertBranch` / `updateBranchData` to persist `kecamatan` and `desa`. Include them in `search` filtering.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/branches.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/types/index.ts src/lib/branches.ts tests/branches.test.ts
git commit -m "feat(dal): expose kecamatan and desa in branch types and queries"
```

---

### Task 3: Admin Management & Branch Forms

**Files:**
- Modify: `src/app/admin/cabang/actions.ts`
- Modify: `src/components/admin/cabang/branch-form.tsx`
- Modify: `src/app/admin/cabang/page.tsx`
- Modify: `src/app/admin/cabang/[id]/page.tsx`

**Interfaces:**
- Consumes: DAL methods from Task 2 (`insertBranch`, `updateBranchData`).
- Produces: Admin UI for creating/updating branches with `kecamatan` and `desa`, and displays administrative badges.

- [ ] **Step 1: Update Server Actions in `src/app/admin/cabang/actions.ts`**
Validate `kecamatan` and `desa` in `createBranch` and `updateBranch`. Return field errors if missing.

- [ ] **Step 2: Update `src/components/admin/cabang/branch-form.tsx`**
Add `kecamatan` and `desa` form fields. On create, auto-generate recommended `id` slug based on `desa` input (e.g. `sumokembangsri`).

- [ ] **Step 3: Update Branch Table & Cards in `src/app/admin/cabang/page.tsx`**
Display village and sub-district badge (`Desa {b.desa} • Kec. {b.kecamatan}`) in table rows and mobile cards.

- [ ] **Step 4: Update Branch Detail Page in `src/app/admin/cabang/[id]/page.tsx`**
Add an administrative region card displaying `Kecamatan` and `Desa`.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/cabang/ src/components/admin/cabang/
git commit -m "feat(admin): add kecamatan and desa fields to branch form and table views"
```

---

### Task 4: Public Landing Page & Fallback Metadata

**Files:**
- Modify: `src/lib/landing-content.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/footer.tsx`

**Interfaces:**
- Consumes: Updated branch IDs `sumokembangsri` and `junwangi`.
- Produces: Dynamic SEO structured data and aligned footer links.

- [ ] **Step 1: Update `src/lib/landing-content.ts`**
Update default fallback items for `locations`:
- ID `sumokembangsri`, Name `Cabang Sumokembangsri`, SubName `Ahe Sumokembangsri`.
- ID `junwangi`, Name `Cabang Junwangi`, SubName `Ahe Junwangi`.

- [ ] **Step 2: Update `src/app/page.tsx` JSON-LD schema**
Replace ternary check `b.id === "balongbendo"` with dynamic string interpolation based on `desa` and `kecamatan` or new IDs.

- [ ] **Step 3: Update `src/components/landing/footer.tsx`**
Update `.find(b => b.id === "balongbendo")` to look up `sumokembangsri` and `junwangi`, or map dynamically.

- [ ] **Step 4: Commit**
```bash
git add src/lib/landing-content.ts src/app/page.tsx src/components/landing/footer.tsx
git commit -m "refactor(landing): update public landing content and schema to village-based branch identifiers"
```

---

### Task 5: Unit Tests Alignment & Verification

**Files:**
- Modify: `tests/branches.test.ts`
- Modify: `tests/components-admin.test.tsx`
- Modify: `tests/components-master.test.tsx`
- Modify: `tests/pages.test.tsx`
- Modify: `tests/shift-form.test.tsx`
- Modify: `tests/components/draft-form.test.tsx`
- Modify: `tests/components/student-form.test.tsx`
- Modify: `tests/components/guru-form.test.tsx`

**Interfaces:**
- Consumes: All updated components and DAL functions.
- Produces: 100% test pass rate with `./init.sh`.

- [ ] **Step 1: Update test mocks**
Replace references to `"balongbendo"` and `"krian"` in mock data with `"sumokembangsri"` and `"junwangi"`, including `kecamatan` and `desa` properties.

- [ ] **Step 2: Run test suite**
Run: `npm test`
Expected: All tests pass (0 failures).

- [ ] **Step 3: Run full verification script**
Run: `./init.sh`
Expected: Lint passes with 0 warnings/errors, all tests pass, build succeeds with Turbopack.

- [ ] **Step 4: Commit**
```bash
git add tests/
git commit -m "test: align branch test mocks with village-based identifiers and regional fields"
```
