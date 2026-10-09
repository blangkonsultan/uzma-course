# Spec: Multi-Branch Teacher Assignment & Nearest Shift Detection for Teacher Presence

## 1. Context & Objectives
In Uzma Course, teachers can be formally assigned to teach across multiple branches (e.g., both Balongbendo and Krian).
The existing database schema restricts a teacher (`profiles`) to a single `branch_id`, leading to data fragmentation and workarounds.

This specification implements an architectural best practice:
1. Establish a first-class many-to-many junction table `profile_branches` in Supabase.
2. Upgrade Admin Master Guru to assign multiple branches with a primary branch indicator.
3. Upgrade the Teacher PWA Presence page (`/guru/absen`) to:
   - Restrict branch selection exclusively to the branches assigned to the authenticated teacher.
   - Automatically calculate real-time GPS distances to all assigned branches and set the nearest branch as the default selection.
   - Dynamically compute and display the nearest/active branch shift for the selected branch (e.g., Shift Pagi 09:00 - 12:30).

---

## 2. Database Architecture & Schema Changes

### 2.1 Table: `public.profile_branches`
```sql
CREATE TABLE IF NOT EXISTS public.profile_branches (
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (profile_id, branch_id)
);

-- Enable RLS
ALTER TABLE public.profile_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read branch assignments"
    ON public.profile_branches FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manages branch assignments"
    ON public.profile_branches
    USING (public.is_admin());
```

### 2.2 Data Migration Strategy (Zero Data Loss)
Existing `branch_id` values on `profiles` will be backfilled into `profile_branches` automatically during migration:
```sql
INSERT INTO public.profile_branches (profile_id, branch_id, is_primary)
SELECT id, branch_id, true
FROM public.profiles
WHERE branch_id IS NOT NULL AND role = 'guru'
ON CONFLICT (profile_id, branch_id) DO NOTHING;
```

---

## 3. Data Access Layer (DAL) Specifications

### 3.1 `src/lib/gurus.ts`
- Update `ProfileWithPrograms` to include `profile_branches?: { branch_id: string; is_primary: boolean }[]`.
- Update `getPaginatedGurus` and `getGuruById` to select `*, profile_programs(program_id), profile_branches(branch_id, is_primary)`.
- Update `insertGuru` and `updateGuruProfile` to accept `branchIds: string[]` and `primaryBranchId?: string`.
- Manage clean relational sync: delete obsolete assignments and insert newly assigned branches.

### 3.2 `src/lib/teacher-branches.ts` (New Service)
- Export `getTeacherAssignedBranches(teacherId: string): Promise<Branch[]>`:
  Fetches full `branches` rows (including `latitude`, `longitude`, `geofence_radius_m`) for branches linked via `profile_branches`.
- Export `getBranchShiftsForTeacher(branchId: string): Promise<BranchShift[]>`.

---

## 4. Admin Master Data UI (`/admin/guru`)
- Update `src/components/admin/guru/guru-form.tsx`:
  - Replace single-branch select dropdown with a multi-select checkbox list for branches.
  - Allow selecting one of the checked branches as the "Cabang Utama" (primary branch).
- Update `src/app/admin/guru/actions.ts` to parse `formData.getAll("branches")` and `formData.get("primary_branch_id")`.

---

## 5. Teacher PWA Presence UI (`/guru/absen`)
- Update `src/app/guru/absen/page.tsx`:
  - Fetch assigned branches using `getTeacherAssignedBranches(profile.id)`.
  - Fetch active shifts for all assigned branches.
  - Pass structured data to `AttendanceClient`.
- Update `src/components/guru/attendance-client.tsx`:
  - **Branch Selector UI:** Clean rounded pill dropdown or segmented button showing only the teacher's assigned branches and live distance badge to each.
  - **Auto-Detect Nearest Default:** When GPS location (`currentCoords`) resolves, compute distances to all assigned branches; automatically select the branch with the smallest distance as `selectedBranchId`.
  - **Nearest Shift Indicator:**
    - Read active shifts for `selectedBranchId`.
    - Check current device time against `start_time` and `end_time`.
    - Show real-time card:
      - 🟢 *"Sesi Aktif"* (if current time is within shift window, e.g. 09:30 during Shift Pagi 09:00 - 12:30).
      - 🔵 *"Shift Mendatang"* (if before shift starts).
      - ⚪ *"Shift Terakhir Hari Ini"* (if after all shifts completed).
  - **Geofence & Action Buttons:**
    - Check distance against the selected branch's `geofence_radius_m`.
    - Execute Check-In / Check-Out with `branch_id: selectedBranchId`.

---

## 6. Testing & Quality Verification
- Update unit tests in Vitest suite to mock and test `profile_branches` junction behavior.
- Validate TypeScript strict typing with 0 errors across build and linting.
- Verify that teacher presence check-in/out functions correctly offline (IndexedDB queuing) and online across assigned branches.
