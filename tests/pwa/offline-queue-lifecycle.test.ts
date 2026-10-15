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
    vi.mocked(updateCheckOut).mockResolvedValue({
      id: "checkin-session-uuid",
    } as never);

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
    vi.mocked(insertCheckIn).mockRejectedValueOnce(
      new Error("Network disconnect")
    );

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
