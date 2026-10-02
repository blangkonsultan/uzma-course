import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getPrograms, getProgramById } from "@/lib/programs";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("Programs Data Layer (src/lib/programs.ts)", () => {
  const mockPrograms = [
    { id: "ahe", initials: "AHE", name: "Baca Tulis Anak Hebat", is_active: true, sort_order: 1 },
    { id: "ase", initials: "ASE", name: "Anak Pintar Berhitung", is_active: true, sort_order: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrograms", () => {
    it("fetches only active programs by default ordered by sort_order", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({ data: mockPrograms });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          order: mockOrder,
          eq: mockEq,
        }),
      });

      const programs = await getPrograms();
      expect(programs).toHaveLength(2);
      expect(programs[0].initials).toBe("AHE");
    });

    it("fetches all programs including inactive when includeInactive is true", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({ data: mockPrograms });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          order: mockOrder,
        }),
      });

      const programs = await getPrograms(true);
      expect(programs).toHaveLength(2);
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

      const programs = await getPrograms();
      expect(programs).toEqual([]);
    });
  });

  describe("getProgramById", () => {
    it("fetches single program by id", async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({ data: mockPrograms[0] });

      (createClient as unknown as Mock).mockResolvedValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        }),
      });

      const program = await getProgramById("ahe");
      expect(program?.initials).toBe("AHE");
    });
  });
});
