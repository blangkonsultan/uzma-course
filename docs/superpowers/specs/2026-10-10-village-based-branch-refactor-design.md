# Spec: Village-Based Branch Refactor & Administrative Hierarchy

- **Date:** 2026-10-10
- **Status:** Draft / Pending Review
- **Scope:** Architectural (Database Schema, Data Migration, Admin Portal, DAL, Public Landing Page, and Testing)

---

## 1. Context & Background

Previously, branches (*cabang*) in Uzma Course were defined by district/sub-district (*kecamatan*) names:
- `Cabang Balongbendo` (ID: `balongbendo`)
- `Cabang Krian` (ID: `krian`)

Field discovery revealed that tutoring center branch licenses and units in Uzma Course are officially tethered to the **Village / Kelurahan (*desa*)**, not the sub-district (*kecamatan*). Multiple branches can potentially exist within the same sub-district as long as they reside in different villages.

This specification details the end-to-end refactoring to:
1. Transition existing branch identifiers and display names to be village-based (`Cabang Sumokembangsri` and `Cabang Junwangi`).
2. Introduce explicit structured administrative region columns (`kecamatan` and `desa`) in the `branches` table.
3. Propagate these changes across all dependent tables, admin forms, Data Access Layer (DAL) services, PWA components, public landing metadata, and the test suite.

---

## 2. Goals & Non-Goals

### Goals
- **Full ID & Data Migration:** Migrate active branch records from `balongbendo` to `sumokembangsri` and `krian` to `junwangi`, cascading updates to all children records (`students`, `profiles`, `profile_branches`, `branch_shifts`, `schedule_drafts`, `teacher_attendances`).
- **Structured Regional Fields:** Add `kecamatan` and `desa` to `branches` so administrative territory is explicitly stored rather than parsed from address strings.
- **Form & Validation Alignment:** Update `BranchForm` and server actions to validate and capture `kecamatan` and `desa`.
- **Eliminate Hardcoded Region Logic:** Replace hardcoded `'balongbendo'` / `'krian'` strings in public landing components and SEO metadata with dynamic field lookups.
- **Maintain Data Integrity:** Zero orphan records and 100% test pass rate with clean builds.

### Non-Goals
- Altering the geofence calculation or GPS presence logic (coordinates and radius remain tied to the branch entity).
- Modifying student placement or teacher assignment logic beyond updating the foreign key identifier.

---

## 3. Database Schema & Migration Strategy

### 3.1 Migration Steps (`supabase/migrations/YYYYMMDDHHMMSS_village_based_branch_refactor.sql`)

1. **Add Region Columns:**
   ```sql
   ALTER TABLE public.branches 
   ADD COLUMN IF NOT EXISTS kecamatan TEXT NOT NULL DEFAULT '',
   ADD COLUMN IF NOT EXISTS desa TEXT NOT NULL DEFAULT '';
   ```

2. **Ensure Foreign Key Update Cascades:**
   Drop and recreate foreign keys on dependent tables to ensure `ON UPDATE CASCADE`:
   - `public.branch_shifts (branch_id)`
   - `public.schedule_drafts (branch_id)`
   - `public.teacher_attendances (branch_id)`
   - `public.profile_branches (branch_id)`

3. **Atomic Data Migration:**
   ```sql
   -- Update Balongbendo -> Sumokembangsri
   UPDATE public.branches
   SET 
     id = 'sumokembangsri',
     name = 'Cabang Sumokembangsri',
     kecamatan = 'Balongbendo',
     desa = 'Sumokembangsri',
     updated_at = now()
   WHERE id = 'balongbendo';

   -- Update Krian -> Junwangi
   UPDATE public.branches
   SET 
     id = 'junwangi',
     name = 'Cabang Junwangi',
     kecamatan = 'Krian',
     desa = 'Junwangi',
     updated_at = now()
   WHERE id = 'krian';
   ```

4. **Update Landing Page CMS Data (`landing_content`):**
   Update the JSON configuration for `locations` in `public.landing_content` to replace branch items `id: "balongbendo"` with `"sumokembangsri"` and `"krian"` with `"junwangi"`, aligning names with `Cabang Sumokembangsri` and `Cabang Junwangi`.

---

## 4. Application Layer Architecture

### 4.1 Types & Data Access Layer (`src/types/index.ts`, `src/lib/branches.ts`)
- Update `Branch`, `BranchInsert`, `BranchUpdate`, and `BranchWithStats` interfaces to include `kecamatan: string` and `desa: string`.
- Update `getPaginatedBranchesWithStats`, `insertBranch`, and `updateBranchData` to read and write `kecamatan` and `desa`.
- Support searching by `kecamatan` and `desa` in branch list filtering.

### 4.2 Admin Management (`src/app/admin/cabang/` & `src/components/admin/cabang/`)
- **Server Actions (`actions.ts`):** Validate required `kecamatan` and `desa` fields upon creation and update.
- **Branch Form (`branch-form.tsx`):**
  - Add text input fields for `Kecamatan` and `Desa`.
  - On new branch creation, auto-suggest the branch ID slug based on the entered `Desa` name (lowercase, kebab-cased).
- **Branch Table & Cards (`/admin/cabang/page.tsx`):**
  - Display regional badge or subtitle: `Desa {b.desa} • Kec. {b.kecamatan}`.
- **Branch Detail Page (`/admin/cabang/[id]/page.tsx`):**
  - Display dedicated region info card highlighting the village and sub-district.

### 4.3 Public Landing & SEO (`src/app/page.tsx`, `footer.tsx`)
- **Schema JSON-LD (`src/app/page.tsx`):**
  Derive `addressLocality` dynamically:
  ```ts
  addressLocality: `${b.desa ? `Desa ${b.desa}, ` : ''}${b.kecamatan ? `Kec. ${b.kecamatan}, ` : ''}Sidoarjo`,
  ```
- **Footer (`src/components/landing/footer.tsx`):**
  Render branch locations dynamically by iterating through available location items or matching by the new IDs `sumokembangsri` and `junwangi`.

### 4.4 PWA & Teacher Portal
- Existing utility `formatBranchName` handles stripping the "Cabang " prefix, resulting in clean display tags: `Sumokembangsri` and `Junwangi` across schedule cards and attendance screens.

---

## 5. Verification & Test Plan

1. **Database Migration Execution:**
   - Execute migration via Supabase CLI against remote/local database.
   - Verify zero orphaned records in `students`, `profiles`, `profile_branches`, `branch_shifts`, `schedule_drafts`, and `teacher_attendances`.
2. **Unit & Component Tests (`vitest`):**
   - Update mocks in `tests/branches.test.ts`, `tests/components-admin.test.tsx`, `tests/components-master.test.tsx`, `tests/pages.test.tsx`, and `tests/shift-form.test.tsx` to reference `sumokembangsri` and `junwangi`.
   - Run `npm test` to verify 100% pass rate.
3. **Lint & Build Verification:**
   - Run `npm run lint` and `npm run build` with zero TypeScript errors or warnings.
4. **End-to-End Verification:**
   - Verify `/admin/cabang` displays new village names and region hierarchy.
   - Verify `/guru/jadwal` and `/guru/absen` correctly render `Sumokembangsri` and `Junwangi`.
