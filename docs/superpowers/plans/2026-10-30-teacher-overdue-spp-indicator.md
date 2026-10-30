# Teacher Overdue SPP Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add overdue SPP warning indicators and billing details (due date, invoice count, and total amount) for students in the teacher PWA schedule and teaching card interfaces, keeping reminders verbal and administrative authority centralized.

**Architecture:** Batch-fetch unpaid overdue invoices in the Data Access Layer (DAL) Server Components (`teacher-schedule.ts` and `teaching-logs.ts`) scoped strictly to students placed in active classes. Display non-intrusive, WCAG-compliant Lucide-based amber indicators with tabular numeric formatting on mobile schedule and teaching cards.

**Tech Stack:** Next.js 16 (App Router / Turbopack), React 19, Supabase (Postgres), Tailwind CSS v4, Lucide React, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-teacher-overdue-spp-indicator-design.md`

## Global Constraints

- No database migrations (DDL changes); reuse existing `student_invoices` table.
- No automated or direct WhatsApp triggers for teachers; reminders are strictly oral/verbal.
- Touch targets on mobile interactive elements must satisfy minimum 44px (`min-h-11`).
- Use Lucide icons exclusively (`AlertTriangle`), never raw emoji `⚠️`.
- Contrast ratios for amber elements must satisfy WCAG AA ($\ge 4.5:1$): `bg-amber-100 text-amber-800` for pill badge, `bg-amber-50 border-amber-200 text-amber-800` for info box.
- Currency and number summaries must use `tabular-nums`.

## Review Focus

1. Student with multiple overdue invoices: earliest due date is shown, total amount is summed, and count is accurate.
2. Student with unpaid invoice whose due date is in the future: not flagged as overdue.
3. Student with zero overdue invoices / paid invoices: no badge or overdue container rendered.
4. Query failure or empty overdue list: graceful degradation, schedule/teaching card renders without blocking.
5. 360px viewport overflow: overdue info box wraps neatly without horizontal scrollbar.

---

### Task 1: DAL Types & Overdue SPP Batch Fetch in `src/lib/teacher-schedule.ts`

**Files:**
- Modify: `src/lib/teacher-schedule.ts`
- Test: `tests/teacher-schedule.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export interface StudentOverdueSppInfo {
    due_date: string;
    total_amount: number;
    invoice_count: number;
  }

  export interface TeacherScheduleStudentItem {
    id: string;
    full_name: string;
    student_number: string | null;
    overdue_spp?: StudentOverdueSppInfo | null;
  }

  export interface TeacherClassItem {
    // ...existing fields...
    students: TeacherScheduleStudentItem[];
    overdue_students_count?: number;
  }
  ```

- [ ] **Step 1: Write the failing test**

In `tests/teacher-schedule.test.ts`, add a test verifying that `getTeacherActiveSchedule` enriches students with `overdue_spp` information and counts `overdue_students_count` per class:

```typescript
it("enriches students with overdue SPP details when invoices are unpaid and past due", async () => {
  // Mock supabase client to return classes with students and overdue invoices
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/teacher-schedule.test.ts`  
Expected: FAIL with missing `overdue_spp` or `overdue_students_count`.

- [ ] **Step 3: Implement overdue batch query in `src/lib/teacher-schedule.ts`**

In `getTeacherActiveSchedule`:
1. Collect unique student IDs across all active classes.
2. If `studentIds.length > 0`, query `student_invoices`:
   ```typescript
   const todayWib = getWIBDateBounds().dateString;
   const { data: invoices, error: invoiceError } = await supabase
     .from("student_invoices")
     .select("student_id, due_date, total_amount")
     .in("student_id", studentIds)
     .eq("status", "unpaid")
     .lt("due_date", todayWib);
   ```
3. Group invoices by `student_id`: calculate earliest `due_date`, sum `total_amount`, and count invoices.
4. Map onto each student item as `overdue_spp`.
5. Calculate `overdue_students_count` for each class.
6. If `invoiceError`, log warning and gracefully degrade with `overdue_spp: null`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/teacher-schedule.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/teacher-schedule.ts tests/teacher-schedule.test.ts
git commit -m "feat(dal): batch fetch overdue spp for teacher active schedule"
```

---

### Task 2: DAL Types & Overdue SPP Batch Fetch in `src/lib/teaching-logs.ts`

**Files:**
- Modify: `src/lib/teaching-logs.ts`
- Test: `tests/crud/teaching-log-dal.test.ts`

**Interfaces:**
- Consumes: `StudentOverdueSppInfo` from `src/lib/teacher-schedule.ts`
- Produces: Updated `TeacherScheduleStudent` with optional `overdue_spp?: StudentOverdueSppInfo | null;`

- [ ] **Step 1: Write the failing test**

In `tests/crud/teaching-log-dal.test.ts`, add a test verifying `getTeacherScheduleClassForLog` attaches `overdue_spp` to students in the class when overdue invoices exist:

```typescript
it("attaches overdue SPP details to class students when overdue invoices exist", async () => {
  // Mock supabase query to return class placement students and matching unpaid overdue invoice
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/teaching-log-dal.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement overdue query in `getTeacherScheduleClassForLog`**

In `src/lib/teaching-logs.ts`:
1. Update `TeacherScheduleStudent` interface to include `overdue_spp?: StudentOverdueSppInfo | null;`.
2. In `getTeacherScheduleClassForLog`:
   - After fetching the class and student placements, collect the class student IDs.
   - Batch query `student_invoices` for these student IDs where `status = 'unpaid'` and `due_date < todayWib`.
   - Aggregate per student ID (earliest `due_date`, sum `total_amount`, `invoice_count`).
   - Attach to each student in `students`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crud/teaching-log-dal.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/teaching-logs.ts tests/crud/teaching-log-dal.test.ts
git commit -m "feat(dal): batch fetch overdue spp for teacher schedule class log"
```

---

### Task 3: Schedule View UI in `src/components/guru/teacher-schedule-client.tsx`

**Files:**
- Modify: `src/components/guru/teacher-schedule-client.tsx`
- Test: `tests/components/teacher-schedule-client.test.tsx`

**Interfaces:**
- Consumes: `cls.overdue_students_count` and `st.overdue_spp` from `TeacherClassItem`

- [ ] **Step 1: Write the failing test**

In `tests/components/teacher-schedule-client.test.tsx`, add test cases:
1. When `cls.overdue_students_count > 0`, it renders a pill badge `{count} Jatuh Tempo` with `AlertTriangle` icon.
2. In the student list, if a student has `overdue_spp`, it renders the amber info box containing `invoice_count`, formatted due date, and formatted rupiah with `tabular-nums`.
3. If no overdue SPP, the pill badge and info box are absent.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/teacher-schedule-client.test.tsx`  
Expected: FAIL with missing badge or overdue text.

- [ ] **Step 3: Implement UI updates in `teacher-schedule-client.tsx`**

1. Import `AlertTriangle` from `lucide-react`.
2. In the class card header, next to the student count accordion trigger:
   ```tsx
   {Boolean(cls.overdue_students_count && cls.overdue_students_count > 0) && (
     <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
       <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" aria-hidden="true" />
       {cls.overdue_students_count} Jatuh Tempo
     </span>
   )}
   ```
3. Update the accordion toggle button to have `min-h-11` for mobile touch target compliance.
4. In `cls.students.map`:
   ```tsx
   {st.overdue_spp && (
     <div className="mt-2 flex items-start gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
       <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
       <div className="flex-1 min-w-0">
         <span className="font-medium">
           {st.overdue_spp.invoice_count} tagihan jatuh tempo sejak{" "}
           <span className="font-semibold">{formatDateIndo(st.overdue_spp.due_date)}</span>
         </span>
         <span className="block font-bold tabular-nums text-amber-950">
           Rp {st.overdue_spp.total_amount.toLocaleString("id-ID")}
         </span>
       </div>
     </div>
   )}
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/teacher-schedule-client.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/guru/teacher-schedule-client.tsx tests/components/teacher-schedule-client.test.tsx
git commit -m "feat(guru): render overdue spp badge and details in teacher schedule"
```

---

### Task 4: Teaching Log Form UI in `src/components/guru/teaching-log-form.tsx`

**Files:**
- Modify: `src/components/guru/teaching-log-form.tsx`
- Test: `tests/components/teaching-log-form.test.tsx`

**Interfaces:**
- Consumes: `student.overdue_spp` from `classInfo.students`

- [ ] **Step 1: Write the failing test**

In `tests/components/teaching-log-form.test.tsx`, add a test case verifying that an overdue student shows a compact warning banner with due date and amount above their attendance selector:

```typescript
it("renders compact overdue SPP warning banner when student has overdue SPP", () => {
  // Render TeachingLogForm with student containing overdue_spp
  // Assert banner is rendered with AlertTriangle and formatted amount
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/teaching-log-form.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement overdue notice banner in `teaching-log-form.tsx`**

1. Import `AlertTriangle` from `lucide-react`.
2. In `students.map`: lookup `classInfo.students.find(s => s.id === student.student_id)?.overdue_spp`.
3. If present, render the compact alert banner:
   ```tsx
   {overdueSpp && (
     <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
       <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
       <span className="flex-1 min-w-0 truncate">
         SPP jatuh tempo: <span className="font-semibold">{formatDateIndo(overdueSpp.due_date)}</span>
         {" · "}
         <span className="font-bold tabular-nums text-amber-950">
           Rp {overdueSpp.total_amount.toLocaleString("id-ID")}
         </span>
       </span>
     </div>
   )}
   ```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/teaching-log-form.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/guru/teaching-log-form.tsx tests/components/teaching-log-form.test.tsx
git commit -m "feat(guru): render overdue spp alert banner in teaching log form"
```

---

### Task 5: End-to-End Suite Verification & Responsive Check

**Files:**
- Test: All suites

- [ ] **Step 1: Run complete test suite**

Run: `npm test`  
Expected: All tests pass with zero failures.

- [ ] **Step 2: Run linter**

Run: `npm run lint`  
Expected: Zero lint errors or warnings.

- [ ] **Step 3: Run production build**

Run: `npm run build`  
Expected: Successful Turbopack build with zero errors.

- [ ] **Step 4: Run `./init.sh` standard startup verification**

Run: `./init.sh`  
Expected: Script exits 0.

- [ ] **Step 5: Commit & update session artifacts**

Update `progress.md` and `session-handoff.md` with completed feature evidence.

```bash
git commit -m "chore: complete teacher overdue spp indicator feature verification"
```
