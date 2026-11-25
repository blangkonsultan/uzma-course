import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getTeacherOverdueSppByClass } from "@/lib/teacher-billing";

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

describe("getTeacherOverdueSppByClass", () => {
  it("returns empty map when classIds is empty", async () => {
    const supabaseMock = {
      rpc: vi.fn(),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, []);
    expect(result.size).toBe(0);
    expect(supabaseMock.rpc).not.toHaveBeenCalled();
  });

  it("fetches overdue summary pages with deterministic ordering and constructs class:student:program keys", async () => {
    const order = vi.fn();
    const range = vi.fn().mockResolvedValue({
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
    });
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue(createOrderedRpcChain(range, order)),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, ["class-1"]);
    expect(order.mock.calls).toEqual([
      ["class_id", { ascending: true }],
      ["student_id", { ascending: true }],
      ["program_id", { ascending: true }],
    ]);
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
    const range = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Permission denied" },
    });
    const supabaseMock = {
      rpc: vi.fn().mockReturnValue(createOrderedRpcChain(range)),
    } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabaseMock, ["class-1"]);
    expect(result.size).toBe(0);
    warnSpy.mockRestore();
  });

  it.each([
    { count: 999, ranges: [[0, 999]], total: 499500 },
    { count: 1000, ranges: [[0, 999], [1000, 1999]], total: 500500 },
    { count: 1001, ranges: [[0, 999], [1000, 1999]], total: 501501 },
  ])("returns every summary at the $count-row boundary", async ({ count, ranges, total }) => {
    const rows = Array.from({ length: count }, (_, index) => ({
      class_id: index < 1000 ? "class-1" : "class-2",
      student_id: `student-${index}`,
      program_id: "program-1",
      due_date: "2026-09-01",
      total_amount: index + 1,
      invoice_count: 1,
    }));
    const range = vi.fn(async (start: number, end: number) => ({
      data: rows.slice(start, end + 1),
      error: null,
    }));
    const supabase = { rpc: vi.fn(() => createOrderedRpcChain(range)) } as unknown as SupabaseClient<Database>;

    const result = await getTeacherOverdueSppByClass(supabase, ["class-1", "class-2"]);

    expect(result.size).toBe(count);
    expect([...result.values()].reduce((total, row) => total + row.total_amount, 0))
      .toBe(total);
    expect(result.get(`${count === 1001 ? "class-2" : "class-1"}:student-${count - 1}:program-1`))
      .toEqual({ due_date: "2026-09-01", total_amount: count, invoice_count: 1 });
    expect(range.mock.calls).toEqual(ranges);
  });

  it("discards an already populated first page when the second page fails", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const range = vi.fn()
      .mockResolvedValueOnce({
        data: Array.from({ length: 1000 }, (_, index) => ({
          class_id: "class-1", student_id: `student-${index}`, program_id: "program-1",
          due_date: "2026-09-01", total_amount: 150000, invoice_count: 1,
        })),
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: { message: "later page unavailable" } });
    const supabase = { rpc: vi.fn(() => createOrderedRpcChain(range)) } as unknown as SupabaseClient<Database>;
    try {
      const result = await getTeacherOverdueSppByClass(supabase, ["class-1"]);
      expect(result.size).toBe(0);
      expect(range.mock.calls).toEqual([[0, 999], [1000, 1999]]);
    } finally {
      warning.mockRestore();
    }
  });

  it("preserves the maximum exact safe-integer amount and invoice count", async () => {
    const range = vi.fn().mockResolvedValue({
      data: [{
        class_id: "class-1", student_id: "student-1", program_id: "program-1",
        due_date: "2026-09-01",
        total_amount: Number.MAX_SAFE_INTEGER,
        invoice_count: Number.MAX_SAFE_INTEGER,
      }],
      error: null,
    });
    const supabase = {
      rpc: vi.fn(() => createOrderedRpcChain(range)),
    } as unknown as SupabaseClient<Database>;
    const result = await getTeacherOverdueSppByClass(supabase, ["class-1"]);
    expect(result.get("class-1:student-1:program-1")).toEqual({
      due_date: "2026-09-01",
      total_amount: 9007199254740991,
      invoice_count: 9007199254740991,
    });
  });

  it.each([
    { total_amount: Number.MAX_SAFE_INTEGER + 1, invoice_count: 1 },
    { total_amount: 1, invoice_count: Number.MAX_SAFE_INTEGER + 1 },
    { total_amount: -1, invoice_count: 1 },
    { total_amount: 1, invoice_count: -1 },
    { total_amount: 1.5, invoice_count: 1 },
    { total_amount: 1, invoice_count: 1.5 },
    { total_amount: Number.NaN, invoice_count: 1 },
    { total_amount: 1, invoice_count: Number.POSITIVE_INFINITY },
    { total_amount: null, invoice_count: 1 },
    { total_amount: 1, invoice_count: null },
    { total_amount: undefined, invoice_count: 1 },
    { total_amount: "", invoice_count: 1 },
    { total_amount: 1, invoice_count: "   " },
  ])("discards all summaries for invalid aggregate $total_amount / $invoice_count", async (invalid) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const range = vi.fn().mockResolvedValue({
      data: [
        {
          class_id: "class-1", student_id: "valid-student", program_id: "program-1",
          due_date: "2026-09-01", total_amount: 150000, invoice_count: 1,
        },
        {
          class_id: "class-1", student_id: "invalid-student", program_id: "program-1",
          due_date: "2026-09-01", ...invalid,
        },
      ],
      error: null,
    });
    const supabase = { rpc: vi.fn(() => createOrderedRpcChain(range)) } as unknown as SupabaseClient<Database>;
    try {
      expect((await getTeacherOverdueSppByClass(supabase, ["class-1"])).size).toBe(0);
    } finally {
      warning.mockRestore();
    }
  });
});
