import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getTeacherOverdueSppByClass } from "@/lib/teacher-billing";

describe("getTeacherOverdueSppByClass", () => {
  it("returns empty map when classIds is empty", async () => {
    const supabaseMock = {
      rpc: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, []);
    expect(result.size).toBe(0);
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("fetches overdue summary pages and constructs class:student:program keys", async () => {
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({
          data: [
            {
              class_id: "class-1",
              student_id: "student-1",
              program_id: "prog-1",
              due_date: "2026-10-01",
              total_amount: 150000,
              invoice_count: 1,
            },
            {
              class_id: "class-1",
              student_id: "student-2",
              program_id: "prog-1",
              due_date: "2026-09-01",
              total_amount: 300000,
              invoice_count: 2,
            },
          ],
          error: null,
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, ["class-1"]);
    expect(result.size).toBe(2);
    expect(result.get("class-1:student-1:prog-1")).toEqual({
      due_date: "2026-10-01",
      total_amount: 150000,
      invoice_count: 1,
    });
    expect(result.get("class-1:student-2:prog-1")).toEqual({
      due_date: "2026-09-01",
      total_amount: 300000,
      invoice_count: 2,
    });
  });

  it("discards partial results when an RPC error occurs", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Permission denied" },
        }),
      }),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, ["class-1"]);
    expect(result.size).toBe(0);
    warnSpy.mockRestore();
  });
});
