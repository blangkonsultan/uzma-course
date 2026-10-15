# Technical Specification: Phase 4 Scheduling Invariants, Multi-Branch Allocation & Modal Accessibility

- **Date:** 2026-10-15
- **Status:** Draft for Review (Brainstorming Architectural Path)
- **Target Subsystem:** Scheduling Engine (Board, Class & Student Placements, Printing), Shift Management, Student Number Preservation, Modal Accessibility
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Problem Statement

Following the completion of Phase 1 (Security & Auth Hardening), Phase 2 (Master Data CRUD Integrity), and Phase 3 (Teacher Attendance Lifecycle & PWA Offline Model), Phase 4 addresses scheduling invariants, multi-branch teacher allocation, weekly frequency quotas, and modal focus traps identified in audit findings A4–A16, A23, and A26:

1. **A4 (P1): Secondary Branch Teachers Omitted from Scheduling Pool**
   - File: `src/lib/board.ts:28-33`
   - Issue: `getBoardData()` queries teachers with `.eq("branch_id", branchId)`, which checks only the teacher's primary branch (`profiles.branch_id`). Teachers assigned to secondary branches via `profile_branches` table are omitted, making them unschedulable in secondary branch drafts.

2. **A5 (P1): Cross-Branch Teacher Overlap Not Checked**
   - File: `src/lib/board.ts:88-94`
   - Issue: `insertScheduleClass()` validates teacher time overlap only within the same draft (`.eq("draft_id", data.draft_id)`). A teacher assigned across multiple branches can be double-booked at the same day and time in active schedules of different branches.

3. **A10 (P2): Student Numbers Regenerated on Routine Edits**
   - File: `src/app/admin/murid/actions.ts:143-159`
   - Issue: `student_number` is not included in `StudentForm` FormData submission. `updateStudent` checks `if (!studentNumber && branchId)`, regenerating a brand new number using current month and sequence every time a student profile or phone number is updated.

4. **A11 & A12 (P2): Stale Enrollment Status & Missing Weekly Quota Enforcement**
   - Files: `src/components/admin/board/add-student-modal.tsx:32-45`, `src/lib/board.ts:122-164`
   - Issue: The student modal does not filter `sp.status === 'active'`; students on leave, graduated, or withdrawn can still be placed. Furthermore, neither the modal nor the server placement DAL checks `variant.frequency`, allowing a student enrolled in a 2x/week variant to be scheduled up to 6x/week.

5. **A14, A15, A16 (P2): Time Interval Boundaries & Narrowing Shifts**
   - Files: `src/app/admin/shift/actions.ts:23-30`, `src/lib/shifts.ts:65-69`, `src/lib/board.ts:83-85`
   - Issue: Shift creation allows start time $\ge$ end time (e.g. 17:00 to 09:00). Shift updates can narrow operating hours while existing scheduled classes remain stranded outside the new bounds. Class intervals wrapping midnight are not rejected.

6. **A13 & A23 (P2): Inactive Variants & Non-Positive Operational Numbers**
   - Files: `src/components/admin/murid/student-form.tsx:410-415`, `src/app/admin/program/actions.ts:70-80`
   - Issue: Inactive variants are offered to new enrollments. Variant action validation accepts non-positive numbers (e.g. capacity 0).

7. **A26 (P2): Modal Focus Containment in Kanban Board**
   - Files: `src/components/admin/board/add-class-modal.tsx`, `add-student-modal.tsx`, `class-time-modal.tsx`
   - Issue: Board modals lack dialog focus traps, Escape key dismissal, and active day locking, allowing keyboard navigation to leak into background controls.

---

## 2. Architectural Design & Specifications

```
+-------------------------------------------------------------------------------------------------------+
|                                      PHASE 4 ARCHITECTURE                                             |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|  1. MULTI-BRANCH TEACHER POOL & CROSS-BRANCH CONFLICT VALIDATION:                                     |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/lib/board.ts: getBoardData()                                                           |   |
|     |  - Query profiles.branch_id = branchId OR profile_branches.branch_id = branchId             |   |
|     |  src/lib/board.ts: insertScheduleClass()                                                    |   |
|     |  - Overlap check: draft_id = currentDraftId OR schedule_drafts.status = 'active'             |   |
|     |  - Enforce: data.start_time < data.end_time AND inside shift bounds                         |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  2. ENROLLMENT STATUS & WEEKLY QUOTA ENFORCEMENT:                                                     |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/components/admin/board/add-student-modal.tsx & src/lib/board.ts                        |   |
|     |  - Filter student_programs by status = 'active'                                             |   |
|     |  - Count existing placements in current draft for this variant                              |   |
|     |  - If placementsCount >= variant.frequency: exclude from modal & reject in DAL              |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  3. STUDENT NUMBER PRESERVATION:                                                                      |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/app/admin/murid/actions.ts: updateStudent()                                            |   |
|     |  - Fetch existing student row; preserve existing student_number                              |   |
|     |  - Only generate new number if student genuinely has no number                              |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  4. TIME BOUNDARIES & SAFE SHIFT UPDATES:                                                             |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/app/admin/shift/actions.ts & src/lib/shifts.ts                                         |   |
|     |  - Require start_time < end_time on shift create/update                                     |   |
|     |  - updateBranchShift: query existing schedule_classes; reject if classes fall outside       |   |
|     |  src/app/admin/program/actions.ts: require duration > 0, frequency > 0, system > 0          |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  5. MODAL ACCESSIBILITY & DAY LOCKING:                                                                |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/components/admin/board/{add-class, add-student, class-time}-modal.tsx                  |   |
|     |  - Standard focus trap with Tab/Shift+Tab, Escape listener, initial autoFocus                |   |
|     |  - Capture activeDay at modal open time to prevent background day shift mutations          |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

### 2.1 Multi-Branch Teacher Eligibility & Cross-Branch Overlap (A4, A5, A14)

#### 2.1.1 Inclusive Teacher Query in `src/lib/board.ts:getBoardData`
In `src/lib/board.ts`:
Fetch all active teachers assigned to `branchId` via either `profiles.branch_id` or `profile_branches`:

```typescript
// Fetch teachers who have this branch as primary OR as secondary assignment
const { data: allTeachers, error: teacherErr } = await supabase
  .from("profiles")
  .select("*, profile_programs(program_id)")
  .eq("role", "guru")
  .eq("is_active", true);

if (teacherErr) throw new Error("Gagal mengambil data guru.");

// Fetch junction assignments for this branch
const { data: junctionAssignments } = await supabase
  .from("profile_branches")
  .select("profile_id, is_primary")
  .eq("branch_id", branchId);

const junctionTeacherIds = new Set((junctionAssignments || []).map((j) => j.profile_id));

const teachers = (allTeachers || []).filter(
  (t) => t.branch_id === branchId || junctionTeacherIds.has(t.id)
);
```

#### 2.1.2 Cross-Branch Schedule Conflict Check in `insertScheduleClass`
In `src/lib/board.ts:insertScheduleClass`:
1. Enforce `data.start_time < data.end_time`.
2. Check shift boundaries `data.start_time >= shift.start_time && data.end_time <= shift.end_time`.
3. Check teacher schedule overlap across both the current draft AND all other active drafts:

```typescript
// 1. Time range validation
if (data.start_time >= data.end_time) {
  throw new Error("Jam selesai harus lebih akhir dari jam mulai.");
}

if (data.start_time < shift.start_time || data.end_time > shift.end_time) {
  throw new Error(
    `Waktu sesi (${data.start_time.slice(0, 5)}-${data.end_time.slice(0, 5)}) keluar dari batas shift (${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}).`
  );
}

// 2. Cross-branch overlap check
const { data: overlaps, error: overlapErr } = await supabase
  .from("schedule_classes")
  .select(`
    id,
    start_time,
    end_time,
    schedule_drafts!inner ( id, name, branch_id, status )
  `)
  .eq("teacher_id", data.teacher_id)
  .eq("day_of_week", data.day_of_week)
  .or(`draft_id.eq.${data.draft_id},schedule_drafts.status.eq.active`)
  .lt("start_time", data.end_time)
  .gt("end_time", data.start_time);

if (overlapErr) throw new Error("Gagal memvalidasi jadwal bentrok.");

if (overlaps && overlaps.length > 0) {
  const conflict = overlaps[0];
  const draftInfo = conflict.schedule_drafts as unknown as { name: string; status: string };
  throw new Error(
    `Jadwal bertabrakan dengan kelas guru yang lain pada hari dan jam yang sama (${draftInfo?.name || "Draf lain"}).`
  );
}
```

---

### 2.2 Student Number Stability, Active Status & Weekly Quotas (A10, A11, A12, A13)

#### 2.2.1 Preserving Student Number in `src/app/admin/murid/actions.ts`
In `updateStudent`:
```typescript
// Fetch existing student record to preserve student_number unless missing
const { data: existingStudent } = await supabase
  .from("students")
  .select("student_number, joined_date")
  .eq("id", id)
  .single();

let studentNumber = formData.get("student_number")?.toString().trim();
if (!studentNumber) {
  studentNumber = existingStudent?.student_number || "";
}

if (!studentNumber && branchId) {
  studentNumber = await generateStudentNumber(branchId, joinedDate || existingStudent?.joined_date);
}
```

#### 2.2.2 Active Status & Weekly Quota Enforcement
In `src/components/admin/board/add-student-modal.tsx`:
1. Filter only active program enrollments (`!sp.status || sp.status === 'active'`).
2. Count existing placements in current draft for the target variant. If `count >= variant.frequency`, exclude student from eligible list.

In `src/lib/board.ts:insertSchedulePlacement`:
Enforce weekly quota server-side:
```typescript
// Fetch class with variant frequency
const { data: classData, error: classErr } = await supabase
  .from("schedule_classes")
  .select(`
    id,
    draft_id,
    variant_id,
    program_variants ( system, frequency )
  `)
  .eq("id", data.class_id)
  .single();

if (classErr || !classData) throw new Error("Kelas tidak ditemukan.");

// Check student active enrollment
const { data: enrollment, error: enrollErr } = await supabase
  .from("student_programs")
  .select("status")
  .eq("student_id", data.student_id)
  .eq("variant_id", classData.variant_id)
  .single();

if (enrollErr || !enrollment || (enrollment.status && enrollment.status !== "active")) {
  throw new Error("Murid tidak terdaftar aktif dalam varian program ini.");
}

// Check weekly quota
const variantFrequency = (classData.program_variants as unknown as { frequency: number })?.frequency || 3;
const { count: currentPlacementsCount } = await supabase
  .from("schedule_placements")
  .select("id, schedule_classes!inner(draft_id, variant_id)", { count: "exact", head: true })
  .eq("student_id", data.student_id)
  .eq("schedule_classes.draft_id", classData.draft_id)
  .eq("schedule_classes.variant_id", classData.variant_id);

if (currentPlacementsCount !== null && currentPlacementsCount >= variantFrequency) {
  throw new Error(`Murid telah mencapai batas kuota mingguan untuk program ini (Maksimal ${variantFrequency}x sepekan).`);
}
```

#### 2.2.3 Inactive Variant Filtering on Student Registration
In `src/components/admin/murid/student-form.tsx:410-415`:
```typescript
const variants = (program?.program_variants || []).filter((v) => isEdit || v.is_active);
```

---

### 2.3 Positive Time Ordered Shifts & Safe Hour Modifications (A15, A16, A23)

1. **Shift Time Range Validation (`src/app/admin/shift/actions.ts`):**
   ```typescript
   if (startTime && endTime && startTime >= endTime) {
     fieldErrors.end_time = "Jam selesai harus lebih akhir dari jam mulai.";
   }
   ```
2. **Safe Shift Narrowing (`src/lib/shifts.ts:updateBranchShift`):**
   ```typescript
   // Check if existing classes would fall outside new bounds
   const { data: strandedClasses } = await supabase
     .from("schedule_classes")
     .select("id, start_time, end_time")
     .eq("shift_id", id)
     .or(`start_time.lt.${data.start_time},end_time.gt.${data.end_time}`);

   if (strandedClasses && strandedClasses.length > 0) {
     throw new Error(
       `Jam shift tidak dapat dipersempit karena terdapat ${strandedClasses.length} kelas terjadwal di luar jam baru.`
     );
   }
   ```
3. **Variant Number Validation (`src/app/admin/program/actions.ts`):**
   ```typescript
   for (const v of variants) {
     if ((v.duration as number) <= 0 || (v.frequency as number) <= 0 || (v.system as number) <= 0) {
       return { fieldErrors: { variants: "Durasi, frekuensi, dan kapasitas murid (sistem) harus berupa angka positif (> 0)." } };
     }
   }
   ```

---

### 2.4 Modal Focus Containment & Active Day Locking (A26)

In `AddClassModal`, `AddStudentModal`, and `ClassTimeModal`:
1. Use standard `dialogRef` with Tab/Shift+Tab focus cycling and Escape listener.
2. Auto-focus the search input or first focusable control upon opening.
3. Lock `targetDay` at modal mount time rather than reading live `activeDay`, preventing background clicks from altering the placement target.

---

## 3. Test Strategy & Acceptance Criteria

### 3.1 Automated Vitest Test Suites
1. **`tests/crud/multi-branch-scheduling.test.ts`**:
   - Verify `getBoardData` includes teachers assigned via `profile_branches`.
   - Verify `insertScheduleClass` detects teacher conflicts across different branches in active drafts.
2. **`tests/crud/student-number-stability.test.ts`**:
   - Verify `updateStudent` preserves existing student number when not provided in form.
3. **`tests/crud/weekly-quota-placement.test.ts`**:
   - Verify `insertSchedulePlacement` rejects students when weekly quota (`frequency`) is met.
   - Verify `insertSchedulePlacement` rejects students with inactive enrollment status.
4. **`tests/crud/shift-time-validation.test.ts`**:
   - Verify `createShift` rejects `start_time >= end_time`.
   - Verify `updateBranchShift` rejects narrowing when existing classes fall outside.
5. **`tests/components/board-modal-accessibility.test.tsx`**:
   - Verify focus trap cycles Tab within modal and Escape closes dialog.

### 3.2 Definition of Done for Phase 4
- [ ] Teachers with secondary branch assignments are schedulable in those branches.
- [ ] Cross-branch teacher double-booking is blocked at the database DAL level.
- [ ] Student numbers remain stable across edits.
- [ ] Students cannot be scheduled beyond their weekly variant frequency quota.
- [ ] Shift times enforce positive ranges and protect existing classes.
- [ ] Board modals contain focus cleanly and handle Escape.
- [ ] `./init.sh` succeeds with 0 lint errors, 100% tests passing, and clean production build.
