# Implementation Plan: Multi-Branch Teacher Assignment & Nearest Shift Detection

## User Review Required

> [!NOTE]
> This plan executes the approved architectural specification in `docs/superpowers/specs/2026-10-09-multi-branch-teacher-presence-design.md`.

- **Scope**: Migration DDL (`profile_branches`), DAL refactor (`gurus.ts`, `teacher-branches.ts`), Admin Master Guru UI updates, and PWA Presence nearest-branch + nearest-shift integration.
- **Risk Assessment**: Low risk of data regression due to automated backfill of existing primary branch IDs.

---

## Proposed Changes

### Database Layer
#### [NEW] `supabase/migrations/20261009040000_profile_branches_junction.sql`
- Create `public.profile_branches` table with composite primary key `(profile_id, branch_id)`.
- Establish RLS policies for authenticated users (read) and admins (all).
- Backfill existing `branch_id` from `profiles` to `profile_branches` with `is_primary = true`.

### Data Access Layer (DAL)
#### [MODIFY] `src/types/database.ts`
- Add `profile_branches` table typings.

#### [MODIFY] `src/lib/gurus.ts`
- Include `profile_branches(branch_id, is_primary)` in queries and updates.

#### [NEW] `src/lib/teacher-branches.ts`
- Export `getTeacherAssignedBranches(teacherId: string): Promise<Branch[]>`.
- Export `getBranchShiftsMap(branchIds: string[]): Promise<Record<string, BranchShift[]>>`.

### Admin Master Guru UI
#### [MODIFY] `src/components/admin/guru/guru-form.tsx`
- Support multi-branch assignment checkboxes with primary branch selector.

#### [MODIFY] `src/app/admin/guru/actions.ts`
- Process `formData.getAll("branches")` and `primary_branch_id`.

### Teacher PWA Presence UI
#### [MODIFY] `src/app/guru/absen/page.tsx`
- Load assigned branches via `getTeacherAssignedBranches(profile.id)` and corresponding shifts.

#### [MODIFY] `src/components/guru/attendance-client.tsx`
- Add assigned branch selector dropdown/pills.
- Auto-detect nearest branch as default via real-time GPS.
- Calculate and display nearest/active shift badge for the selected branch.

---

## Verification Plan

### Automated Tests
- Run unit test suite: `npm test`
- Run linting and typecheck: `npm run lint`
- Run production build: `npm run build`

### Manual Smoke Testing
- Verify `/admin/guru`: check multi-branch assignment and persistence.
- Verify `/guru/absen`: test nearest-branch auto selection and nearest-shift display.
