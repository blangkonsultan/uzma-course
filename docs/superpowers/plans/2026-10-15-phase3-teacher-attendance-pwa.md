# Phase 3: Teacher Attendance Lifecycle & PWA Offline Session Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement shift-aware attendance tracking, server-side geofence validation, resilient offline queue synchronization with targeted check-out, and canonical WIB timezone normalization.

**Architecture:** 
1. Database migration adding `shift_id` to `teacher_attendances` with session indexes, paired with deterministic client-generated UUIDs for idempotent upsert.
2. Server-side validation boundary in `processOnlineCheckIn` enforcing branch coordinates radius via Haversine and throwing on database mutation errors.
3. IndexedDB PWA queue modernization in `src/lib/pwa/db.ts` replacing `Promise.withResolvers` with standard `new Promise`, resolving on `transaction.oncomplete`, and matching offline checkout to `record.attendance_id`.
4. Canonical `Asia/Jakarta` date/weekday calculations across server and DAL, single-flight sync guard, GPS unmount cleanup, and responsive mobile toast geometry.

**Tech Stack:** Next.js 16 (Webpack build), TypeScript, Supabase PostgreSQL, IndexedDB PWA, Vitest, React 19.

**Spec:** `docs/superpowers/specs/2026-10-15-phase3-teacher-attendance-pwa-design.md`

## Global Constraints

- Never expose, hardcode, or invent credentials/secrets in code, tests, or documentation.
- Maintain existing DAL abstraction: UI components must call `src/lib/` services rather than issuing direct Supabase queries.
- Zero data loss: Offline queues in IndexedDB (`attendance_queue`) must only be removed upon confirmed server acknowledgement (`results.success`).
- Strict error checking: Database mutation rejections must throw and propagate instead of returning false success.
- Canonical timezone: All business date calculations and day-of-week boundaries must explicitly compute in `Asia/Jakarta` (WIB).

## Review Focus

The five input classes or failure modes the spec implies that are most likely to bite users or teachers:
1. Teacher checking in during early morning hours (00:00–06:59 WIB) on a UTC server -> correctly computes today's WIB date and weekday without showing false "Hari Ini Libur".
2. Check-out performed offline on Day 1 and synced on Day 2 -> updates Day 1's attendance record via `record.attendance_id` rather than searching current date.
3. Offline queue sync attempted on an intermittent network where request fails -> failed records remain in IndexedDB and sync loop does not fire infinitely.
4. Check-in attempted outside the branch geofence radius -> rejected by server action with clear distance error message.
5. Toast notification triggered on a 360px mobile screen -> positioned above bottom navigation bar without left edge clipping.

---

### Task 1: Timezone Normalization (WIB) & Database Migration for `shift_id` (G4, G10)

**Files:**
- Create: `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql`
- Modify: `src/lib/attendances.ts`
- Test: `tests/utils/wib-timezone.test.ts`
- Test: `tests/security/attendance-migration-schema.test.ts`

**Interfaces:**
- Produces: `getWIBDateBounds(targetDate?: Date): { dateString: string; startOfDay: string; endOfDay: string; dayOfWeek: number }` in `src/lib/attendances.ts`
- Database: Column `shift_id` on table `public.teacher_attendances`

- [ ] **Step 1: Write failing tests for `getWIBDateBounds` and migration schema**

Create `tests/utils/wib-timezone.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { getWIBDateBounds } from "@/lib/attendances";

describe("getWIBDateBounds", () => {
  it("correctly calculates WIB date and weekday for UTC early morning timestamps", () => {
    // 2026-10-14 23:30:00 UTC is 2026-10-15 06:30:00 WIB (Thursday)
    const utcEarlyMorning = new Date("2026-10-14T23:30:00.000Z");
    const bounds = getWIBDateBounds(utcEarlyMorning);

    expect(bounds.dateString).toBe("2026-10-15");
    expect(bounds.dayOfWeek).toBe(4); // Thursday (1=Mon .. 7=Sun)
    expect(bounds.startOfDay).toBe("2026-10-14T17:00:00.000Z"); // 00:00:00 WIB in UTC
    expect(bounds.endOfDay).toBe("2026-10-15T16:59:59.999Z"); // 23:59:59.999 WIB in UTC
  });

  it("maps Sunday to dayOfWeek 7 in WIB", () => {
    // 2026-10-18 03:00:00 UTC is Sunday 10:00:00 WIB
    const sundayWIB = new Date("2026-10-18T03:00:00.000Z");
    const bounds = getWIBDateBounds(sundayWIB);

    expect(bounds.dateString).toBe("2026-10-18");
    expect(bounds.dayOfWeek).toBe(7);
  });
});
```

Create `tests/security/attendance-migration-schema.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

describe("Phase 3 Attendance Migration Script", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql"
  );

  it("migration file exists", () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it("adds shift_id column referencing branch_shifts", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.teacher_attendances");
    expect(sql).toContain("ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.branch_shifts(id)");
  });

  it("creates composite index for session queries", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("CREATE INDEX IF NOT EXISTS idx_teacher_attendances_session");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/utils/wib-timezone.test.ts tests/security/attendance-migration-schema.test.ts --coverage=false`
Expected: FAIL (`getWIBDateBounds is not defined` and migration file missing).

- [ ] **Step 3: Implement `getWIBDateBounds` in `src/lib/attendances.ts`**

In `src/lib/attendances.ts`, export `getWIBDateBounds`:
```typescript
export function getWIBDateBounds(targetDate: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(targetDate);
  const startOfDay = new Date(`${dateString}T00:00:00+07:00`).toISOString();
  const endOfDay = new Date(`${dateString}T23:59:59.999+07:00`).toISOString();

  const nowWIB = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const rawDay = nowWIB.getDay();
  const dayOfWeek = rawDay === 0 ? 7 : rawDay;

  return { dateString, startOfDay, endOfDay, dayOfWeek };
}
```

- [ ] **Step 4: Create migration file `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql`**

Create `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql`:
```sql
-- Phase 3: Add shift_id to teacher_attendances for per-shift attendance support
ALTER TABLE public.teacher_attendances
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.branch_shifts(id) ON DELETE SET NULL;

-- Composite index for quick session queries
CREATE INDEX IF NOT EXISTS idx_teacher_attendances_session
    ON public.teacher_attendances(teacher_id, branch_id, shift_id, check_in_time);
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/utils/wib-timezone.test.ts tests/security/attendance-migration-schema.test.ts --coverage=false`
Expected: PASS (5 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/lib/attendances.ts supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql tests/utils/wib-timezone.test.ts tests/security/attendance-migration-schema.test.ts
git commit -m "feat(attendance): add getWIBDateBounds helper and database migration for shift_id"
```

---

### Task 2: Database Error Checking, Idempotent Upsert & Server-Side Geofence Validation (G1, G2, G5, G7)

**Files:**
- Modify: `src/lib/attendances.ts`
- Modify: `src/app/guru/absen/actions.ts`
- Test: `tests/crud/attendance-server-validation.test.ts`

**Interfaces:**
- Produces: `insertCheckIn(data: AttendanceRecord): Promise<AttendanceRecord>`
- Produces: `updateCheckOut(id: string, data: { check_out_time: string; check_out_lat: number; check_out_lng: number }): Promise<AttendanceRecord>`
- Produces: `processOnlineCheckIn(sessionId: string, branchId: string, shiftId: string, lat: number, lng: number, timestamp: string)`

- [ ] **Step 1: Write failing tests for database error propagation, idempotent upsert, and server geofence validation**

Create `tests/crud/attendance-server-validation.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertCheckIn, updateCheckOut } from "@/lib/attendances";
import { processOnlineCheckIn, processOnlineCheckOut } from "@/app/guru/absen/actions";
import { createClient } from "@/lib/supabase/server";
import { requireGuruAction } from "@/lib/auth";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requireGuruAction: vi.fn(),
}));

describe("Attendance Server Boundary Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("insertCheckIn throws error when database insertion fails", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "RLS violation" } }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      insertCheckIn({
        id: "session-1",
        teacher_id: "teacher-1",
        branch_id: "sumokembangsri",
        check_in_time: "2026-10-15T08:00:00Z",
        check_in_lat: -7.432,
        check_in_lng: 112.505,
      })
    ).rejects.toThrow("Gagal menyimpan presensi masuk");
  });

  it("updateCheckOut throws error when database update fails", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Row not found" } }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateCheckOut("attendance-1", {
        check_out_time: "2026-10-15T10:00:00Z",
        check_out_lat: -7.432,
        check_out_lng: 112.505,
      })
    ).rejects.toThrow("Gagal menyimpan presensi pulang");
  });

  it("processOnlineCheckIn rejects coordinates exceeding branch radius", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "user-1" },
      profile: { id: "teacher-1", role: "guru" } as never,
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "branches") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    latitude: -7.4320527,
                    longitude: 112.5054893,
                    radius_meters: 100,
                    is_active: true,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    // Far-away coordinates (e.g. 5km away)
    const farLat = -7.480;
    const farLng = 112.550;

    const result = await processOnlineCheckIn(
      "session-1",
      "sumokembangsri",
      "shift-1",
      farLat,
      farLng,
      "2026-10-15T08:00:00Z"
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("berada di luar radius cabang");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crud/attendance-server-validation.test.ts --coverage=false`
Expected: FAIL

- [ ] **Step 3: Update `insertCheckIn`, `updateCheckOut`, and `getTodayAttendance` in `src/lib/attendances.ts`**

Update `src/lib/attendances.ts`:
- `AttendanceRecord` accepts required `id: string` and optional `shift_id?: string | null`.
- `insertCheckIn` uses `.upsert({...}, { onConflict: "id", ignoreDuplicates: true })` and throws on error.
- `updateCheckOut` throws on error.
- `getTodayAttendance` accepts optional `shiftId?: string | null` and uses `getWIBDateBounds()`.

- [ ] **Step 4: Update `processOnlineCheckIn` and `processOnlineCheckOut` in `src/app/guru/absen/actions.ts`**

Update `src/app/guru/absen/actions.ts`:
- `processOnlineCheckIn` validates branch coordinates radius using `calculateDistance` from `@/lib/pwa/haversine` and invokes `insertCheckIn`.
- Return clean `{ success: true, data }` or `{ success: false, error }`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/crud/attendance-server-validation.test.ts --coverage=false`
Expected: PASS (3 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/lib/attendances.ts src/app/guru/absen/actions.ts tests/crud/attendance-server-validation.test.ts
git commit -m "fix(attendance): enforce server-side geofence validation and throw on database mutation errors"
```

---

### Task 3: Browser-Compatible Offline Storage & Targeted Offline Checkout (G3, G5, G8, G11, G12)

**Files:**
- Modify: `src/lib/pwa/db.ts`
- Modify: `src/app/guru/absen/actions.ts`
- Test: `tests/pwa/offline-queue-lifecycle.test.ts`

**Interfaces:**
- Produces: `PendingAttendance` with `attendance_id` in `src/lib/pwa/db.ts`
- Produces: `syncOfflineAttendances(records: PendingAttendance[])` in `src/app/guru/absen/actions.ts`

- [ ] **Step 1: Write failing tests for offline queue persistence and targeted checkout synchronization**

Create `tests/pwa/offline-queue-lifecycle.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncOfflineAttendances } from "@/app/guru/absen/actions";
import { insertCheckIn, updateCheckOut } from "@/lib/attendances";
import { requireGuruAction } from "@/lib/auth";
import type { PendingAttendance } from "@/lib/pwa/db";

vi.mock("@/lib/auth", () => ({
  requireGuruAction: vi.fn(),
}));

vi.mock("@/lib/attendances", () => ({
  insertCheckIn: vi.fn(),
  updateCheckOut: vi.fn(),
  getTodayAttendance: vi.fn(),
}));

describe("Offline Queue Synchronization Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips and preserves records that belong to a different teacher", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "teacher-1" },
      profile: { id: "teacher-1", role: "guru" } as never,
    });

    const otherTeacherRecord: PendingAttendance = {
      id: "queue-1",
      teacher_id: "teacher-2", // Different teacher
      branch_id: "sumokembangsri",
      type: "check_in",
      lat: -7.432,
      lng: 112.505,
      timestamp: "2026-10-14T08:00:00Z",
    };

    const result = await syncOfflineAttendances([otherTeacherRecord]);
    expect(result.success).toEqual([]);
    expect(result.failed).toEqual([]); // Preserved without acknowledging
    expect(insertCheckIn).not.toHaveBeenCalled();
  });

  it("synchronizes check-out using targeted attendance_id rather than current day lookup", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "teacher-1" },
      profile: { id: "teacher-1", role: "guru" } as never,
    });
    vi.mocked(updateCheckOut).mockResolvedValue({ id: "checkin-session-uuid" } as never);

    const yesterdayCheckoutRecord: PendingAttendance = {
      id: "checkout-queue-uuid",
      attendance_id: "checkin-session-uuid", // Targeted check-in session ID
      teacher_id: "teacher-1",
      branch_id: "sumokembangsri",
      type: "check_out",
      lat: -7.432,
      lng: 112.505,
      timestamp: "2026-10-14T12:00:00Z",
    };

    const result = await syncOfflineAttendances([yesterdayCheckoutRecord]);
    expect(result.success).toEqual(["checkout-queue-uuid"]);
    expect(updateCheckOut).toHaveBeenCalledWith("checkin-session-uuid", {
      check_out_time: "2026-10-14T12:00:00Z",
      check_out_lat: -7.432,
      check_out_lng: 112.505,
    });
  });

  it("marks records as failed when database insertion throws", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "teacher-1" },
      profile: { id: "teacher-1", role: "guru" } as never,
    });
    vi.mocked(insertCheckIn).mockRejectedValueOnce(new Error("Network disconnect"));

    const checkInRecord: PendingAttendance = {
      id: "queue-fail-1",
      teacher_id: "teacher-1",
      branch_id: "sumokembangsri",
      type: "check_in",
      lat: -7.432,
      lng: 112.505,
      timestamp: "2026-10-15T08:00:00Z",
    };

    const result = await syncOfflineAttendances([checkInRecord]);
    expect(result.success).toEqual([]);
    expect(result.failed).toEqual(["queue-fail-1"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pwa/offline-queue-lifecycle.test.ts --coverage=false`
Expected: FAIL

- [ ] **Step 3: Modernize `src/lib/pwa/db.ts` with standard Promise and `transaction.oncomplete`**

In `src/lib/pwa/db.ts`:
- Update `PendingAttendance` to include `attendance_id?: string | null` and `shift_id?: string | null`.
- Replace all `Promise.withResolvers` with `new Promise((resolve, reject) => { ... })`.
- Ensure `savePendingAttendance` resolves on `transaction.oncomplete`.

- [ ] **Step 4: Update `syncOfflineAttendances` in `src/app/guru/absen/actions.ts`**

In `syncOfflineAttendances`:
- Enforce `record.teacher_id === profile.id`.
- Replay check-out using `record.attendance_id || record.id`.
- Insert check-in passing `id: record.id` and `shift_id: record.shift_id`.
- Catch errors and push failed records to `results.failed`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/pwa/offline-queue-lifecycle.test.ts --coverage=false`
Expected: PASS (3 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/lib/pwa/db.ts src/app/guru/absen/actions.ts tests/pwa/offline-queue-lifecycle.test.ts
git commit -m "fix(pwa): standardize IndexedDB with native Promises and synchronize targeted offline checkouts"
```

---

### Task 4: Client Attendance State Resilience, Shift Status & GPS Cleanup (G6, G9, G13, G15-G19, G21)

**Files:**
- Modify: `src/app/guru/absen/page.tsx`
- Modify: `src/components/guru/attendance-client.tsx`
- Modify: `src/components/admin/toast.tsx`
- Test: `tests/components/toast-responsive.test.tsx`

**Interfaces:**
- UI: `AttendanceClient` renders per-shift attendance controls, cleans up GPS watchers, and prevents sync loops.
- UI: `Toast` renders with mobile-responsive positioning (`bottom-20 sm:bottom-5 left-4 right-4`).

- [ ] **Step 1: Write failing tests for responsive toast positioning**

Create `tests/components/toast-responsive.test.tsx`:
```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Toast, showToast } from "@/components/admin/toast";
import "@testing-library/jest-dom";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/guru/absen",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Toast Responsive Positioning", () => {
  it("renders with bottom-20 and horizontal mobile margins to avoid clipping and nav collision", () => {
    render(<Toast />);
    showToast("Presensi berhasil!", "success");

    const toastElement = screen.getByRole("status");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement.className).toContain("bottom-20");
    expect(toastElement.className).toContain("left-4");
    expect(toastElement.className).toContain("right-4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/toast-responsive.test.tsx --coverage=false`
Expected: FAIL because toast currently has `bottom-5 right-5` without `bottom-20 left-4`.

- [ ] **Step 3: Update `Toast` container geometry in `src/components/admin/toast.tsx`**

In `src/components/admin/toast.tsx:85`, update classes:
```tsx
className="fixed bottom-20 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 max-w-sm sm:w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
```

- [ ] **Step 4: Update `AttendanceClient` in `src/components/guru/attendance-client.tsx`**

In `src/components/guru/attendance-client.tsx`:
- Use `isSyncingRef = useRef(false)` in `attemptSync` to break circular callback updates and stop infinite sync loops.
- In `handleAttendance`, generate `sessionId = crypto.randomUUID()` for check-in and pass as first argument to `processOnlineCheckIn` and offline queue.
- Store `attendance_id: attendanceId` when queuing check-out.
- In `errorHandler` for GPS, clear `setCurrentCoords(null)` to prevent submitting stale location fixes.
- Wrap `executeWithCoords` in `try / finally` ensuring `setIsLoadingGPS(false)` is always called.
- Guard location retry callbacks with `isMountedRef`.

- [ ] **Step 5: Update `AbsenPage` in `src/app/guru/absen/page.tsx`**

In `src/app/guru/absen/page.tsx`:
- Use `getWIBDateBounds()` to calculate `dayOfWeek`.
- Check `scheduleError` and render error card with reload button instead of declaring "Hari Ini Libur".
- Guard empty `activeAssignedBranches` with an explanatory card instead of crashing.
- Re-sort `filteredShiftsMap` by `start_time` after applying teacher bounds.

- [ ] **Step 6: Run tests and verify they pass**

Run: `npx vitest run tests/components/toast-responsive.test.tsx --coverage=false`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/admin/toast.tsx src/components/guru/attendance-client.tsx src/app/guru/absen/page.tsx tests/components/toast-responsive.test.tsx
git commit -m "fix(guru): stabilize attendance client sync loop, GPS cleanup, and responsive toast positioning"
```

---

### Task 5: Full Verification Harness & Documentation Gate

**Files:**
- Modify: `progress.md`, `session-handoff.md`

- [ ] **Step 1: Run full unit test suite**

Run: `npm test`
Expected: 41 test suites passed, 100% tests passing, coverage exceeding all global thresholds.

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

Document Phase 3 implementation completion, automated test results, and next steps for Phase 4.

- [ ] **Step 6: Commit**

```bash
git add progress.md session-handoff.md
git commit -m "docs: record Phase 3 implementation completion and verification evidence"
```
