import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateStudentData } from "@/lib/students";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("updateStudentData atomic synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pre-validates program statuses and rejects invalid strings without touching database", async () => {
    const mockSupabase = { from: vi.fn() };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const invalidPrograms = [
      {
        program_id: "p1",
        variant_id: "v1",
        spp_amount: 150000,
        status: "invalid_status",
      },
    ];

    const result = await updateStudentData(
      "student-1",
      { full_name: "Budi" },
      invalidPrograms as never
    );
    expect(result.error).toContain(
      "Status program 'invalid_status' tidak valid"
    );
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("pre-validates that variant_id is present for each enrolled program", async () => {
    const mockSupabase = { from: vi.fn() };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const invalidPrograms = [
      {
        program_id: "p1",
        variant_id: "",
        spp_amount: 150000,
        status: "active" as const,
      },
    ];

    const result = await updateStudentData(
      "student-1",
      { full_name: "Budi" },
      invalidPrograms as never
    );
    expect(result.error).toContain("Varian program wajib dipilih");
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("performs safe update and restores previous records if junction insertion fails", async () => {
    const mockExistingEnrollments = [
      {
        student_id: "student-1",
        program_id: "p1",
        variant_id: "v0",
        status: "active",
      },
    ];
    const insertMock = vi
      .fn()
      .mockResolvedValueOnce({
        error: { message: "Check constraint failure" },
      });
    const restoreInsertMock = vi.fn().mockResolvedValue({ error: null });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "students") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === "student_programs") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: mockExistingEnrollments,
                error: null,
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            insert: vi.fn().mockImplementation((payload) => {
              if (payload === mockExistingEnrollments) {
                return restoreInsertMock();
              }
              return insertMock();
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const validPrograms = [
      {
        program_id: "p1",
        variant_id: "v1",
        spp_amount: 150000,
        status: "lulus" as const,
      },
    ];

    const result = await updateStudentData(
      "student-1",
      { full_name: "Budi" },
      validPrograms as never
    );
    expect(result.error).toContain("Gagal menyimpan pendaftaran program baru");
    // Verify previous enrollments restoration was triggered
    expect(restoreInsertMock).toHaveBeenCalled();
  });
});
