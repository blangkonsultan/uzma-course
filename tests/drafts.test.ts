import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getScheduleDrafts, getScheduleDraftById } from "@/lib/drafts";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Drafts Data Access (src/lib/drafts.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getScheduleDrafts", () => {
    it("fetches all drafts when no branchId is provided", async () => {
      const mockOrder2 = vi.fn().mockResolvedValue({
        data: [{ id: "draft-1", name: "Draf A" }],
        error: null,
      });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getScheduleDrafts();
      expect(result).toEqual([{ id: "draft-1", name: "Draf A" }]);
    });

    it("filters drafts by branchId when provided", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: [{ id: "draft-2", name: "Draf B", branch_id: "krian" }],
        error: null,
      });
      const mockOrder2 = vi.fn().mockReturnValue({ eq: mockEq });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getScheduleDrafts("krian");
      expect(result).toEqual([{ id: "draft-2", name: "Draf B", branch_id: "krian" }]);
    });

    it("returns empty array on error", async () => {
      const mockOrder2 = vi.fn().mockResolvedValue({
        data: null,
        error: new Error("DB Error"),
      });
      const mockOrder1 = vi.fn().mockReturnValue({ order: mockOrder2 });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder1 });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await getScheduleDrafts();
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe("getScheduleDraftById", () => {
    it("fetches single draft by id", async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: { id: "draft-1", name: "Draf A" },
        error: null,
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({ select: mockSelect }),
      });

      const result = await getScheduleDraftById("draft-1");
      expect(result).toEqual({ id: "draft-1", name: "Draf A" });
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

      const result = await getScheduleDraftById("invalid-id");
      expect(result).toBeNull();
    });
  });
});
