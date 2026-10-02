import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getBoardData } from "@/lib/board";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Board Data Access (src/lib/board.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws error if draft is not found", async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: new Error("Draft not found"),
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    (createClient as unknown as Mock).mockResolvedValue({
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    });

    await expect(getBoardData("invalid-id")).rejects.toThrow("Draft not found");
  });

  it("fetches all related board data successfully", async () => {
    // We need to mock a sequence or implementation that handles multiple `.from()` calls
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "schedule_drafts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "draft-1", branch_id: "krian", name: "Draf A" },
                  error: null,
                })
              })
            })
          };
        }
        if (table === "branch_shifts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [{ id: "shift-1" }] })
                })
              })
            })
          };
        }
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [{ id: "teacher-1" }] })
                })
              })
            })
          };
        }
        if (table === "program_variants") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ id: "variant-1" }] })
            })
          };
        }
        if (table === "students") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ id: "student-1" }] })
              })
            })
          };
        }
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [{ id: "class-1" }] })
            })
          };
        }
        return { select: vi.fn() };
      })
    };

    (createClient as unknown as Mock).mockResolvedValue(mockSupabase);

    const result = await getBoardData("draft-1");
    
    expect(result.draft.id).toBe("draft-1");
    expect(result.shifts).toEqual([{ id: "shift-1" }]);
    expect(result.teachers).toEqual([{ id: "teacher-1" }]);
    expect(result.variants).toEqual([{ id: "variant-1" }]);
    expect(result.students).toEqual([{ id: "student-1" }]);
    expect(result.classes).toEqual([{ id: "class-1" }]);
  });
});
