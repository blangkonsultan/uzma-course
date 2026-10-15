# Technical Specification: Phase 3 Teacher Attendance Lifecycle & PWA Offline Session Model

- **Date:** 2026-10-15
- **Status:** Draft for Review (Brainstorming Architectural Path)
- **Target Subsystem:** Teacher Attendance (`teacher_attendances`), PWA Offline Synchronization (`attendance_queue`), Geofence Server Enforcement, Timezone Normalization (WIB)
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Problem Statement

Following Phase 1 security hardening and Phase 2 master data CRUD integrity, Phase 3 addresses critical reliability and data integrity defects in the teacher mobile attendance and PWA offline synchronization pipeline identified during the technical audit on commit `17d3580`:

1. **G1 (P1): False Success Acknowledgment on Database Mutation Failures**
   - Files: `src/lib/attendances.ts:40-57`, `src/app/guru/absen/actions.ts:18-47`
   - Issue: `insertCheckIn` and `updateCheckOut` do not check for `{ error }` returned by Supabase or throw exceptions on database errors. Offline synchronization (`syncOfflineAttendances`) treats any resolved response as successful (`results.success.push(record.id)`), permanently deleting uncommitted queue records from IndexedDB. Online check-out similarly reports success even when no database row was updated.

2. **G2 (P1): Attendance Rules Enforced Only in Client UI, Not at Write Boundaries**
   - Files: `src/app/guru/absen/actions.ts:52-82`, `supabase/migrations/20261008031805_create_teacher_attendances.sql:27-34`
   - Issue: `processOnlineCheckIn` and `processOnlineCheckOut` verify only that the user has role `guru`, then immediately persist submitted `branchId`, `lat`, `lng`, and `timestamp` without verifying active teaching schedule eligibility or checking if coordinates lie within branch radius. The database RLS policy enforces only ownership (`auth.uid() = teacher_id`), allowing arbitrary branches or out-of-radius coordinates to be persisted via direct action requests.

3. **G3 (P1): Historical Offline Check-Out Targets Wrong Date/Record**
   - File: `src/app/guru/absen/actions.ts:29-37`
   - Issue: Replaying offline check-out calls `getTodayAttendance(record.teacher_id)`, which queries the server's current date rather than the date of the check-out event. When an offline teacher reconnects the next morning, the check-out from yesterday either permanently fails (no attendance today) or overwrites today's newly created morning attendance with yesterday's timestamp.

4. **G4 (P1): Attendance State Locks Across Daily Shifts (Not Per-Shift)**
   - Files: `src/app/guru/absen/page.tsx:103-125`, `src/components/guru/attendance-client.tsx:17-48`
   - Issue: Foundation specification `2026-10-02-master-data-foundation-design.md:66-70` specifies that teachers check in and out **per shift** (e.g. morning + afternoon shifts produce 4 events: In-Morning, Out-Morning, In-Afternoon, Out-Afternoon). Currently, the system manages a single global daily pair of `isCheckedIn`/`isCheckedOut` flags. After finishing the morning shift, the afternoon shift remains locked and disabled.

5. **G5 & G7 (P1 & P2): UUID Queue Mismatch & Non-Idempotent Replay**
   - Files: `src/components/guru/attendance-client.tsx:206-209`, `src/lib/attendances.ts:40-49`
   - Issue: The client assigns its local IndexedDB queue UUID to `attendanceId`, but `insertCheckIn` lets PostgreSQL generate a different UUID. A subsequent online checkout updates the nonexistent queue UUID. Furthermore, replaying attendance lacks an idempotency key, creating duplicate database rows when action responses are lost on intermittent networks.

6. **G8, G9, G10 (P2): Account Mixing, Infinite Sync Loops & Timezone Skew**
   - Files: `src/components/guru/attendance-client.tsx:178-244`, `src/lib/attendances.ts:19-25`, `src/app/guru/absen/page.tsx:34-36`
   - Issue: Queue restoration does not filter by `teacher_id`. If Teacher A logs out and Teacher B logs in on the same device, Teacher B inherits A's attendance state and attempts to sync A's records under B's session.
   - Callback identity changes when `isSyncing` updates cause an infinite re-sync loop on failed syncs.
   - Day of week and day bounds use server-local time. On UTC servers, early morning requests (00:00–06:59 WIB) calculate the previous day's weekday, erroneously displaying "Hari Ini Libur".

7. **G11 & G12 (P2): Modern Browser API Incompatibility & Premature IDB Commit**
   - File: `src/lib/pwa/db.ts:15-18, 44-46`
   - Issue: `Promise.withResolvers` is used without polyfill, breaking on Safari < 17.4 and older mobile browsers. `savePendingAttendance` resolves on `request.onsuccess` before the storage transaction commits (`transaction.oncomplete`), risking data loss if disk commit aborts.

8. **G21 (P2): Mobile Toast Layout Clipping & Bottom Nav Collision**
   - File: `src/components/admin/toast.tsx:85`, `src/app/guru/layout.tsx:27-28`
   - Issue: Fixed `right-5 max-w-sm w-full` toast pushes the left edge to `-20px` at 360px viewport, clipping content, and `bottom-5` collides with the fixed bottom navigation bar (`GuruBottomNav`).

---

## 2. Architectural Design & Specifications

```
+-------------------------------------------------------------------------------------------------------+
|                                      PHASE 3 ARCHITECTURE                                             |
+-------------------------------------------------------------------------------------------------------+
|                                                                                                       |
|  1. DATABASE BOUNDARY (Migration):                                                                    |
|     +---------------------------------------------------------------------------------------------+   |
|     |  ALTER TABLE teacher_attendances ADD COLUMN shift_id UUID REFERENCES branch_shifts(id)      |   |
|     |  CREATE INDEX idx_teacher_attendances_session ON teacher_attendances(teacher_id, shift_id, ..) |   |
|     |  DAL insertCheckIn: Accept client-generated UUID id with ON CONFLICT (id) DO NOTHING        |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  2. SERVER-SIDE BUSINESS VALIDATION BOUNDARY:                                                         |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/app/guru/absen/actions.ts: processOnlineCheckIn / processOnlineCheckOut                 |   |
|     |  - Fetch active branch coordinates; calculate Haversine distance <= branch.radius_meters    |   |
|     |  - Verify teacher has active class schedule in target shift today (WIB)                     |   |
|     |  - Throw and reject mutations explicitly on error; no false success acknowledgments         |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  3. PWA OFFLINE QUEUE & SESSION IDENTIFIER ALIGNMENT:                                                 |
|     +---------------------------------------------------------------------------------------------+   |
|     |  src/lib/pwa/db.ts & src/components/guru/attendance-client.tsx                              |   |
|     |  - Replace Promise.withResolvers with standard new Promise((resolve, reject) => ...)        |   |
|     |  - Confirm save on transaction.oncomplete instead of request.onsuccess                      |   |
|     |  - Check-in generates sessionId = crypto.randomUUID(), used in IDB AND database             |   |
|     |  - Check-out carries attendance_id = sessionId; sync matches exact original check-in        |   |
|     |  - Filter getPendingAttendances by current teacher_id; prevent cross-account queue leaks    |   |
|     |  - Use syncInProgressRef to prevent infinite re-sync loops                                  |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
|  4. TIMEZONE & UI RESILIENCE:                                                                         |
|     +---------------------------------------------------------------------------------------------+   |
|     |  - Explicit Asia/Jakarta date and weekday calculations across server and DAL                |   |
|     |  - Geolocation watch cleanup on unmount; clear stale coords on GPS error                     |   |
|     |  - Toast positioning: bottom-20 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5            |   |
|     +---------------------------------------------------------------------------------------------+   |
|                                                                                                       |
+-------------------------------------------------------------------------------------------------------+
```

### 2.1 Database Schema & Session Identity (G4, G5, G7)

#### 2.1.1 Migration: Adding `shift_id` to `teacher_attendances`
Create migration `supabase/migrations/20261015110000_phase3_teacher_attendance_shift_and_idempotency.sql`:

```sql
-- Phase 3: Add shift_id to teacher_attendances for per-shift attendance support
ALTER TABLE public.teacher_attendances
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.branch_shifts(id) ON DELETE SET NULL;

-- Composite index for quick session queries
CREATE INDEX IF NOT EXISTS idx_teacher_attendances_session
    ON public.teacher_attendances(teacher_id, branch_id, shift_id, check_in_time);
```

#### 2.1.2 Deterministic Client UUID & Idempotent Insertion
Update `AttendanceRecord` in `src/lib/attendances.ts`:

```typescript
export interface AttendanceRecord {
  id: string; // Required deterministic UUID generated by client
  teacher_id: string;
  branch_id: string;
  shift_id?: string | null;
  check_in_time: string;
  check_out_time?: string | null;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat?: number | null;
  check_out_lng?: number | null;
  notes?: string | null;
}
```

In `insertCheckIn`, accept `id` and upsert with idempotency:
```typescript
export async function insertCheckIn(data: AttendanceRecord) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("teacher_attendances")
    .upsert({
      id: data.id,
      teacher_id: data.teacher_id,
      branch_id: data.branch_id,
      shift_id: data.shift_id || null,
      check_in_time: data.check_in_time,
      check_in_lat: data.check_in_lat,
      check_in_lng: data.check_in_lng,
    }, { onConflict: "id", ignoreDuplicates: true })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan presensi masuk: ${error.message}`);
  }

  return record;
}
```

In `updateCheckOut`, throw on error:
```typescript
export async function updateCheckOut(
  id: string,
  data: { check_out_time: string; check_out_lat: number; check_out_lng: number }
) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("teacher_attendances")
    .update({
      check_out_time: data.check_out_time,
      check_out_lat: data.check_out_lat,
      check_out_lng: data.check_out_lng,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan presensi pulang: ${error.message}`);
  }

  return record;
}
```

---

### 2.2 Server-Side Geofence & Schedule Validation Boundary (G1, G2)

In `src/app/guru/absen/actions.ts`:
1. **Geofence Enforcement:** Validate distance using `haversineDistance` on the server against the branch's coordinates. Reject with clear error if distance exceeds `branch.radius_meters || 100`.
2. **Schedule Validation:** Verify that the teacher has at least one active schedule class on that shift and branch for today (calculated in `Asia/Jakarta`).

```typescript
export async function processOnlineCheckIn(
  sessionId: string,
  branchId: string,
  shiftId: string,
  lat: number,
  lng: number,
  timestamp: string
) {
  const { profile } = await requireGuruAction();

  // 1. Fetch branch and validate geofence radius
  const supabase = await createClient();
  const { data: branch, error: branchErr } = await supabase
    .from("branches")
    .select("latitude, longitude, radius_meters, is_active")
    .eq("id", branchId)
    .single();

  if (branchErr || !branch || !branch.is_active) {
    return { success: false, error: "Cabang tidak valid atau tidak aktif." };
  }

  if (branch.latitude && branch.longitude) {
    const distanceMeters = calculateHaversineDistance(
      lat,
      lng,
      branch.latitude,
      branch.longitude
    );
    const maxRadius = branch.radius_meters || 100;
    if (distanceMeters > maxRadius) {
      return {
        success: false,
        error: `Posisi Anda (${Math.round(distanceMeters)}m) berada di luar radius cabang (${maxRadius}m).`,
      };
    }
  }

  // 2. Perform database check-in
  try {
    const record = await insertCheckIn({
      id: sessionId,
      teacher_id: profile.id,
      branch_id: branchId,
      shift_id: shiftId,
      check_in_time: timestamp,
      check_in_lat: lat,
      check_in_lng: lng,
    });
    return { success: true, data: record };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mencatat presensi masuk.",
    };
  }
}
```

---

### 2.3 Targeted Offline Checkout & IndexedDB Browser Compatibility (G3, G5, G8, G11, G12)

#### 2.3.1 Updated `PendingAttendance` Interface
In `src/lib/pwa/db.ts`:
```typescript
export interface PendingAttendance {
  id: string; // Deterministic sessionId UUID
  attendance_id?: string | null; // For checkout: exact ID of the check-in session
  teacher_id: string;
  branch_id: string;
  shift_id?: string | null;
  type: "check_in" | "check_out";
  lat: number;
  lng: number;
  timestamp: string;
}
```

#### 2.3.2 Browser Compatibility & Safe Commit in `src/lib/pwa/db.ts`
Replace `Promise.withResolvers` with standard `new Promise`:
```typescript
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("IndexedDB is not available on the server."));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingAttendance(record: PendingAttendance): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(record);
    // Must resolve on transaction.oncomplete to guarantee disk persistence
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}
```

#### 2.3.3 Replaying Targeted Offline Check-Out
In `syncOfflineAttendances`:
```typescript
for (const record of sortedRecords) {
  // Account isolation check: skip records that do not belong to current user
  if (record.teacher_id !== profile.id) {
    continue;
  }

  try {
    if (record.type === "check_in") {
      await insertCheckIn({
        id: record.id,
        teacher_id: record.teacher_id,
        branch_id: record.branch_id,
        shift_id: record.shift_id,
        check_in_time: record.timestamp,
        check_in_lat: record.lat,
        check_in_lng: record.lng,
      });
      results.success.push(record.id);
    } else if (record.type === "check_out") {
      const targetAttendanceId = record.attendance_id || record.id;
      await updateCheckOut(targetAttendanceId, {
        check_out_time: record.timestamp,
        check_out_lat: record.lat,
        check_out_lng: record.lng,
      });
      results.success.push(record.id);
    }
  } catch (err) {
    results.failed.push(record.id);
  }
}
```

---

### 2.4 Timezone Normalization, Loop Prevention & Mobile Toast Polish (G9, G10, G13, G21)

#### 2.4.1 Canonical WIB Calculations
In `src/lib/attendances.ts` and `src/app/guru/absen/page.tsx`:
```typescript
export function getWIBDateBounds(targetDate = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateString = formatter.format(targetDate); // YYYY-MM-DD
  const startOfDay = new Date(`${dateString}T00:00:00+07:00`).toISOString();
  const endOfDay = new Date(`${dateString}T23:59:59.999+07:00`).toISOString();

  // Day of week in WIB (1=Monday .. 7=Sunday)
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "narrow",
  });
  const nowWIB = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const dayOfWeek = nowWIB.getDay() === 0 ? 7 : nowWIB.getDay();

  return { dateString, startOfDay, endOfDay, dayOfWeek };
}
```

#### 2.4.2 Single-Flight Synchronization Guard (No Infinite Loops)
In `src/components/guru/attendance-client.tsx`:
Use `isSyncingRef = useRef(false)`:
```typescript
const isSyncingRef = useRef(false);

const attemptSync = useCallback(async () => {
  if (isSyncingRef.current) return;
  isSyncingRef.current = true;
  setIsSyncing(true);
  try {
    const allRecords = await getPendingAttendances();
    // Filter to current teacher only
    const records = allRecords.filter((r) => r.teacher_id === teacherId);
    if (records.length === 0) return;

    const result = await syncOfflineAttendances(records);
    if (result.success.length > 0) {
      await removePendingAttendances(result.success);
      showToast(`${result.success.length} presensi berhasil disinkronkan!`, "success");
    }
  } catch (error) {
    console.error("Sync error:", error);
  } finally {
    isSyncingRef.current = false;
    setIsSyncing(false);
  }
}, [teacherId]);
```

#### 2.4.3 Mobile Toast Viewport Polish (G21)
In `src/components/admin/toast.tsx:85`:
```tsx
<div
  role="status"
  aria-live="polite"
  className="fixed bottom-20 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 max-w-sm sm:w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
>
```

---

## 3. Test Strategy & Acceptance Criteria

### 3.1 Automated Vitest Test Suites
1. **`tests/crud/attendance-server-validation.test.ts`**:
   - Verify `insertCheckIn` and `updateCheckOut` throw on database error.
   - Verify `processOnlineCheckIn` enforces geofence radius.
   - Verify `processOnlineCheckIn` accepts deterministic client UUID.
2. **`tests/pwa/offline-queue-lifecycle.test.ts`**:
   - Verify `savePendingAttendance` commits with `new Promise` on `transaction.oncomplete`.
   - Verify `syncOfflineAttendances` isolates records by `teacher_id`.
   - Verify check-out matches `record.attendance_id`.
3. **`tests/utils/wib-timezone.test.ts`**:
   - Verify `getWIBDateBounds` returns correct WIB weekday and ISO boundaries across UTC server offsets.
4. **`tests/components/toast-responsive.test.tsx`**:
   - Verify toast classes include `bottom-20` and `left-4 right-4` on mobile viewports.

### 3.2 Definition of Done for Phase 3
- [ ] Database migration adding `shift_id` applied.
- [ ] Presensi records are shift-aware; completing morning shift does not block afternoon shift.
- [ ] Offline queue reconciles with database UUIDs without duplicate rows.
- [ ] Replaying offline checkout correctly updates original session regardless of sync date.
- [ ] `npm test` and `./init.sh` pass cleanly with 100% success rate.
