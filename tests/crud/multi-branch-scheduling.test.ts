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
                    { id: "teacher-other", full_name: "Lainnya", branch_id: "surabaya" },
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
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const result = await getBoardData("draft-1");
    const teacherIds = result.teachers.map((t) => t.id);
    expect(teacherIds).toContain("teacher-primary");
    expect(teacherIds).toContain("teacher-secondary");
    expect(teacherIds).not.toContain("teacher-other");
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
    ).rejects.toThrow("Jadwal bertabrakan dengan sesi guru yang lain");
  });
});
