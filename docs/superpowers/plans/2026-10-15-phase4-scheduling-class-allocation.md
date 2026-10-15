# Phase 4: Scheduling Invariants, Multi-Branch Allocation & Modal Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement inclusive multi-branch teacher scheduling, cross-branch schedule conflict prevention, weekly frequency quotas, student number stability on edits, safe shift boundaries, and accessible board dialogs.

**Architecture:** 
1. Expand teacher scheduling queries in `src/lib/board.ts:getBoardData` to inspect both primary `profiles.branch_id` and secondary `profile_branches` junction assignments.
2. Extend `insertScheduleClass` to validate cross-branch teacher schedule overlap across both target draft and all currently active drafts (`schedule_drafts.status = 'active'`).
3. Preserve stored student numbers in `src/app/admin/murid/actions.ts:updateStudent`, preventing regeneration on routine edits.
4. Enforce active enrollment status (`status = 'active'`) and weekly frequency quotas (`variant.frequency`) in `AddStudentModal` and `insertSchedulePlacement`.
5. Require positive time intervals (`start_time < end_time`) on shifts and classes, prevent narrowing shift hours when existing classes are stranded, and validate positive variant numbers.
6. Implement dialog focus containment, Escape key handling, and day locking in board modal components.

**Tech Stack:** Next.js 16 (Webpack build), TypeScript, Supabase PostgreSQL, Vitest, React 19.

**Spec:** `docs/superpowers/specs/2026-10-15-phase4-scheduling-class-allocation-design.md`

## Global Constraints

- Never expose, hardcode, or invent credentials/secrets in code, tests, or documentation.
- Maintain existing DAL abstraction: UI components must call `src/lib/` services rather than issuing direct Supabase queries.
- Zero schedule conflicts: Teachers must never be double-booked at the same day and time across any active branch drafts.
- Stable student identity: Editing student profile details must preserve existing student numbers.
- Quota integrity: Students must not be scheduled beyond their enrolled variant's weekly frequency limit.
- Accessibility standard: All modal dialogs must contain focus and support Escape dismissal.

## Review Focus

The five input classes or failure modes the spec implies that are most likely to bite users or administrators:
1. Teacher assigned to Branch B as secondary assignment -> appears in Branch B's scheduling sidebar and class allocation modal.
2. Creating a class for a teacher who already has an active class at another branch at the same day and time -> rejected with descriptive conflict error message.
3. Editing a student's address or parent phone number -> existing student number is retained unchanged.
4. Attempting to place a student who is already scheduled 2x this week in a variant with `frequency = 2` -> excluded from modal and rejected on server placement.
5. Attempting to save a shift with `start_time = 17:00` and `end_time = 09:00` -> rejected with "Jam selesai harus lebih akhir dari jam mulai."

---

### Task 1: Multi-Branch Teacher Allocation & Cross-Branch Overlap Validation (A4, A5, A14)

**Files:**
- Modify: `src/lib/board.ts`
- Test: `tests/crud/multi-branch-scheduling.test.ts`

**Interfaces:**
- Produces: `getBoardData(draftId: string)` in `src/lib/board.ts` (inclusive teacher pool)
- Produces: `insertScheduleClass(data: ...)` in `src/lib/board.ts` (cross-branch conflict & positive interval checks)

- [ ] **Step 1: Write failing tests for multi-branch teacher pool and cross-branch conflict validation**

Create `tests/crud/multi-branch-scheduling.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBoardData, insertScheduleClass } from "@/lib/board";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Multi-Branch Scheduling & Conflict Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getBoardData includes teachers assigned via secondary profile_branches junction", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "schedule_drafts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "draft-1", branch_id: "sumokembangsri", name: "Draf 1" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "branch_shifts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [
                    { id: "teacher-primary", full_name: "Pak Primary", branch_id: "sumokembangsri" },
                    { id: "teacher-secondary", full_name: "Bu Secondary", branch_id: "junwangi" },
                  ],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profile_branches") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ profile_id: "teacher-secondary", branch_id: "sumokembangsri", is_primary: false }],
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const result = await getBoardData("draft-1");
    const teacherIds = result.teachers.map((t) => t.id);
    expect(teacherIds).toContain("teacher-primary");
    expect(teacherIds).toContain("teacher-secondary");
  });

  it("insertScheduleClass rejects inverted time ranges where start_time >= end_time", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { start_time: "08:00:00", end_time: "17:00:00" },
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      insertScheduleClass({
        draft_id: "draft-1",
        shift_id: "shift-1",
        day_of_week: 1,
        teacher_id: "teacher-1",
        variant_id: "var-1",
        start_time: "10:00",
        end_time: "09:00", // Inverted
      })
    ).rejects.toThrow("Jam selesai harus lebih akhir dari jam mulai");
  });

  it("insertScheduleClass detects teacher conflict across active drafts of another branch", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "branch_shifts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { start_time: "08:00:00", end_time: "17:00:00" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  or: vi.fn().mockReturnValue({
                    lt: vi.fn().mockReturnValue({
                      gt: vi.fn().mockResolvedValue({
                        data: [
                          {
                            id: "conflict-class-1",
                            start_time: "09:00:00",
                            end_time: "10:00:00",
                            schedule_drafts: { name: "Draf Aktif Junwangi", status: "active" },
                          },
                        ],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      insertScheduleClass({
        draft_id: "draft-sumo",
        shift_id: "shift-sumo-1",
        day_of_week: 1,
        teacher_id: "teacher-1",
        variant_id: "var-1",
        start_time: "09:30",
        end_time: "10:00",
      })
    ).rejects.toThrow("Jadwal bertabrakan dengan kelas guru yang lain");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/multi-branch-scheduling.test.ts --coverage=false`
Expected: FAIL

- [ ] **Step 3: Update `getBoardData` and `insertScheduleClass` in `src/lib/board.ts`**

In `src/lib/board.ts`:
1. In `getBoardData`: query all active guru profiles, fetch `profile_branches` for `branchId`, and merge teachers where `t.branch_id === branchId || junctionTeacherIds.has(t.id)`.
2. In `insertScheduleClass`:
   - Validate `data.start_time < data.end_time`.
   - Validate shift bounds.
   - Query cross-branch overlap across current draft AND active drafts.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crud/multi-branch-scheduling.test.ts --coverage=false`
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/board.ts tests/crud/multi-branch-scheduling.test.ts
git commit -m "feat(board): include secondary branch teachers in scheduling pool and enforce cross-branch conflict validation"
```

---

### Task 2: Student Number Format (01001 / 02001) & Preservation on Edit (A10)

**Files:**
- Modify: `src/lib/students.ts` (`generateStudentNumber`)
- Modify: `src/app/admin/murid/actions.ts:135-160` (`updateStudent`)
- Test: `tests/crud/student-number-stability.test.ts`

**Interfaces:**
- Produces: `generateStudentNumber(branchId: string, joinedDate?: string): Promise<string>` in `src/lib/students.ts` (returns `01001`... for Sumokembangsri, `02001`... for Junwangi)
- Produces: `updateStudent(id: string, formData: FormData)` in `src/app/admin/murid/actions.ts` (preserves existing student number)

- [ ] **Step 1: Write failing tests for student number format and preservation on edit**

Create `tests/crud/student-number-stability.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateStudent } from "@/app/admin/murid/actions";
import { generateStudentNumber, updateStudentData } from "@/lib/students";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

vi.mock("@/lib/students", () => ({
  updateStudentData: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Student Number Stability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("generates canonical 5-digit number: 01001 for Sumokembangsri and 02001 for Junwangi", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "branches") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((_col: string, val: string) => ({
                single: vi.fn().mockResolvedValue({
                  data: { code: val === "sumokembangsri" ? "01" : "02" },
                  error: null,
                }),
              })),
            }),
          };
        }
        if (table === "students") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((_col: string, val: string) => ({
                not: vi.fn().mockResolvedValue({
                  data: val === "sumokembangsri"
                    ? [{ student_number: "01001" }, { student_number: "01002" }]
                    : [{ student_number: "02001" }],
                  error: null,
                }),
              })),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const sumoNum = await generateStudentNumber("sumokembangsri");
    expect(sumoNum).toBe("01003");

    const junwangiNum = await generateStudentNumber("junwangi");
    expect(junwangiNum).toBe("02002");
  });


  it("preserves existing student_number during ordinary edits when not provided in form", async () => {
    const existingStudentNumber = "2610.01.005";
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                student_number: existingStudentNumber,
                joined_date: "2026-10-01",
              },
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const formData = new FormData();
    formData.append("full_name", "Ahmad Fauzi");
    formData.append("parent_name", "Bapak Fauzi");
    formData.append("parent_phone", "081234567890");
    formData.append("branch_id", "sumokembangsri");
    formData.append(
      "student_programs_json",
      JSON.stringify([{ program_id: "p1", variant_id: "v1", spp_amount: 150000, status: "active" }])
    );
    // student_number is intentionally omitted from formData

    await updateStudent("student-123", formData);

    expect(updateStudentData).toHaveBeenCalledWith(
      "student-123",
      expect.objectContaining({
        student_number: existingStudentNumber, // Must preserve existing number!
      }),
      expect.any(Array)
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/student-number-stability.test.ts --coverage=false`
Expected: FAIL (generates new number instead of preserving existing).

- [ ] **Step 3: Update `generateStudentNumber` in `src/lib/students.ts` and `updateStudent` in `src/app/admin/murid/actions.ts`**

In `src/lib/students.ts:generateStudentNumber`:
```typescript
export async function generateStudentNumber(
  branchId: string,
  _joinedDate?: string
): Promise<string> {
  const supabase = await createClient();
  const { data: branchData } = await supabase
    .from("branches")
    .select("code")
    .eq("id", branchId)
    .single();

  let branchCode = branchData?.code;
  if (!branchCode) {
    branchCode = (branchId === "sumokembangsri" || branchId === "balongbendo") ? "01" : "02";
  }

  const { data: students } = await supabase
    .from("students")
    .select("student_number")
    .eq("branch_id", branchId)
    .not("student_number", "is", null);

  let nextNum = 1;
  if (students && students.length > 0) {
    for (const s of students) {
      if (!s.student_number) continue;
      const regex = new RegExp(`^${branchCode}(\\d{3,})$`);
      const match = s.student_number.match(regex);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (parsed >= nextNum) {
          nextNum = parsed + 1;
        }
      }
    }
  }

  return `${branchCode}${nextNum.toString().padStart(3, "0")}`;
}
```

In `src/app/admin/murid/actions.ts:updateStudent`:
```typescript
  // Fetch existing student record to preserve student_number unless explicitly provided
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
    studentNumber = await generateStudentNumber(branchId);
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crud/student-number-stability.test.ts --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/students.ts src/app/admin/murid/actions.ts tests/crud/student-number-stability.test.ts
git commit -m "feat(murid): format student numbers as 5-digit 01001/02001 and preserve on edit"
```

---

### Task 3: Active Enrollment Filtering & Weekly Quota Enforcement (A11, A12, A13)

**Files:**
- Modify: `src/components/admin/board/add-student-modal.tsx`
- Modify: `src/lib/board.ts` (`insertSchedulePlacement`)
- Modify: `src/components/admin/murid/student-form.tsx:410-415`
- Test: `tests/crud/weekly-quota-placement.test.ts`

**Interfaces:**
- Produces: `insertSchedulePlacement(data: { class_id: string; student_id: string })` in `src/lib/board.ts` (enforcing active status & weekly quota)

- [ ] **Step 1: Write failing tests for weekly quota and active status placement validation**

Create `tests/crud/weekly-quota-placement.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertSchedulePlacement } from "@/lib/board";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Weekly Quota & Active Enrollment Placement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects placement if student enrollment is not active", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "class-1",
                    draft_id: "draft-1",
                    variant_id: "var-bee",
                    program_variants: { system: 2, frequency: 2 },
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "student_programs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { status: "cuti" }, // Student on leave!
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      insertSchedulePlacement({ class_id: "class-1", student_id: "student-1" })
    ).rejects.toThrow("Murid tidak terdaftar aktif dalam varian program ini");
  });

  it("rejects placement if student has already reached weekly frequency quota in current draft", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: "class-1",
                    draft_id: "draft-1",
                    variant_id: "var-bee",
                    program_variants: { system: 2, frequency: 2 }, // 2x per week
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "student_programs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { status: "active" },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        if (table === "schedule_placements") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({
                    count: 2, // Already placed 2 times!
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      insertSchedulePlacement({ class_id: "class-1", student_id: "student-1" })
    ).rejects.toThrow("Murid telah mencapai batas kuota mingguan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/weekly-quota-placement.test.ts --coverage=false`
Expected: FAIL

- [ ] **Step 3: Update `insertSchedulePlacement` in `src/lib/board.ts` and `AddStudentModal`**

In `src/lib/board.ts:insertSchedulePlacement`:
- Fetch `variant_id, draft_id` and `program_variants(system, frequency)`.
- Query `student_programs` status and throw if not `"active"`.
- Query `schedule_placements` count for this student in this draft & variant; throw if count >= frequency.

In `src/components/admin/board/add-student-modal.tsx`:
- Filter active enrollments: `sp.status === 'active' || !sp.status`.
- Calculate student placements in current draft for this variant; exclude if count >= variant.frequency.

In `src/components/admin/murid/student-form.tsx:410-415`:
- Filter inactive variants when `!isEdit`.

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run tests/crud/weekly-quota-placement.test.ts --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/board.ts src/components/admin/board/add-student-modal.tsx src/components/admin/murid/student-form.tsx tests/crud/weekly-quota-placement.test.ts
git commit -m "feat(board): enforce active enrollment status and weekly frequency quotas on student placement"
```

---

### Task 4: Positive Ordered Shift Ranges, Safe Shift Narrowing & Variant Numbers Validation (A15, A16, A23)

**Files:**
- Modify: `src/app/admin/shift/actions.ts`
- Modify: `src/lib/shifts.ts`
- Modify: `src/app/admin/program/actions.ts`
- Test: `tests/crud/shift-time-validation.test.ts`
- Test: `tests/crud/program-numbers-validation.test.ts`

- [ ] **Step 1: Write failing tests for shift time ordering and safe shift narrowing**

Create `tests/crud/shift-time-validation.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createShift } from "@/app/admin/shift/actions";
import { updateBranchShift } from "@/lib/shifts";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Shift Time Range Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createShift rejects start_time >= end_time", async () => {
    const formData = new FormData();
    formData.append("branch_id", "sumokembangsri");
    formData.append("name", "Shift Sore");
    formData.append("start_time", "17:00");
    formData.append("end_time", "09:00"); // Inverted!

    const res = await createShift(formData);
    expect(res?.fieldErrors?.end_time).toBe("Jam selesai harus lebih akhir dari jam mulai.");
  });

  it("updateBranchShift rejects narrowing shift hours when existing classes are stranded", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockResolvedValue({
              data: [{ id: "class-1", start_time: "10:00:00", end_time: "11:00:00" }],
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateBranchShift("shift-1", {
        start_time: "09:00",
        end_time: "10:00", // Narrowed so 10:00-11:00 class is stranded!
      })
    ).rejects.toThrow("Jam shift tidak dapat dipersempit");
  });
});
```

Create `tests/crud/program-numbers-validation.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProgram } from "@/app/admin/program/actions";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

describe("Program Variant Numbers Validation", () => {
  it("rejects non-positive duration, frequency, or capacity (system)", async () => {
    const formData = new FormData();
    formData.append("initials", "TST");
    formData.append("name", "Test Program");
    formData.append("type", "original");
    formData.append(
      "variants_json",
      JSON.stringify([{ name: "Varian 0", duration: 30, frequency: 3, system: 0 }]) // Capacity 0!
    );

    const res = await createProgram(formData);
    expect(res?.fieldErrors?.variants).toBe("Durasi, frekuensi, dan kapasitas murid (sistem) harus berupa angka positif (> 0).");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/crud/shift-time-validation.test.ts tests/crud/program-numbers-validation.test.ts --coverage=false`
Expected: FAIL

- [ ] **Step 3: Update shift actions, shift DAL, and program actions**

In `src/app/admin/shift/actions.ts`:
- Check `if (startTime && endTime && startTime >= endTime)` -> set `fieldErrors.end_time`.

In `src/lib/shifts.ts:updateBranchShift`:
- Query `schedule_classes` for `shift_id = id` where `start_time < data.start_time OR end_time > data.end_time`.
- Throw if classes found.

In `src/app/admin/program/actions.ts`:
- Validate that every variant has `duration > 0 && frequency > 0 && system > 0`.

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run tests/crud/shift-time-validation.test.ts tests/crud/program-numbers-validation.test.ts --coverage=false`
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/shift/actions.ts src/lib/shifts.ts src/app/admin/program/actions.ts tests/crud/shift-time-validation.test.ts tests/crud/program-numbers-validation.test.ts
git commit -m "fix(shift): enforce positive time ranges, prevent invalid shift narrowing, and validate variant numbers"
```

---

### Task 5: Kanban Board Modal Focus Traps, Accessibility & Day Locking (A26)

**Files:**
- Modify: `src/components/admin/board/add-class-modal.tsx`
- Modify: `src/components/admin/board/add-student-modal.tsx`
- Modify: `src/components/admin/board/class-time-modal.tsx`
- Test: `tests/components/board-modal-accessibility.test.tsx`

- [ ] **Step 1: Write failing tests for modal accessibility and Escape listener**

Create `tests/components/board-modal-accessibility.test.tsx`:
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AddClassModal } from "@/components/admin/board/add-class-modal";
import "@testing-library/jest-dom";

describe("Board Modal Accessibility", () => {
  it("renders with role dialog and closes on Escape key", () => {
    const onClose = vi.fn();
    const mockShift = { id: "s1", name: "Shift Pagi", start_time: "08:00:00", end_time: "12:00:00" } as never;

    render(
      <AddClassModal
        isOpen={true}
        onClose={onClose}
        shift={mockShift}
        activeDay={1}
        teachers={[]}
        variants={[]}
        existingClasses={[]}
        onNext={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/board-modal-accessibility.test.tsx --coverage=false`
Expected: FAIL (`role="dialog"` not found).

- [ ] **Step 3: Update `AddClassModal`, `AddStudentModal`, and `ClassTimeModal`**

Add `role="dialog"`, `aria-modal="true"`, focus containment, Escape key handler, and lock `targetDay` at mount time in all 3 board modals.

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run tests/components/board-modal-accessibility.test.tsx --coverage=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/board/add-class-modal.tsx src/components/admin/board/add-student-modal.tsx src/components/admin/board/class-time-modal.tsx tests/components/board-modal-accessibility.test.tsx
git commit -m "fix(board): add dialog accessibility, focus containment, and Escape dismissal to board modals"
```

---

### Task 6: Full Verification Harness & Documentation Gate

**Files:**
- Modify: `progress.md`, `session-handoff.md`

- [ ] **Step 1: Run full unit test suite**

Run: `npm test`
Expected: 47+ test suites passed, 100% tests passing, coverage exceeding all global thresholds.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Production build succeeds cleanly via Webpack with service worker compilation.

- [ ] **Step 4: Run full `./init.sh` verification entrypoint**

Run: `./init.sh`
Expected: Success ("Repository state is verified, clean, and restartable.")

- [ ] **Step 5: Update `progress.md` and `session-handoff.md`**

Document Phase 4 implementation completion, automated test results, and next steps for Phase 5.

- [ ] **Step 6: Commit**

```bash
git add progress.md session-handoff.md
git commit -m "docs: record Phase 4 implementation completion and verification evidence"
```
