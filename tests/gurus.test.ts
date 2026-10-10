import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getPaginatedGurus, getGuruById } from "@/lib/gurus";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("Guru Data Access Layer (src/lib/gurus.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPaginatedGurus", () => {
    it("fetches gurus with pagination and status filter", async () => {
      const mockGurus = [
        {
          id: "g1",
          full_name: "Siti Nurhaliza, S.Pd.",
          role: "guru",
          branch_id: "sumokembangsri",
          is_active: true,
          profile_programs: [{ program_id: "ahe" }],
        },
      ];

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockResolvedValue({
        data: mockGurus,
        count: 1,
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          order: mockOrder,
          range: mockRange,
        }),
      });

      const result = await getPaginatedGurus({
        search: "",
        branch: "sumokembangsri",
        status: "active",
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].full_name).toBe("Siti Nurhaliza, S.Pd.");
      expect(result.data[0].profile_branches).toEqual([
        { branch_id: "sumokembangsri", is_primary: true },
      ]);
      expect(result.count).toBe(1);
    });

    it("filters by inactive status and search term", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockIlike = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockResolvedValue({
        data: [],
        count: 0,
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          ilike: mockIlike,
          order: mockOrder,
          range: mockRange,
        }),
      });

      const result = await getPaginatedGurus({
        search: "Dewi",
        branch: "all",
        status: "inactive",
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getGuruById", () => {
    it("fetches a single guru by id and attaches fallback branch", async () => {
      const mockGuru = {
        id: "g-adhera",
        full_name: "Adheraprabu Bagaskhara",
        role: "guru",
        branch_id: "sumokembangsri",
        is_active: true,
      };

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockGuru,
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });

      const result = await getGuruById("g-adhera");
      expect(result).not.toBeNull();
      expect(result?.full_name).toBe("Adheraprabu Bagaskhara");
      expect(result?.profile_branches).toEqual([
        { branch_id: "sumokembangsri", is_primary: true },
      ]);
    });

    it("returns null if guru is not found", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });

      const result = await getGuruById("non-existent");
      expect(result).toBeNull();
    });
  });
});
