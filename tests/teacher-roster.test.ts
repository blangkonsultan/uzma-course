import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getTeacherClassStudents } from "@/lib/teacher-roster";

function createOrderedRpcChain(
  range: ReturnType<typeof vi.fn>,
  orderSpy?: ReturnType<typeof vi.fn>
) {
  const chain = {
    order: orderSpy ?? vi.fn(),
    range,
  };
  chain.order.mockReturnValue(chain);
  return chain;
}

describe("getTeacherClassStudents", () => {
  it("returns empty map when classIds is empty", async () => {
    const supabaseMock = {
      rpc: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherClassStudents(supabaseMock, []);
    expect(result.size).toBe(0);
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("fetches with deterministic ordering and groups roster students by class ID", async () => {
    const order = vi.fn();
    const range = vi.fn().mockResolvedValue({
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
    });
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue(createOrderedRpcChain(range, order)),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherClassStudents(supabaseMock, ["class-1", "class-2"]);
    expect(order.mock.calls).toEqual([
      ["class_id", { ascending: true }],
      ["student_id", { ascending: true }],
    ]);
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
    const range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue(createOrderedRpcChain(range)),
    } as unknown as SupabaseClient<Database>;

    await expect(getTeacherClassStudents(supabaseMock, ["class-1"])).rejects.toThrow(
      "Gagal membaca daftar murid kelas: Database connection failed"
    );
  });

  it.each([
    { count: 999, ranges: [[0, 999]] },
    { count: 1000, ranges: [[0, 999], [1000, 1999]] },
    { count: 1001, ranges: [[0, 999], [1000, 1999]] },
  ])("returns the complete grouped roster at the $count-row boundary", async ({ count, ranges }) => {
    const rows = Array.from({ length: count }, (_, index) => ({
      class_id: index < 500 ? "class-1" : "class-2",
      student_id: `student-${index}`,
      full_name: `Murid ${index}`,
      student_number: index % 2 === 0 ? `${index}` : null,
    }));
    const range = vi.fn(async (start: number, end: number) => ({
      data: rows.slice(start, end + 1),
      error: null,
    }));
    const supabase = { rpc: vi.fn(() => createOrderedRpcChain(range)) } as unknown as SupabaseClient<Database>;

    const result = await getTeacherClassStudents(supabase, ["class-1", "class-2"]);

    expect(result.get("class-1")).toHaveLength(500);
    expect(result.get("class-2")).toHaveLength(count - 500);
    expect(result.get("class-2")?.at(-1)).toEqual({
      id: `student-${count - 1}`,
      full_name: `Murid ${count - 1}`,
      student_number: count === 1000 ? null : `${count - 1}`,
    });
    expect(new Set([...result.values()].flat().map((student) => student.id)).size).toBe(count);
    expect(range.mock.calls).toEqual(ranges);
  });

  it("rejects instead of returning a partial roster when a later page fails", async () => {
    const range = vi.fn()
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, index) => ({
          class_id: "class-1", student_id: `student-${index}`,
          full_name: `Murid ${index}`, student_number: null,
        })),
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: { message: "second page failed" } });
    const supabase = { rpc: vi.fn(() => createOrderedRpcChain(range)) } as unknown as SupabaseClient<Database>;

    await expect(getTeacherClassStudents(supabase, ["class-1"])).rejects.toThrow(
      "Gagal membaca daftar murid kelas: second page failed"
    );
    expect(range.mock.calls).toEqual([[0, 999], [1000, 1999]]);
  });
});
