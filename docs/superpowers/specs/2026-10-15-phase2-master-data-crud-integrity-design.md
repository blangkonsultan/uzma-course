# Technical Specification: Phase 2 Master Data CRUD Integrity & Transactional Consistency

- **Date:** 2026-10-15
- **Status:** Draft for Review (Brainstorming Architectural Path)
- **Target Subsystem:** Master Data CRUD (Students, Programs & Variants, Teachers/Auth, Database Seed Scripts)
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Problem Statement

Following Phase 1 security remediation, Phase 2 addresses data integrity, transaction failure recovery, and schema constraint mismatches identified during the codebase audit on commit `17d3580`:

1. **A1 (P1): Student Enrollment Status Constraint Mismatch & Deletion Data Loss**
   - Files: `src/components/admin/murid/student-form.tsx:440-444`, `src/lib/students.ts:174-196`, `src/app/admin/murid/[id]/page.tsx:212-216`
   - Issue: The student form offered `'active'`, `'graduated'`, and `'inactive'` as program enrollment statuses. However, database migration `20261002010022_phase2b_master_data.sql` defined constraint:
     `CHECK (status IN ('active', 'cuti', 'lulus', 'keluar'))`
   - When an admin selects "Lulus" or "Berhenti", the form sends `'graduated'` or `'inactive'`, which Postgres rejects.
   - In `students.ts:updateStudentData()`, existing junction records in `student_programs` are deleted before attempting to insert the new list. When the insert fails, the deletion has already committed, causing irreversible loss of the student's enrollments.

2. **A2 & A3 (P1): Program Variant ID Union Violation & Delete-All Bug**
   - Files: `src/app/admin/program/actions.ts:152-177`, `src/lib/programs.ts:98-115`
   - Issue: In `updateProgram`, newly added variants are assigned temporary IDs (`new-*`) and stripped of `id` before upsert. When upserting a mixed payload containing both existing UUIDs and new variant objects, PostgREST unions the payload columns, populating missing `id` fields with `NULL`, which violates the primary key `NOT NULL` constraint.
   - Furthermore, `activeVariantIds` only filters variants with string IDs, excluding all new variants. If all existing variants are replaced with new ones, `activeVariantIds` is empty, triggering `delete().eq("program_id", id)`, which wipes out all variants including the newly upserted ones.

3. **A17 (P2): Silently Swallowed Foreign Key Deletion Errors on Program Variants**
   - File: `src/lib/programs.ts:107-116`
   - Issue: When an admin removes a variant from a program that is still referenced by student enrollments (`student_programs`) or schedule classes (`schedule_classes`), the `delete()` query fails with `ON DELETE RESTRICT`. The DAL does not inspect the `{ error }` response from Supabase, returning `{ success: true }`. The admin is shown a false success notification, but the variant reappears on page reload.

4. **A18 (P2): Silently Swallowed Errors in Teacher Branch Assignment Updates**
   - File: `src/lib/gurus.ts:292-306`
   - Issue: Operations on `profile_branches` (`delete()` and `insert()`) are wrapped in a passive `try/catch`. In `supabase-js`, database query rejections resolve to `{ error }` rather than throwing exceptions. The errors are unhandled, leading to silent loss of secondary branch assignments.

5. **A25 (P2): Dangling Auth User on Failed Profile/Junction Provisioning**
   - File: `src/lib/gurus.ts:156-196`
   - Issue: In `insertGuruProfile`, `adminClient.auth.admin.createUser()` runs first. If subsequent profile upsert (`profiles`) or junction insertion (`profile_branches`, `profile_programs`) fails, the action throws an error without removing the newly created auth user. Retrying the form with the same email fails with *"Email ini sudah terdaftar sebagai pengguna"*, locking the admin out from creating the teacher without manual database intervention.

6. **O2 (P1): Obsolete Destructive Seed Script (`seed-variants.mjs`)**
   - File: `seed-variants.mjs:15-39`
   - Issue: The root script contains mass-delete commands for `student_programs`, `profile_programs`, `program_variants`, and `programs`, followed by an insert into `programs` containing column `frequency`, which was dropped from the schema in migration `20261002045000_move_frequency_to_variants.sql`. Running this script corrupts live databases.

---

## 2. Architectural Design & Specifications

```
+---------------------------------------------------------------------------------------------------+
|                                      PHASE 2 ARCHITECTURE                                         |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  1. VOCABULARY & CONTRACT ALIGNMENT:                                                              |
|     +-----------------------------------------------------------------------------------------+   |
|     |  student_programs.status: 'active' | 'cuti' | 'lulus' | 'keluar'                          |   |
|     |  - StudentForm: UI dropdown labels & values exactly match DB constraint                 |   |
|     |  - Student Detail Page: Render accurate status badge ('lulus', 'cuti', 'keluar')        |   |
|     |  - TypeScript types: Strict union type StudentProgramStatus                              |   |
|     +-----------------------------------------------------------------------------------------+   |
|                                                                                                   |
|  2. ATOMIC ENROLLMENT SYNCHRONIZATION:                                                            |
|     +-----------------------------------------------------------------------------------------+   |
|     |  src/lib/students.ts: updateStudentData()                                               |   |
|     |  - Step 1: Pre-validate all enrollment items (variant exists, status valid)            |   |
|     |  - Step 2: Update student core profile                                                  |   |
|     |  - Step 3: Insert new/updated enrollments FIRST or atomic upsert                        |   |
|     |  - Step 4: Delete removed enrollments ONLY after successful insert                      |   |
|     |  - Step 5: Check every { error } and abort with rollback if any step fails              |   |
|     +-----------------------------------------------------------------------------------------+   |
|                                                                                                   |
|  3. DETERMINISTIC VARIANT IDENTIFIERS & FK ERROR REPORTING:                                       |
|     +-----------------------------------------------------------------------------------------+   |
|     |  src/app/admin/program/actions.ts & src/lib/programs.ts                                 |   |
|     |  - Pre-allocate UUIDs for new variants (crypto.randomUUID()) BEFORE upsert               |   |
|     |  - All variants carry valid UUID; PostgREST receives no NULL primary keys               |   |
|     |  - activeVariantIds includes ALL retained + newly created UUIDs                         |   |
|     |  - Delete query checks { error: deleteError }; surface FK constraint message to admin   |   |
|     +-----------------------------------------------------------------------------------------+   |
|                                                                                                   |
|  4. TEACHER PROVISIONING COMPENSATING ROLLBACK:                                                   |
|     +-----------------------------------------------------------------------------------------+   |
|     |  src/lib/gurus.ts: insertGuruProfile() & updateGuruProfile()                            |   |
|     |  - Try/catch with compensating rollback: deleteUser(newUserId) if profile/junction fails |   |
|     |  - Check { error } on profile_branches delete and insert; fail loudly on error          |   |
|     +-----------------------------------------------------------------------------------------+   |
|                                                                                                   |
|  5. SCRIPT CLEANUP:                                                                               |
|     +-----------------------------------------------------------------------------------------+   |
|     |  Remove obsolete seed-variants.mjs from root directory                                  |   |
|     +-----------------------------------------------------------------------------------------+   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### 2.1 Student Enrollment Vocabulary & Atomic Synchronization (A1)

#### 2.1.1 Type Definition & Vocabulary
Define canonical status type in `src/types/database.ts` and `src/types/index.ts`:

```typescript
export type StudentProgramStatus = "active" | "cuti" | "lulus" | "keluar";

export const STUDENT_PROGRAM_STATUS_OPTIONS: { value: StudentProgramStatus; label: string }[] = [
  { value: "active", label: "Sedang Aktif" },
  { value: "cuti", label: "Cuti Sementara" },
  { value: "lulus", label: "Lulus" },
  { value: "keluar", label: "Keluar / Berhenti" },
];
```

#### 2.1.2 UI Form & Detail View Alignment
- **Form Component (`src/components/admin/murid/student-form.tsx`):**
  Replace hardcoded `{ value: 'graduated', label: 'Lulus' }` and `{ value: 'inactive', ... }` with `STUDENT_PROGRAM_STATUS_OPTIONS`.
- **Detail Page (`src/app/admin/murid/[id]/page.tsx`):**
  Render badge based on canonical statuses:
  - `"lulus"`: `text-emerald-700 bg-emerald-100` ("LULUS")
  - `"cuti"`: `text-amber-700 bg-amber-100` ("CUTI")
  - `"keluar"`: `text-rose-700 bg-rose-100` ("KELUAR")

#### 2.1.3 Atomic Enrollment Replacement in `src/lib/students.ts`
Prevent data loss by validating before mutation and checking every response:

```typescript
export async function updateStudentData(
  id: string,
  studentData: StudentUpdate,
  studentPrograms: Omit<StudentProgramInsert, "student_id">[]
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Pre-validation: ensure all program statuses match the constraint
  const validStatuses = new Set(["active", "cuti", "lulus", "keluar"]);
  for (const sp of studentPrograms) {
    if (sp.status && !validStatuses.has(sp.status)) {
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

  // 3. Delete existing enrollments and insert replacements
  // Backup existing records in memory in case replacement fails
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

---

### 2.2 Program Variant Identifiers, Safe Deletion & FK Error Handling (A2, A3, A17)

#### 2.2.1 Upfront UUID Allocation for New Variants (A2)
In `src/app/admin/program/actions.ts`, ensure every variant in `variantsToUpsert` possesses a valid UUID before sending the payload to PostgREST:

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

// All variant IDs (both existing and newly created) are retained
const activeVariantIds = variantsToUpsert.map((v) => v.id);
```

#### 2.2.2 Deletion & FK Restrict Error Handling in `src/lib/programs.ts` (A3, A17)
In `updateProgramData`, handle variant deletion and check for foreign key constraint errors:

```typescript
export async function updateProgramData(
  id: string,
  programData: ProgramUpdate,
  variantsToUpsert: VariantInsert[],
  activeVariantIds: string[]
): Promise<{ success?: boolean; error?: { message: string } }> {
  const supabase = await createClient();

  // 1. Update program core data
  const { error: programError } = await supabase
    .from("programs")
    .update(programData)
    .eq("id", id);

  if (programError) {
    return { error: programError };
  }

  // 2. Upsert variants (all carry valid UUIDs)
  if (variantsToUpsert.length > 0) {
    const { error: variantError } = await supabase
      .from("program_variants")
      .upsert(variantsToUpsert);

    if (variantError) {
      return { error: variantError };
    }
  }

  // 3. Delete obsolete variants (variants that were removed in the UI)
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
            message: "Varian tidak dapat dihapus karena masih digunakan oleh murid aktif atau jadwal kelas. Nonaktifkan status varian jika tidak ingin digunakan.",
          },
        };
      }
      return { error: deleteError };
    }
  }

  return { success: true };
}
```

---

### 2.3 Teacher Provisioning Rollback & Junction Error Inspection (A18, A25)

#### 2.3.1 Compensating Rollback in `src/lib/gurus.ts:insertGuruProfile` (A25)
If profile creation or junction insertion fails after Auth user creation, delete the newly created auth user:

```typescript
export async function insertGuruProfile(data: CreateGuruProfileData) {
  const adminClient = createAdminClient();
  const {
    email,
    password,
    fullName,
    phone,
    birthDate,
    branchId,
    branchIds,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
    allowances,
    minimumIncome,
    programs,
  } = data;

  const effectivePrimaryBranch = branchId || (branchIds && branchIds.length > 0 ? branchIds[0] : null);
  const effectiveBranchIds = branchIds && branchIds.length > 0 ? branchIds : (branchId ? [branchId] : []);

  // 1. Create auth user with service role
  const { data: userData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "guru",
    },
  });

  if (authError || !userData.user) {
    const msg = authError?.message || "";
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("exists")) {
      throw new Error("Email ini sudah terdaftar sebagai pengguna.");
    }
    throw new Error(msg || "Gagal membuat akun autentikasi guru.");
  }

  const newUserId = userData.user.id;

  try {
    // 2. Insert profile record
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: newUserId,
      full_name: fullName,
      phone,
      birth_date: birthDate,
      role: "guru",
      branch_id: effectivePrimaryBranch,
      is_active: true,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      allowances: allowances as Json[] | undefined,
      minimum_income: minimumIncome,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw new Error(`Gagal mengisi data profil: ${profileError.message}`);
    }

    // 3. Assign profile_branches junction
    if (effectiveBranchIds.length > 0) {
      const { error: branchJunctionError } = await adminClient
        .from("profile_branches")
        .insert(
          effectiveBranchIds.map((bId) => ({
            profile_id: newUserId,
            branch_id: bId,
            is_primary: bId === effectivePrimaryBranch,
          }))
        );

      if (branchJunctionError) {
        throw new Error(`Gagal menetapkan cabang penugasan: ${branchJunctionError.message}`);
      }
    }

    // 4. Assign profile_programs junction
    if (programs && programs.length > 0) {
      const { error: programJunctionError } = await adminClient
        .from("profile_programs")
        .insert(
          programs.map((pid: string) => ({
            profile_id: newUserId,
            program_id: pid,
          }))
        );

      if (programJunctionError) {
        throw new Error(`Gagal menetapkan program ajar: ${programJunctionError.message}`);
      }
    }

    return { success: true, userId: newUserId };
  } catch (error) {
    // Compensating rollback: delete orphan auth user so email is freed for retry
    await adminClient.auth.admin.deleteUser(newUserId);
    throw error;
  }
}
```

#### 2.3.2 Explicit Error Handling in `src/lib/gurus.ts:updateGuruProfile` (A18)
Remove passive `try/catch` and inspect `{ error }` on junction operations:

```typescript
// Update profile_branches junction
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

---

### 2.4 Removal of Obsolete Destructive Script (O2)

Delete `seed-variants.mjs` from the repository root. Ensure no build script, CI action, or package script references it.

---

## 3. Test Strategy & Acceptance Criteria

### 3.1 Automated Vitest Test Suites
1. **`tests/crud/student-enrollment-sync.test.ts`**:
   - Verify `updateStudentData` accepts all 4 valid statuses (`active`, `cuti`, `lulus`, `keluar`).
   - Verify `updateStudentData` rejects invalid status strings without deleting existing records.
   - Verify compensating restore is triggered when new junction insert fails.
2. **`tests/crud/program-variant-sync.test.ts`**:
   - Verify `updateProgram` generates valid UUIDs for `new-*` variants.
   - Verify `updateProgramData` handles replacing all old variants without deleting the new ones.
   - Verify foreign key restrict errors on variant deletion return user-friendly error message.
3. **`tests/crud/guru-provisioning-rollback.test.ts`**:
   - Verify `insertGuruProfile` triggers `deleteUser(newUserId)` when profile upsert fails.
   - Verify `updateGuruProfile` throws when `profile_branches` insert/delete returns an error.
4. **`tests/components/student-form-status.test.tsx`**:
   - Verify `StudentForm` renders the 4 canonical status options in the program dropdown.

### 3.2 Definition of Done for Phase 2
- [ ] Canonical enrollment status used across form, actions, and detail page.
- [ ] Student enrollments never lost during edit failures.
- [ ] Program variant edits cleanly support adding new variants alongside existing ones.
- [ ] Attempting to delete in-use program variants returns clear explanatory error.
- [ ] Failed guru creation cleans up the auth account immediately.
- [ ] `seed-variants.mjs` removed from root.
- [ ] `./init.sh` succeeds with 0 lint errors, 100% tests passing, and clean production build.
