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
                    data: [{ id: "p1" }, { id: "p2" }], // already placed 2 times!
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
