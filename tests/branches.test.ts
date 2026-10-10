import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getBranches, getBranchById } from "@/lib/branches";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("Branch Data Access (src/lib/branches.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBranches", () => {
    it("fetches active branches by default", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: "balongbendo", name: "Cabang Balongbendo", is_active: true }],
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          order: mockOrder,
          eq: mockEq,
        }),
      });

      const branches = await getBranches();
      expect(branches).toHaveLength(1);
      expect(branches[0].id).toBe("balongbendo");
      expect(mockEq).toHaveBeenCalledWith("is_active", true);
    });

    it("fetches all branches including inactive when includeInactive is true", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          { id: "balongbendo", name: "Cabang Balongbendo", is_active: true },
          { id: "krian", name: "Cabang Krian", is_active: false },
        ],
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          order: mockOrder,
        }),
      });

      const branches = await getBranches(true);
      expect(branches).toHaveLength(2);
      expect(branches[1].id).toBe("krian");
    });
    it("returns empty array if data is null", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: null });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          order: mockOrder,
          eq: mockEq,
        }),
      });

      const branches = await getBranches();
      expect(branches).toEqual([]);
    });
  });

  describe("getBranchById", () => {
    it("fetches single branch by id", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: "sumokembangsri",
          name: "Cabang Sumokembangsri",
          kecamatan: "Balongbendo",
          desa: "Sumokembangsri",
        },
      });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });

      const branch = await getBranchById("sumokembangsri");
      expect(branch).not.toBeNull();
      expect(branch?.id).toBe("sumokembangsri");
      expect(branch?.kecamatan).toBe("Balongbendo");
      expect(branch?.desa).toBe("Sumokembangsri");
      expect(mockEq).toHaveBeenCalledWith("id", "sumokembangsri");
    });

    it("returns null when branch does not exist", async () => {
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

      const branch = await getBranchById("non-existent");
      expect(branch).toBeNull();
    });
  });

  describe("Branch ID slug validation rules", () => {
    const slugRegex = /^[a-z0-9-]+$/;

    it("accepts valid lowercase slug IDs", () => {
      expect(slugRegex.test("balongbendo")).toBe(true);
      expect(slugRegex.test("krian")).toBe(true);
      expect(slugRegex.test("sidoarjo-kota")).toBe(true);
      expect(slugRegex.test("cabang-2")).toBe(true);
    });

    it("rejects invalid slugs with uppercase, spaces, or special characters", () => {
      expect(slugRegex.test("Balongbendo")).toBe(false);
      expect(slugRegex.test("krian cabang")).toBe(false);
      expect(slugRegex.test("sidoarjo_kota")).toBe(false);
      expect(slugRegex.test("cabang@1")).toBe(false);
      expect(slugRegex.test("")).toBe(false);
    });
  });
});
