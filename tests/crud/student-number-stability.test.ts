import { describe, it, expect, vi, beforeEach } from "vitest";
import type * as StudentsModule from "@/lib/students";
import { updateStudent } from "@/app/admin/murid/actions";
import { generateStudentNumber, updateStudentData } from "@/lib/students";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

vi.mock("@/lib/students", async (importOriginal) => {
  const actual = await importOriginal<typeof StudentsModule>();
  return {
    ...actual,
    updateStudentData: vi.fn().mockResolvedValue({ success: true }),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Student Number Format & Stability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates canonical 5-digit number: 01001 for Sumokembangsri and 02001 for Junwangi", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "branches") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((_col: string, val: string) => ({
                single: vi.fn().mockResolvedValue({
                  data: { code: val === "sumokembangsri" ? "01" : "02" },
                  error: null,
                }),
              })),
            }),
          };
        }
        if (table === "students") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockImplementation((_col: string, val: string) => ({
                not: vi.fn().mockResolvedValue({
                  data:
                    val === "sumokembangsri"
                      ? [{ student_number: "01001" }, { student_number: "01002" }]
                      : [{ student_number: "02001" }],
                  error: null,
                }),
              })),
            }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const sumoNum = await generateStudentNumber("sumokembangsri");
    expect(sumoNum).toBe("01003");

    const junwangiNum = await generateStudentNumber("junwangi");
    expect(junwangiNum).toBe("02002");
  });

  it("preserves existing student_number during ordinary edits when not provided in form", async () => {
    const existingStudentNumber = "01005";
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                student_number: existingStudentNumber,
                joined_date: "2026-10-01",
              },
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const formData = new FormData();
    formData.append("full_name", "Ahmad Fauzi");
    formData.append("parent_name", "Bapak Fauzi");
    formData.append("parent_phone", "081234567890");
    formData.append("branch_id", "sumokembangsri");
    formData.append(
      "student_programs_json",
      JSON.stringify([{ program_id: "p1", variant_id: "v1", spp_amount: 150000, status: "active" }])
    );
    // student_number is intentionally omitted from formData

    await updateStudent("student-123", formData);

    expect(updateStudentData).toHaveBeenCalledWith(
      "student-123",
      expect.objectContaining({
        student_number: existingStudentNumber, // Must preserve existing number!
      }),
      expect.any(Array)
    );
  });
});
