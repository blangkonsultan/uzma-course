import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  closePayrollPeriod,
  getOpenPayrollPeriod,
  markPayrollPeriodPaid,
  addPayrollAdjustment,
} from "@/lib/payroll";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Payroll DAL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps close period RPC errors to an explicit domain error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "period already closed" },
    });
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);

    await expect(closePayrollPeriod("admin-1", "period-1")).rejects.toThrow(
      "Gagal menutup periode payroll: period already closed"
    );
  });

  it("maps mark paid RPC errors to an explicit domain error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "period not closed" },
    });
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);

    await expect(markPayrollPeriodPaid("admin-1", "period-1")).rejects.toThrow(
      "Gagal menandai payroll dibayar: period not closed"
    );
  });

  it("maps adjustment RPC errors to an explicit domain error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "period paid" },
    });
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);

    await expect(
      addPayrollAdjustment("admin-1", {
        period_id: "period-1",
        teacher_id: "teacher-1",
        amount: 10000,
        reason: "Koreksi",
      })
    ).rejects.toThrow("Gagal menambahkan adjustment payroll: period paid");
  });

  it("returns null when no open period exists for the month", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => query) } as never);

    await expect(getOpenPayrollPeriod("2026-10-01")).resolves.toBeNull();
  });
});
