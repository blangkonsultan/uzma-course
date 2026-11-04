import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getTeacherClassStudents } from "@/lib/teacher-roster";

describe("getTeacherClassStudents", () => {
  it("returns empty map when classIds is empty", async () => {
    const supabaseMock = {
      rpc: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherClassStudents(supabaseMock, []);
    expect(result.size).toBe(0);
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("fetches and groups roster students by class ID", async () => {
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({
          data: [
            {
              class_id: "class-1",
              student_id: "student-1",
              full_name: "Budi Santoso",
              student_number: "01001",
            },
            {
              class_id: "class-1",
              student_id: "student-2",
              full_name: "Siti Rahma",
              student_number: null,
            },
            {
              class_id: "class-2",
              student_id: "student-3",
              full_name: "Ahmad Dani",
              student_number: "02001",
            },
          ],
          error: null,
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherClassStudents(supabaseMock, ["class-1", "class-2"]);
    expect(result.size).toBe(2);

    const class1Students = result.get("class-1");
    expect(class1Students).toEqual([
      { id: "student-1", full_name: "Budi Santoso", student_number: "01001" },
      { id: "student-2", full_name: "Siti Rahma", student_number: null },
    ]);

    const class2Students = result.get("class-2");
    expect(class2Students).toEqual([
      { id: "student-3", full_name: "Ahmad Dani", student_number: "02001" },
    ]);
  });

  it("throws explicit error when RPC call fails", async () => {
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    await expect(getTeacherClassStudents(supabaseMock, ["class-1"])).rejects.toThrow(
      "Gagal membaca daftar murid kelas: Database connection failed"
    );
  });
});
