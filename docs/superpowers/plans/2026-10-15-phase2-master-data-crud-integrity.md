# Phase 2: Master Data CRUD Integrity & Transactional Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate data loss risks and false-success reporting across student enrollment updates, program variant upsert/deletion, teacher provisioning rollback, and remove the destructive seed script.

**Architecture:** 
1. Align enrollment status vocabulary to canonical schema constraint (`active`, `cuti`, `lulus`, `keluar`) across form components and detail views, backed by atomic synchronization with memory restore in `updateStudentData`.
2. Pre-allocate client UUIDs for newly created program variants before upsert to eliminate NULL primary key PostgREST union violations, track retained variant IDs preventing mass deletion, and surface explanatory errors on foreign-key deletion restriction.
3. Add compensating rollback to `insertGuruProfile` to delete orphan Auth users if profile/junction creation fails, and check returned errors on `profile_branches` mutations.
4. Remove obsolete `seed-variants.mjs`.

**Tech Stack:** Next.js 16 (Webpack build), TypeScript, Supabase PostgreSQL, Vitest, React 19.

**Spec:** `docs/superpowers/specs/2026-10-15-phase2-master-data-crud-integrity-design.md`

## Global Constraints

- Never expose, hardcode, or invent credentials/secrets in code, tests, or documentation.
- Maintain existing DAL abstraction: UI components must call `src/lib/` services rather than issuing direct Supabase table queries.
- Zero data loss: Editing a student or program must never destroy existing records if a subsequent insertion fails.
- Vocabulary consistency: Status values must strictly match the database constraint `CHECK (status IN ('active', 'cuti', 'lulus', 'keluar'))`.
- Clean error surfaces: User actions must surface human-friendly error messages instead of failing silently with false success notifications.

## Review Focus

The five input classes or failure modes the spec implies that are most likely to bite users or administrators:
1. Student enrollment edited with status "Lulus" or "Berhenti / Tidak Aktif" -> submitted as `lulus` or `keluar`, successfully accepted by database check constraint.
2. Replacing all program variants with brand-new variants -> new variants are assigned UUIDs and persisted; old variants are removed without wiping out the new ones.
3. Attempting to delete a program variant that has active student enrollments or schedule classes -> transaction returns user-friendly explanatory error instead of silent false success.
4. Teacher creation failure midway through (e.g. database error on profile or junction) -> newly created Auth user is cleaned up via compensating `deleteUser(newUserId)`, allowing email reuse on retry.
5. Updating teacher branches with invalid branch ID -> operation throws error and halts instead of silently continuing with lost secondary branches.

---

### Task 1: Student Enrollment Status Canonical Vocabulary & UI Alignment (A1)

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/components/admin/murid/student-form.tsx:435-449`
- Modify: `src/app/admin/murid/[id]/page.tsx:210-217`
- Test: `tests/crud/student-form-status.test.tsx`

**Interfaces:**
- Produces: `StudentProgramStatus` union (`"active" | "cuti" | "lulus" | "keluar"`) and `STUDENT_PROGRAM_STATUS_OPTIONS` in `src/types/index.ts`.
- Consumes: `STUDENT_PROGRAM_STATUS_OPTIONS` in `src/components/admin/murid/student-form.tsx`.

- [ ] **Step 1: Write failing test verifying StudentForm status options and detail view badge rendering**

Create `tests/crud/student-form-status.test.tsx`:
```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StudentForm } from "@/components/admin/murid/student-form";
import { STUDENT_PROGRAM_STATUS_OPTIONS } from "@/types";
import "@testing-library/jest-dom";

vi.mock("@/app/admin/murid/actions", () => ({
  createStudent: vi.fn(),
  updateStudent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

describe("Student Program Status Vocabulary", () => {
  it("exports canonical status options matching the database constraint", () => {
    const values = STUDENT_PROGRAM_STATUS_OPTIONS.map((o) => o.value);
    expect(values).toEqual(["active", "cuti", "lulus", "keluar"]);
  });

  it("renders canonical status options in StudentForm when programs are selected", () => {
    const mockBranches = [{ id: "junwangi", name: "Cabang Junwangi", is_active: true } as never];
    const mockPrograms = [
      {
        id: "p1",
        name: "AHE",
        initials: "AHE",
        is_active: true,
        program_variants: [{ id: "v1", name: "AHE Reguler", default_spp: 150000 }],
      } as never,
    ];
    const initialData = {
      id: "student-1",
      full_name: "Ahmad",
      parent_name: "Bapak Ahmad",
      parent_phone: "081234567890",
      branch_id: "junwangi",
      student_programs: [{ program_id: "p1", variant_id: "v1", status: "active" }],
    } as never;

    render(
      <StudentForm
        branches={mockBranches}
        programs={mockPrograms}
        initialData={initialData}
        isEdit={true}
      />
    );

    const select = screen.getByLabelText(/Status Program/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    const options = Array.from(select.querySelectorAll("option")).map((o) => o.value);
    expect(options).toEqual(["active", "cuti", "lulus", "keluar"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/student-form-status.test.tsx --coverage=false`
Expected: FAIL with "STUDENT_PROGRAM_STATUS_OPTIONS is not exported" or options mismatch.

- [ ] **Step 3: Define `StudentProgramStatus` in `src/types/index.ts`**

In `src/types/index.ts`, export the canonical status type and options:
```typescript
export type StudentProgramStatus = "active" | "cuti" | "lulus" | "keluar";

export const STUDENT_PROGRAM_STATUS_OPTIONS: { value: StudentProgramStatus; label: string }[] = [
  { value: "active", label: "Sedang Aktif" },
  { value: "cuti", label: "Cuti Sementara" },
  { value: "lulus", label: "Lulus" },
  { value: "keluar", label: "Keluar / Berhenti" },
];
```

- [ ] **Step 4: Update `StudentForm` and student detail page with canonical statuses**

In `src/components/admin/murid/student-form.tsx:440-444`:
Replace the hardcoded options array with `STUDENT_PROGRAM_STATUS_OPTIONS`.

In `src/app/admin/murid/[id]/page.tsx:212-216`:
Update status badge mapping:
```tsx
{sp.status && sp.status !== "active" && (
  <span
    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
      sp.status === "lulus"
        ? "text-emerald-700 bg-emerald-100"
        : sp.status === "cuti"
        ? "text-amber-700 bg-amber-100"
        : "text-rose-700 bg-rose-100"
    }`}
  >
    {sp.status === "lulus"
      ? "LULUS"
      : sp.status === "cuti"
      ? "CUTI"
      : "KELUAR"}
  </span>
)}
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/crud/student-form-status.test.tsx --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/components/admin/murid/student-form.tsx src/app/admin/murid/[id]/page.tsx tests/crud/student-form-status.test.tsx
git commit -m "fix(murid): align student enrollment status vocabulary to database constraint"
```

---

### Task 2: Atomic Non-Destructive Student Enrollment Synchronization (A1)

**Files:**
- Modify: `src/lib/students.ts:155-200`
- Test: `tests/crud/student-enrollment-sync.test.ts`

**Interfaces:**
- Consumes: `createClient()` from `@/lib/supabase/server`
- Produces: `updateStudentData(id: string, studentData: StudentUpdate, studentPrograms: Omit<StudentProgramInsert, "student_id">[]): Promise<{ success?: boolean; error?: string }>` in `src/lib/students.ts`

- [ ] **Step 1: Write failing tests for atomic enrollment updates**

Create `tests/crud/student-enrollment-sync.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateStudentData } from "@/lib/students";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("updateStudentData atomic synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-validates program statuses and rejects invalid strings without touching database", async () => {
    const mockSupabase = { from: vi.fn() };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const invalidPrograms = [
      { program_id: "p1", variant_id: "v1", spp_amount: 150000, status: "invalid_status" as never },
    ];

    const result = await updateStudentData("student-1", { full_name: "Budi" }, invalidPrograms);
    expect(result.error).toContain("Status program 'invalid_status' tidak valid");
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("pre-validates that variant_id is present for each enrolled program", async () => {
    const mockSupabase = { from: vi.fn() };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const invalidPrograms = [
      { program_id: "p1", variant_id: "", spp_amount: 150000, status: "active" as const },
    ];

    const result = await updateStudentData("student-1", { full_name: "Budi" }, invalidPrograms);
    expect(result.error).toContain("Varian program wajib dipilih");
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("performs safe update and restores previous records if junction insertion fails", async () => {
    const mockExistingEnrollments = [{ student_id: "student-1", program_id: "p1", variant_id: "v0", status: "active" }];
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ error: { message: "Check constraint failure" } }),
    });
    insertMock.mockResolvedValueOnce({ error: { message: "Check constraint failure" } });

    const restoreInsertMock = vi.fn().mockResolvedValue({ error: null });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "students") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "student_programs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockExistingEnrollments, error: null }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            insert: vi.fn().mockImplementation((payload) => {
              if (payload === mockExistingEnrollments) {
                return restoreInsertMock();
              }
              return insertMock();
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const validPrograms = [
      { program_id: "p1", variant_id: "v1", spp_amount: 150000, status: "lulus" as const },
    ];

    const result = await updateStudentData("student-1", { full_name: "Budi" }, validPrograms);
    expect(result.error).toContain("Gagal menyimpan pendaftaran program baru");
    // Verify previous enrollments restoration was triggered
    expect(restoreInsertMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/student-enrollment-sync.test.ts --coverage=false`
Expected: FAIL because pre-validation and memory backup/restore are not yet implemented in `updateStudentData`.

- [ ] **Step 3: Implement atomic non-destructive update in `src/lib/students.ts`**

Update `updateStudentData` in `src/lib/students.ts`:
```typescript
export async function updateStudentData(
  id: string,
  studentData: StudentUpdate,
  studentPrograms: Omit<StudentProgramInsert, "student_id">[]
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Pre-validation: ensure all program statuses match the constraint
  const validStatuses: Record<string, true> = {
    active: true,
    cuti: true,
    lulus: true,
    keluar: true,
  };

  for (const sp of studentPrograms) {
    if (sp.status && !validStatuses[sp.status]) {
      return { error: `Status program '${sp.status}' tidak valid.` };
    }
    if (!sp.variant_id) {
      return { error: "Varian program wajib dipilih untuk setiap program terdaftar." };
    }
  }

  // 2. Update core student row
  const { error: updateError } = await supabase
    .from("students")
    .update({
      ...studentData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { error: `Gagal memperbarui data murid: ${updateError.message}` };
  }

  // 3. Backup existing records in memory in case replacement fails
  const { data: existingRecords, error: fetchError } = await supabase
    .from("student_programs")
    .select("*")
    .eq("student_id", id);

  if (fetchError) {
    return { error: `Gagal membaca pendaftaran lama: ${fetchError.message}` };
  }

  const { error: deleteError } = await supabase
    .from("student_programs")
    .delete()
    .eq("student_id", id);

  if (deleteError) {
    return { error: `Gagal memperbarui pendaftaran program: ${deleteError.message}` };
  }

  if (studentPrograms.length > 0) {
    const { error: insertError } = await supabase
      .from("student_programs")
      .insert(
        studentPrograms.map((sp) => ({
          ...sp,
          student_id: id,
          status: sp.status || "active",
        }))
      );

    if (insertError) {
      // Compensate: attempt restoring previous records to prevent permanent data loss
      if (existingRecords && existingRecords.length > 0) {
        await supabase.from("student_programs").insert(existingRecords);
      }
      return { error: `Gagal menyimpan pendaftaran program baru: ${insertError.message}` };
    }
  }

  return { success: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crud/student-enrollment-sync.test.ts --coverage=false`
Expected: PASS (3 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/students.ts tests/crud/student-enrollment-sync.test.ts
git commit -m "fix(murid): make student enrollment synchronization atomic with pre-validation and compensating restore"
```

---

### Task 3: Deterministic UUID Allocation & Safe Variant Deletion in Program Management (A2, A3, A17)

**Files:**
- Modify: `src/app/admin/program/actions.ts:152-178`
- Modify: `src/lib/programs.ts:80-118`
- Test: `tests/crud/program-variant-sync.test.ts`

**Interfaces:**
- Produces: `updateProgramData(id: string, programData: ProgramUpdate, variantsToUpsert: VariantInsert[], activeVariantIds: string[]): Promise<{ success?: boolean; error?: { message: string } }>` in `src/lib/programs.ts`.
- Consumes: `updateProgramData` in `src/app/admin/program/actions.ts`.

- [ ] **Step 1: Write failing tests for program variant upsert, full replacement, and FK restrict handling**

Create `tests/crud/program-variant-sync.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProgramData } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("updateProgramData variant synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles replacing all variants without triggering mass deletion", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    const notMock = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        not: notMock,
      }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "programs") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "program_variants") {
          return {
            upsert: upsertMock,
            delete: deleteMock,
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const newVariants = [
      { id: "new-uuid-1", program_id: "prog-1", name: "Varian Baru 1" } as never,
      { id: "new-uuid-2", program_id: "prog-1", name: "Varian Baru 2" } as never,
    ];
    const activeIds = ["new-uuid-1", "new-uuid-2"];

    const result = await updateProgramData("prog-1", { name: "Program Test" }, newVariants, activeIds);
    expect(result.success).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(newVariants);
    // Ensure it called delete with NOT IN (activeIds) rather than deleting all variants
    expect(notMock).toHaveBeenCalledWith("id", "in", "(new-uuid-1,new-uuid-2)");
  });

  it("surfaces friendly error message when variant deletion violates foreign key restrict", async () => {
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        not: vi.fn().mockResolvedValue({
          error: {
            message: "violates foreign key constraint 'student_programs_variant_id_fkey' on table 'student_programs'",
            code: "23503",
          },
        }),
      }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "programs") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "program_variants") {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
            delete: deleteMock,
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const variants = [{ id: "retained-id", program_id: "prog-1", name: "Varian 1" } as never];
    const activeIds = ["retained-id"];

    const result = await updateProgramData("prog-1", { name: "Program Test" }, variants, activeIds);
    expect(result.error?.message).toContain("Varian tidak dapat dihapus karena masih digunakan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/program-variant-sync.test.ts --coverage=false`
Expected: FAIL because FK restrict error mapping is not yet implemented.

- [ ] **Step 3: Update `updateProgram` in `src/app/admin/program/actions.ts`**

Update lines 152-178 in `src/app/admin/program/actions.ts`:
```typescript
  const variantsToUpsert = variants.map((v: Record<string, unknown>, idx: number) => {
    const isNew = !v.id || (typeof v.id === "string" && v.id.startsWith("new-"));
    const assignedId = isNew ? crypto.randomUUID() : (v.id as string);

    return {
      id: assignedId,
      program_id: id,
      name: typeof v.name === "string" ? v.name : "",
      duration: typeof v.duration === "number" ? v.duration : 30,
      frequency: typeof v.frequency === "number" ? v.frequency : 3,
      system: typeof v.system === "number" ? v.system : 2,
      teacher_fee: typeof v.teacher_fee === "number" ? v.teacher_fee : 0,
      default_spp: typeof v.default_spp === "number" ? v.default_spp : 0,
      sort_order: typeof v.sort_order === "number" ? v.sort_order : idx,
      is_active: typeof v.is_active === "boolean" ? v.is_active : true,
      show_on_landing: typeof v.show_on_landing === "boolean" ? v.show_on_landing : true,
    };
  });

  const activeVariantIds = variantsToUpsert.map((v) => v.id);

  const { error } = await updateProgramData(
    id,
    programDataToUpdate,
    variantsToUpsert,
    activeVariantIds
  );
```

- [ ] **Step 4: Update `updateProgramData` in `src/lib/programs.ts`**

Update `updateProgramData` in `src/lib/programs.ts`:
```typescript
export async function updateProgramData(
  id: string,
  programData: ProgramUpdate,
  variantsToUpsert: VariantInsert[],
  activeVariantIds: string[]
): Promise<{ success?: boolean; error?: { message: string } }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("programs")
    .update(programData)
    .eq("id", id);

  if (error) {
    return { error };
  }

  if (variantsToUpsert.length > 0) {
    const { error: variantError } = await supabase
      .from("program_variants")
      .upsert(variantsToUpsert);
      
    if (variantError) {
      return { error: variantError };
    }
  }

  if (activeVariantIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("program_variants")
      .delete()
      .eq("program_id", id)
      .not("id", "in", `(${activeVariantIds.join(",")})`);

    if (deleteError) {
      if (deleteError.message.includes("foreign key") || deleteError.code === "23503") {
        return {
          error: {
            message:
              "Varian tidak dapat dihapus karena masih digunakan oleh murid aktif atau jadwal kelas. Nonaktifkan status varian jika tidak ingin digunakan.",
          },
        };
      }
      return { error: deleteError };
    }
  } else {
    const { error: deleteAllError } = await supabase
      .from("program_variants")
      .delete()
      .eq("program_id", id);

    if (deleteAllError) {
      return { error: deleteAllError };
    }
  }

  return { success: true };
}
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/crud/program-variant-sync.test.ts --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/program/actions.ts src/lib/programs.ts tests/crud/program-variant-sync.test.ts
git commit -m "fix(program): allocate UUIDs upfront for new variants and handle FK constraint errors on deletion"
```

---

### Task 4: Teacher Provisioning Compensating Rollback & Branch Error Inspection (A18, A25)

**Files:**
- Modify: `src/lib/gurus.ts:134-215, 290-310`
- Test: `tests/crud/guru-provisioning-rollback.test.ts`

**Interfaces:**
- Consumes: `createAdminClient()` from `@/lib/supabase/admin`, `createClient()` from `@/lib/supabase/server`
- Produces: `insertGuruProfile(data: CreateGuruProfileData): Promise<{ success?: boolean; userId?: string }>`, `updateGuruProfile(id: string, data: UpdateGuruProfileData): Promise<void>` in `src/lib/gurus.ts`

- [ ] **Step 1: Write failing tests for compensating rollback and branch error propagation**

Create `tests/crud/guru-provisioning-rollback.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertGuruProfile, updateGuruProfile } from "@/lib/gurus";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Guru Provisioning & Junction Synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes newly created Auth user if profile upsert fails during insertGuruProfile", async () => {
    const deleteUserMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    const mockAdminClient = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: { id: "new-user-123" } },
            error: null,
          }),
          deleteUser: deleteUserMock,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            upsert: vi.fn().mockResolvedValue({
              error: { message: "Database connection failed" },
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);

    await expect(
      insertGuruProfile({
        email: "guru@example.com",
        password: "password123",
        fullName: "Bu Siti",
        phone: "0812345678",
      })
    ).rejects.toThrow("Gagal mengisi data profil");

    // Compensating rollback MUST delete the created auth user
    expect(deleteUserMock).toHaveBeenCalledWith("new-user-123");
  });

  it("throws and propagates error when profile_branches insertion fails during updateGuruProfile", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          };
        }
        if (table === "profile_branches") {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            insert: vi.fn().mockResolvedValue({
              error: { message: "Foreign key violation on branch_id" },
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateGuruProfile("guru-1", {
        fullName: "Pak Budi",
        branchIds: ["invalid-branch"],
      })
    ).rejects.toThrow("Gagal menetapkan cabang penugasan guru");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/guru-provisioning-rollback.test.ts --coverage=false`
Expected: FAIL because compensating deleteUser and explicit branch error checks are not yet implemented.

- [ ] **Step 3: Implement compensating rollback and explicit error checks in `src/lib/gurus.ts`**

Update `insertGuruProfile` in `src/lib/gurus.ts`:
Wrap profile and junction inserts in try/catch and invoke `await adminClient.auth.admin.deleteUser(newUserId)` on error.

Update `updateGuruProfile` in `src/lib/gurus.ts`:
Remove passive try/catch and check `{ error }` on `delete()` and `insert()` for `profile_branches`:
```typescript
  // Update profile_branches junction with explicit error checking
  const { error: deleteBranchError } = await supabase
    .from("profile_branches")
    .delete()
    .eq("profile_id", id);

  if (deleteBranchError) {
    throw new Error(`Gagal menghapus cabang penugasan lama: ${deleteBranchError.message}`);
  }

  if (effectiveBranchIds.length > 0) {
    const { error: insertBranchError } = await supabase
      .from("profile_branches")
      .insert(
        effectiveBranchIds.map((bId) => ({
          profile_id: id,
          branch_id: bId,
          is_primary: bId === effectivePrimaryBranch,
        }))
      );

    if (insertBranchError) {
      throw new Error(`Gagal menetapkan cabang penugasan guru: ${insertBranchError.message}`);
    }
  }
```

- [ ] **Step 4: Run tests and verify they pass**

Run: `npx vitest run tests/crud/guru-provisioning-rollback.test.ts --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/gurus.ts tests/crud/guru-provisioning-rollback.test.ts
git commit -m "fix(guru): add compensating rollback for failed teacher provisioning and check branch junction errors"
```

---

### Task 5: Cleanup of Obsolete Destructive Seed Script (O2)

**Files:**
- Delete: `seed-variants.mjs`
- Test: `tests/crud/seed-script-quarantine.test.ts`

- [ ] **Step 1: Write test verifying obsolete seed script is removed and not referenced**

Create `tests/crud/seed-script-quarantine.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

describe("Seed Script Quarantine", () => {
  it("seed-variants.mjs is removed from the root directory", () => {
    const scriptPath = path.resolve(process.cwd(), "seed-variants.mjs");
    expect(existsSync(scriptPath)).toBe(false);
  });

  it("package.json does not reference seed-variants.mjs in any script", () => {
    const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
    const scripts = Object.values(pkg.scripts || {});
    for (const script of scripts) {
      expect(String(script)).not.toContain("seed-variants");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/seed-script-quarantine.test.ts --coverage=false`
Expected: FAIL because `seed-variants.mjs` still exists.

- [ ] **Step 3: Remove `seed-variants.mjs` from repository**

```bash
git rm seed-variants.mjs
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crud/seed-script-quarantine.test.ts --coverage=false`
Expected: PASS (2 tests passing)

- [ ] **Step 5: Commit**

```bash
git add tests/crud/seed-script-quarantine.test.ts
git commit -m "chore: remove obsolete destructive seed-variants.mjs script"
```

---

### Task 6: Full Verification Harness & Documentation Gate

**Files:**
- Modify: `progress.md`, `session-handoff.md`

- [ ] **Step 1: Run full unit test suite**

Run: `npm test`
Expected: 36 test suites passed, 100% tests passing, coverage exceeding all global thresholds.

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

Document Phase 2 implementation completion, automated test results, and next steps for Phase 3.

- [ ] **Step 6: Commit**

```bash
git add progress.md session-handoff.md
git commit -m "docs: record Phase 2 implementation completion and verification evidence"
```
