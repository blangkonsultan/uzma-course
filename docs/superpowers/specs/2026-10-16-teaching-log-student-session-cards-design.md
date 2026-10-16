# Technical Specification: Teaching Log & Student Session Cards

- **Date:** 2026-10-16
- **Status:** Draft for Review
- **Target Feature:** `feat-009` — Phase 2b ERP Teaching Log & Student Session Cards
- **Dependencies:** `feat-005` Master Data Murid, `feat-008` Teacher Presence & Geolocation
- **Primary Users:** Guru; admin read policy reserved for payroll/readback
- **Related Business Spec:** `docs/rumus-gaji-guru.md`

---

## 1. Context and Goal

Uzma Course already has active weekly `schedule_classes`, student placements, and teacher attendance. The teacher still lacks a digital card for recording what happened in each scheduled class. This feature creates an auditable, session-based teaching log:

1. A teacher opens a scheduled class from `/guru/jadwal`.
2. The system loads one card row per placed student for a selected WIB date.
3. The teacher records each student's attendance status, achievement, and notes.
4. The system snapshots the current `program_variants.teacher_fee` per student row.
5. The teacher saves a draft or submits the card. Submitted cards are read-only to the teacher.
6. Future payroll can calculate fee from historical child rows without reading a mutable master fee.

The scope is intentionally limited to session cards. No competency master, payroll calculation, SPP billing, offline teaching-log queue, or admin UI is added in this feature.

---

## 2. Approved Architectural Decisions

### 2.1 Normalized parent/child model

Use two relational tables instead of a JSON payload or a denormalized per-student table:

- `teaching_sessions`: one row per `schedule_class` and calendar date.
- `teaching_session_students`: one row per placed student in a teaching session.

This preserves class-level lifecycle state, supports FK validation and RLS, and provides payroll-ready rows.

### 2.2 Fee unit and snapshot rule

`teacher_fee_snapshot` is stored on each student child row. It is the base fee in the same unit as `program_variants.teacher_fee`.

- `present`: payroll may count the full snapshot.
- `absent`, `excused`, or `cancelled`: payroll may count zero or a later policy-specific amount; this feature does not calculate payroll.
- Creating a child row reads the current variant fee server-side.
- Updating a draft never overwrites an existing child snapshot.
- A submitted card cannot be changed by a teacher.

### 2.3 Session lifecycle

- `draft`: teacher may save and continue editing.
- `submitted`: all students have a non-null attendance status; teacher read access remains, mutations are rejected.
- Admin policies permit future correction/readback without adding an admin screen now.

### 2.4 Date and schedule rules

- Date interpretation is canonical `Asia/Jakarta` / WIB.
- A teaching session date MUST NOT be in the future relative to the WIB database date.
- The ISO weekday of `session_date` MUST match `schedule_classes.day_of_week`.
- The source class MUST belong to the authenticated teacher and an active schedule draft when creating or saving a draft.
- Existing submitted sessions remain readable if the schedule draft later changes state.

---

## 3. Data Model

### 3.1 `teaching_sessions`

Required columns:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `schedule_class_id UUID NOT NULL REFERENCES public.schedule_classes(id) ON DELETE RESTRICT`
- `teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT`
- `branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT`
- `shift_id UUID NOT NULL REFERENCES public.branch_shifts(id) ON DELETE RESTRICT`
- `variant_id UUID NOT NULL REFERENCES public.program_variants(id) ON DELETE RESTRICT`
- `session_date DATE NOT NULL`
- `scheduled_start_time TIME NOT NULL`
- `scheduled_end_time TIME NOT NULL`
- `status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted'))`
- `submitted_at TIMESTAMPTZ NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Constraints and indexes:

- `UNIQUE (schedule_class_id, session_date)`
- Index `(teacher_id, session_date DESC)`
- Index `(schedule_class_id, session_date DESC)`
- `CHECK ((status = 'draft' AND submitted_at IS NULL) OR (status = 'submitted' AND submitted_at IS NOT NULL))`

The schedule/branch/shift/variant columns are immutable snapshots copied from the source class at first creation. Restricting deletion protects audit history; master records should be deactivated instead of hard-deleted when logs exist.

### 3.2 `teaching_session_students`

Required columns:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `session_id UUID NOT NULL REFERENCES public.teaching_sessions(id) ON DELETE CASCADE`
- `student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT`
- `attendance_status TEXT NULL CHECK (attendance_status IS NULL OR attendance_status IN ('present', 'absent', 'excused', 'cancelled'))`
- `achievement TEXT NULL`
- `teacher_note TEXT NULL`
- `teacher_fee_snapshot INTEGER NOT NULL CHECK (teacher_fee_snapshot >= 0)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

Constraints and indexes:

- `UNIQUE (session_id, student_id)`
- Index `(student_id, session_id)` for student history.
- Draft child rows may have a null `attendance_status`; submit requires every child row to have a status.

### 3.3 Transactional save RPC

The migration creates an invoker-safe Postgres function with this logical contract:

```text
save_teaching_session(
  p_schedule_class_id UUID,
  p_session_date DATE,
  p_students JSONB
) -> teaching_sessions
```

Each JSON student item contains only:

```json
{
  "student_id": "uuid",
  "attendance_status": "present | absent | excused | cancelled | null",
  "achievement": "text | null",
  "teacher_note": "text | null"
}
```

The function MUST:

1. Resolve the authenticated teacher using `auth.uid()`.
2. Resolve the class, active draft, branch, shift, variant, and current placements.
3. Reject a class not owned by the authenticated teacher.
4. Reject future dates and weekday mismatches.
5. Reject duplicate or foreign student IDs.
6. Require exactly the current placement set for the class.
7. Insert the parent snapshot once, or lock and reuse the existing draft.
8. Insert missing child rows with the current `teacher_fee` and update only editable fields on existing rows.
9. Reject writes to a submitted session for a teacher.
10. Return the persisted draft parent row.

The save RPC is the transaction boundary for draft writes; the application MUST NOT emulate this multi-table write with independent client-side mutations.

### 3.4 Transactional submit RPC

The migration also creates:

```text
submit_teaching_session(
  p_session_id UUID
) -> teaching_sessions
```

The submit function MUST:

1. Lock the target session row.
2. Resolve and authorize the authenticated teacher.
3. Reject sessions already submitted or owned by another teacher.
4. Reject any child row whose `attendance_status` is null.
5. Atomically set `status = 'submitted'` and `submitted_at = now()`.
6. Return the submitted parent row.

Both RPCs are invoker-safe and run inside the database transaction boundary. The application MUST NOT emulate either transition with independent client-side mutations.

---

## 4. Authorization and Data Access

### 4.1 RLS policies

`teaching_sessions`:

- Admin: full access through `public.is_admin()`.
- Guru SELECT: `teacher_id = auth.uid()`.
- Guru INSERT: `teacher_id = auth.uid()`.
- Guru UPDATE: own rows with `status = 'draft'` only.
- Guru DELETE: none; logs are append/audit records.

`teaching_session_students`:

- Admin: full access through `public.is_admin()`.
- Guru SELECT: child belongs to a session where `teacher_id = auth.uid()`.
- Guru INSERT/UPDATE: child belongs to the teacher's draft session.
- Guru DELETE: none; the RPC manages the exact child set.

### 4.2 DAL

Create `src/lib/teaching-logs.ts` with typed operations:

- `getTeacherScheduleClassForLog(teacherId, scheduleClassId)` — returns class metadata and current student placements.
- `getTeacherTeachingSession(teacherId, scheduleClassId, sessionDate)` — returns the parent and child rows or null.
- `saveTeacherTeachingSession(teacherId, input)` — invokes the transactional RPC after action-level shape validation.
- `submitTeacherTeachingSession(teacherId, sessionId)` invokes `submit_teaching_session(p_session_id)` and returns the locked parent row.

The DAL owns all Supabase queries and maps database failures to explicit domain errors. UI components MUST NOT call Supabase directly.

### 4.3 Server actions

Create `src/app/guru/mengajar/actions.ts`:

- `saveTeachingSession(input)` calls `requireGuruAction()` and the DAL.
- `submitTeachingSession(sessionId)` calls `requireGuruAction()` and the DAL.
- Both actions reject malformed IDs/statuses before invoking the DAL and return `{ data?, error? }` in the existing server-action style.

---

## 5. Teacher Workflow and UI

### 5.1 Entry point

Extend `src/components/guru/teacher-schedule-client.tsx` with an accessible, mobile-sized link/button on each class card:

```text
Isi Kartu Mengajar
```

The link targets `/guru/mengajar/[scheduleClassId]` and defaults to today's WIB date.

### 5.2 Route

Create `src/app/guru/mengajar/[id]/page.tsx`:

1. `await requireGuruPage()`.
2. Load the teacher-owned class and placements through the DAL.
3. Load the selected date from `searchParams.date` or use today's WIB date.
4. Load an existing teaching session for that class/date.
5. Render a server-provided form model into a client component.

Invalid ownership or invalid schedule class returns `notFound()` rather than exposing another teacher's data.

### 5.3 Form component

Create `src/components/guru/teaching-log-form.tsx`:

- Header: branch, shift, program, variant, scheduled time, selected date.
- Date input: mobile-friendly `text-base sm:text-sm`; disallow future dates in UI, with server validation as authority.
- One card per placed student.
- Per student controls:
  - status selector/buttons: Hadir, Tidak Hadir, Izin, Cancel
  - achievement textarea
  - teacher-note textarea
  - read-only fee snapshot when persisted
- Draft and submit actions use `useTransition`, show pending state, and display server errors.
- Submitted sessions render fields read-only and clearly show `Submitted` status.
- Action controls retain minimum 44px touch targets and no horizontal overflow at 360px/375px.

No offline queue is introduced in this scope. A network failure returns a visible error and preserves the local form state for retry.

---

## 6. Testing Strategy

### 6.1 Schema and security tests

Create `tests/security/teaching-log-migration-schema.test.ts` covering:

- migration exists and creates both tables;
- unique `(schedule_class_id, session_date)` and `(session_id, student_id)` constraints;
- status CHECK constraints and fee non-negative constraint;
- RLS/policy statements for teacher ownership and admin access;
- transactional save function name and guarded submit behavior are present.

### 6.2 Domain validation tests

Create `tests/crud/teaching-log-validation.test.ts` for observable validation behavior:

- WIB future date rejected;
- weekday mismatch rejected;
- duplicate/foreign student IDs rejected;
- draft accepts null statuses but submit rejects incomplete rows;
- existing fee snapshot is preserved on draft update;
- submitted session rejects teacher mutation.

### 6.3 UI tests

Create `tests/components/teaching-log-form.test.tsx` covering:

- one row renders per placed student;
- status changes are isolated to the selected student;
- draft save exposes pending/error state without discarding entered notes;
- submit transitions the form to read-only;
- submitted data cannot render editable controls;
- action bars remain usable at mobile layout widths.

Extend schedule component tests to verify the Teaching Log entry action is present for each scheduled class.

### 6.4 Manual smoke

After implementation:

- Run `./init.sh`.
- Use the real `/guru/jadwal` → `/guru/mengajar/[id]` path with the configured guru account.
- Verify draft save, reload, submit, and read-only reload.
- Verify at 360px, 375px, and 1280px with zero horizontal overflow.

---

## 7. Definition of Done

- [ ] `feat-009` can create, edit, reload, submit, and read a per-session/per-student teaching card.
- [ ] Server-side authorization prevents cross-teacher class/session access.
- [ ] Submitted sessions are immutable to teachers.
- [ ] Historical fee snapshots survive master fee changes and are queryable for `feat-010`.
- [ ] All schema changes are in a versioned Supabase migration.
- [ ] DAL boundary is respected; no raw database query in UI components.
- [ ] Targeted tests and full `./init.sh` pass.
- [ ] Responsive smoke passes at 360px, 375px, and 1280px.
- [ ] Progress, handoff, and `feature_list.json` contain evidence.
