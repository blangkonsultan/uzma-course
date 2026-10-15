import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertCheckIn, updateCheckOut } from "@/lib/attendances";
import {
  processOnlineCheckIn,
  processOnlineCheckOut,
} from "@/app/guru/absen/actions";
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
            single: vi
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: "RLS violation" },
              }),
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
              single: vi
                .fn()
                .mockResolvedValue({
                  data: null,
                  error: { message: "Row not found" },
                }),
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
      user: { id: "user-1" } as never,
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
                    geofence_radius_m: 100,
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
    const farLat = -7.48;
    const farLng = 112.55;

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
  it("processOnlineCheckOut updates check out and returns success", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "user-1" } as never,
      profile: { id: "teacher-1", role: "guru" } as never,
    });

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "attendance-1", check_out_time: "2026-10-15T12:00:00Z" },
                error: null,
              }),
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const result = await processOnlineCheckOut(
      "attendance-1",
      -7.4320527,
      112.5054893,
      "2026-10-15T12:00:00Z"
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "attendance-1", check_out_time: "2026-10-15T12:00:00Z" });
  });
});
