import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProgramData } from "@/lib/programs";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("updateProgramData variant synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles replacing all variants without triggering mass deletion", async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    const notMock = vi.fn().mockResolvedValue({ error: null });
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        not: notMock,
      }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "programs") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "program_variants") {
          return {
            upsert: upsertMock,
            delete: deleteMock,
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const newVariants = [
      {
        id: "new-uuid-1",
        program_id: "prog-1",
        name: "Varian Baru 1",
      } as never,
      {
        id: "new-uuid-2",
        program_id: "prog-1",
        name: "Varian Baru 2",
      } as never,
    ];
    const activeIds = ["new-uuid-1", "new-uuid-2"];

    const result = await updateProgramData(
      "prog-1",
      { name: "Program Test" },
      newVariants,
      activeIds
    );
    expect(result.success).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(newVariants);
    // Ensure it called delete with NOT IN (activeIds) rather than deleting all variants
    expect(notMock).toHaveBeenCalledWith("id", "in", "(new-uuid-1,new-uuid-2)");
  });

  it("surfaces friendly error message when variant deletion violates foreign key restrict", async () => {
    const deleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        not: vi.fn().mockResolvedValue({
          error: {
            message:
              "violates foreign key constraint 'student_programs_variant_id_fkey' on table 'student_programs'",
            code: "23503",
          },
        }),
      }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "programs") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "program_variants") {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
            delete: deleteMock,
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const variants = [
      { id: "retained-id", program_id: "prog-1", name: "Varian 1" } as never,
    ];
    const activeIds = ["retained-id"];

    const result = await updateProgramData(
      "prog-1",
      { name: "Program Test" },
      variants,
      activeIds
    );
    expect(result.error?.message).toContain(
      "Varian tidak dapat dihapus karena masih digunakan"
    );
  });
});
