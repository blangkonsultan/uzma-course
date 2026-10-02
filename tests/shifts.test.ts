import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getBranchShifts, getBranchShiftById } from "@/lib/shifts";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Shifts Data Access (src/lib/shifts.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBranchShifts", () => {
    it("fetches all shifts when no branchId is provided", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: [{ id: "shift-1", name: "Pagi" }],
        error: null,
      });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getBranchShifts();
      expect(result).toEqual([{ id: "shift-1", name: "Pagi" }]);
    });

    it("filters shifts by branchId when provided", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: "shift-2", name: "Sore", branch_id: "krian" }],
        error: null,
      });
      const mockOrder = vi.fn().mockReturnValue({ eq: mockEq });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getBranchShifts("krian");
      expect(result).toEqual([{ id: "shift-2", name: "Sore", branch_id: "krian" }]);
    });

    it("returns empty array on error", async () => {
      const mockOrder = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("DB Error"),
      });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      // Spy on console.error to keep test output clean
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await getBranchShifts();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe("getBranchShiftById", () => {
    it("fetches single shift by id", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "shift-1", name: "Pagi" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getBranchShiftById("shift-1");
      expect(result).toEqual({ id: "shift-1", name: "Pagi" });
    });

    it("returns null on error", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("Not found"),
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getBranchShiftById("invalid-id");
      expect(result).toBeNull();
    });
  });
});
