# Teaching Log & Student Session Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an auditable per-class/per-student teaching card that teachers can draft and submit from the mobile schedule workflow, with immutable fee snapshots for future payroll.

**Architecture:** Add normalized `teaching_sessions` and `teaching_session_students` tables with RLS and two invoker-safe Postgres RPCs: one atomic draft save and one atomic submit transition. Keep all server reads/writes in a new `src/lib/teaching-logs.ts` DAL, expose mutations through authenticated guru Server Actions, and render the workflow at `/guru/mengajar/[id]` with a client form linked from each scheduled class.

**Tech Stack:** Next.js 16.3.7 App Router, React 19.2.8, TypeScript, Supabase/Postgres migrations and RPC, Tailwind CSS v4, Vitest 5, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-16-teaching-log-student-session-cards-design.md`

## Global Constraints

- Date interpretation MUST use canonical `Asia/Jakarta` / WIB.
- A teaching session date MUST NOT be in the future relative to the WIB database date, and its ISO weekday MUST match `schedule_classes.day_of_week`.
- The source class MUST belong to the authenticated teacher and an active schedule draft when creating or saving a draft.
- `teacher_fee_snapshot` MUST be read server-side and MUST NOT be overwritten on draft updates.
- Submitted sessions MUST be immutable to teachers.
- All schema changes MUST be in a versioned Supabase migration.
- UI components MUST NOT call Supabase directly; all database access belongs in `src/lib/teaching-logs.ts`.
- No offline teaching-log queue, competency master, payroll calculation, SPP billing, or admin UI is added in this feature.
- Form inputs MUST use `text-base sm:text-sm`; interactive controls MUST retain mobile touch targets and zero horizontal overflow.
- No new third-party dependency.

## Review Focus

- A teacher attempting another teacher's class/session must be rejected by both Server Action authorization and database/RPC ownership checks.
- Future dates, weekday mismatches, duplicate/foreign student IDs, and incomplete submit payloads must fail without partial writes.
- Existing `teacher_fee_snapshot` values must survive later master-fee edits and draft saves.
- A submitted session must remain readable but reject teacher mutations.
- The form must preserve entered notes on save errors and remain usable at 360px/375px without horizontal overflow.

---

### Task 1: Teaching Log schema, RPCs, types, and migration security

**Files:**
- Create: `supabase/migrations/20261016120000_create_teaching_logs.sql`
- Modify: `src/types/database.ts` to add `teaching_sessions`, `teaching_session_students`, and RPC signatures
- Create: `tests/security/teaching-log-migration-schema.test.ts`

**Interfaces:**
- Produces tables `teaching_sessions` and `teaching_session_students` with the exact columns, constraints, indexes, FKs, and status values from the spec.
- Produces RPCs `save_teaching_session(p_schedule_class_id uuid, p_session_date date, p_students jsonb)` and `submit_teaching_session(p_session_id uuid)` returning the persisted parent row.
- Produces RLS policies for admin full access and teacher ownership/draft-only mutation.

- [ ] **Step 1: Write failing migration/schema tests**
  - Assert the migration file exists and contains both table definitions, both unique constraints, non-negative fee/status constraints, `submitted_at` consistency, RLS enablement, teacher/admin policies, and both RPC names.
  - Assert `src/types/database.ts` exposes row/insert/update types for both tables and RPC argument/return contracts.

- [ ] **Step 2: Run the focused schema test to verify failure**
  - Run: `npx vitest run tests/security/teaching-log-migration-schema.test.ts --coverage.enabled=false`
  - Expected: FAIL because the migration and generated type entries do not exist.

- [ ] **Step 3: Implement the migration and generated type additions**
  - Create both tables with `ON DELETE RESTRICT` history FKs, `UNIQUE (schedule_class_id, session_date)`, `UNIQUE (session_id, student_id)`, indexes, timestamp trigger wiring, and RLS.
  - Implement invoker-safe `save_teaching_session` with `auth.uid()` ownership, active-draft lookup, WIB date/weekday checks, exact placement-set validation, draft-only write protection, server-side fee snapshot insertion, and atomic child upserts.
  - Implement invoker-safe `submit_teaching_session` with row locking, teacher ownership, non-null child-status validation, and atomic submitted transition.
  - Add the matching `Database` table and `Functions` type contracts to `src/types/database.ts` using the repository's current generated-type style.

- [ ] **Step 4: Run the schema tests to verify the migration contract**
  - Run: `npx vitest run tests/security/teaching-log-migration-schema.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 5: Commit the schema task**
  - Run: `git add supabase/migrations/20261016120000_create_teaching_logs.sql src/types/database.ts tests/security/teaching-log-migration-schema.test.ts && git commit -m "feat: add Teaching Log schema and RPCs"`

### Task 2: Teaching Log domain validation, DAL, and guru Server Actions

**Files:**
- Create: `src/lib/teaching-logs.ts`
- Create: `src/app/guru/mengajar/actions.ts`
- Create: `tests/crud/teaching-log-validation.test.ts`
- Create: `tests/crud/teaching-log-dal.test.ts`
- Create: `tests/crud/teaching-log-actions.test.ts`

**Interfaces:**
- `TeachingAttendanceStatus = "present" | "absent" | "excused" | "cancelled"`.
- `TeachingSessionStudentInput = { student_id: string; attendance_status: TeachingAttendanceStatus | null; achievement: string | null; teacher_note: string | null }`.
- `SaveTeacherTeachingSessionInput = { schedule_class_id: string; session_date: string; students: TeachingSessionStudentInput[] }`.
- `validateTeachingSessionInput(input, expectedDayOfWeek, todayWib): { error?: string }`.
- `getTeacherScheduleClassForLog(teacherId, scheduleClassId)`.
- `getTeacherTeachingSession(teacherId, scheduleClassId, sessionDate)`.
- `saveTeacherTeachingSession(teacherId, input)`.
- `submitTeacherTeachingSession(teacherId, sessionId)`.
- Server Actions `saveTeachingSession(input)` and `submitTeachingSession(sessionId)` return `{ data?: ..., error?: string }` and call `requireGuruAction()`.

- [ ] **Step 1: Write failing validation and DAL/action tests**
  - Test deterministic validation for future WIB dates, weekday mismatch, duplicate student IDs, malformed statuses, and draft-vs-submit completeness.
  - Test that existing fee snapshot data is treated as server-owned and not accepted from client input.
  - Test action authorization failure rejects before DAL mutation and DAL maps RPC failures to explicit errors.
  - Mock only unavoidable auth/Supabase boundaries; assert consumer-visible errors and returned data, not mock call forwarding.

- [ ] **Step 2: Run focused tests to verify failure**
  - Run: `npx vitest run tests/crud/teaching-log-validation.test.ts tests/crud/teaching-log-dal.test.ts tests/crud/teaching-log-actions.test.ts --coverage.enabled=false`

- [ ] **Step 3: Implement validation and DAL**
  - Implement pure input/date validation with injected `todayWib` for deterministic tests.
  - Implement teacher-owned class/placement/session reads through `createClient()` and the existing Supabase relation patterns.
  - Implement `saveTeacherTeachingSession` as an RPC call to `save_teaching_session`; do not send fee values from the client.
  - Implement `submitTeacherTeachingSession` as an RPC call to `submit_teaching_session`.

- [ ] **Step 4: Implement guru Server Actions**
  - Call `requireGuruAction()` in both actions, validate IDs and input shape, invoke the DAL with the authenticated profile ID, and return explicit Indonesian error messages without swallowing exceptions.

- [ ] **Step 5: Run focused tests to verify green**
  - Run: `npx vitest run tests/crud/teaching-log-validation.test.ts tests/crud/teaching-log-dal.test.ts --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 6: Commit the DAL/action task**
  - Run: `git add src/lib/teaching-logs.ts src/app/guru/mengajar/actions.ts tests/crud/teaching-log-validation.test.ts tests/crud/teaching-log-dal.test.ts && git commit -m "feat: add Teaching Log DAL and guru actions"`

### Task 3: Teacher Teaching Log route and form workflow

**Files:**
- Create: `src/app/guru/mengajar/[id]/page.tsx`
- Create: `src/components/guru/teaching-log-form.tsx`
- Modify: `src/components/guru/teacher-schedule-client.tsx` to add the entry link
- Create: `tests/components/teaching-log-form.test.tsx`
- Create: `tests/pages/teaching-log-page.test.tsx`

**Interfaces:**
- Route params: `params: Promise<{ id: string }>` and `searchParams: Promise<{ date?: string }>`.
- Form props include the teacher-owned class metadata, selected WIB date, existing session, and placed students.
- Form calls `saveTeachingSession(input)` for drafts and `submitTeachingSession(sessionId)` for submit.

- [ ] **Step 1: Write failing component tests**
  - Assert one student card renders per placement with status controls, achievement, note, and fee display.
  - Assert status changes are isolated to the selected student.
  - Assert save errors preserve entered form values and show an error state.
  - Assert submitted data renders read-only fields and no editable submit controls.
  - Assert every schedule class card renders an accessible `Isi Kartu Mengajar` link.

- [ ] **Step 2: Run focused component tests to verify failure**
  - Run: `npx vitest run tests/components/teaching-log-form.test.tsx tests/components/teacher-schedule-client.test.tsx tests/pages/teaching-log-page.test.tsx --coverage.enabled=false`
  - Expected: FAIL because the route/form/link do not exist.

- [ ] **Step 3: Implement the route and loader**
  - Require guru access, load the teacher-owned class and placements through the DAL, resolve the selected date or today's WIB date, load an existing session, and call `notFound()` for unauthorized/unknown class IDs.

- [ ] **Step 4: Implement the client form**
  - Render metadata and one responsive card per student.
  - Use mobile-safe `text-base sm:text-sm` inputs, 44px action targets, `useTransition`, explicit pending/error states, draft save, and submit locking.
  - Preserve local form state after failed mutations; show read-only submitted state.
  - Do not implement an offline queue.

- [ ] **Step 5: Add the schedule entry link**
  - Add a mobile-sized link/button on each existing class card without changing schedule filtering or student accordion behavior.

- [ ] **Step 6: Run focused component tests to verify green**
  - Run: `npx vitest run tests/components/teaching-log-form.test.tsx tests/components/teacher-schedule-client.test.tsx tests/pages/teaching-log-page.test.tsx --coverage.enabled=false`
  - Expected: PASS.

- [ ] **Step 7: Commit the teacher workflow task**
  - Run: `git add src/app/guru/mengajar/[id]/page.tsx src/components/guru/teaching-log-form.tsx src/components/guru/teacher-schedule-client.tsx tests/components/teaching-log-form.test.tsx tests/components/teacher-schedule-client.test.tsx tests/pages/teaching-log-page.test.tsx && git commit -m "feat: add teacher Teaching Log workflow"`

### Task 4: Full verification, smoke checks, and feature artifacts

**Files:**
- Modify: `progress.md`
- Modify: `session-handoff.md`
- Modify: `feature_list.json`

**Interfaces:**
- Consumes the completed schema, DAL/actions, route, and form from Tasks 1–3.
- Produces an evidence-backed completed `feat-009` and a restartable repository.

- [ ] **Step 1: Run the full verification harness**
  - Run: `./init.sh`
  - Expected: zero lint errors/warnings, all Vitest suites pass above thresholds, and clean Webpack production build.

- [ ] **Step 2: Run the real guru workflow smoke**
  - Start the dev server and use `/guru/jadwal` → `/guru/mengajar/[id]` with the configured guru account.
  - Verify draft save, reload, submit, and read-only reload.
  - Verify 360px, 375px, and 1280px with zero horizontal overflow and no clipped action controls.

- [ ] **Step 3: Update feature artifacts**
  - Mark `feat-009` completed only after the end-to-end workflow and verification pass.
  - Record migration, DAL/action, route/form, tests, suite count, coverage, build, and responsive evidence in `feature_list.json`, `progress.md`, and `session-handoff.md`.
  - Leave `feat-010` not started; its payroll implementation consumes the stored fee snapshots.

- [ ] **Step 4: Commit verification artifacts**
  - Run: `git diff --check && git status --short`
  - Expected: only intended documentation changes remain before commit.
  - Commit: `git add progress.md session-handoff.md feature_list.json && git commit -m "docs: record Teaching Log completion"`
