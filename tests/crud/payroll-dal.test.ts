import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  closePayrollPeriod,
  getOpenPayrollPeriod,
  markPayrollPeriodPaid,
  addPayrollAdjustment,
  getLatestPayrollPeriodId,
  getPayrollPeriods,
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

  it("returns the latest payroll period id or null when none exists", async () => {
    const queryLatest = {
      select: vi.fn(() => queryLatest),
      order: vi.fn(() => queryLatest),
      limit: vi.fn(() => queryLatest),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: "period-latest" },
        error: null,
      }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => queryLatest) } as never);

    const id = await getLatestPayrollPeriodId();
    expect(id).toBe("period-latest");
    expect(queryLatest.select).toHaveBeenCalledWith("id");
    expect(queryLatest.order).toHaveBeenCalledWith("period_month", { ascending: false });
    expect(queryLatest.limit).toHaveBeenCalledWith(1);

    queryLatest.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    await expect(getLatestPayrollPeriodId()).resolves.toBeNull();
  });

  it("returns payroll period summaries in database order", async () => {
    const queryList = {
      select: vi.fn(() => queryList),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: "p-2", period_month: "2026-11-01", status: "open" },
          { id: "p-1", period_month: "2026-10-01", status: "closed" },
        ],
        error: null,
      }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => queryList) } as never);

    const periods = await getPayrollPeriods();
    expect(periods).toHaveLength(2);
    expect(periods[0].id).toBe("p-2");
    expect(queryList.select).toHaveBeenCalledWith("id, period_month, status");
    expect(queryList.order).toHaveBeenCalledWith("period_month", { ascending: false });
  });

  it("maps payroll period read errors to explicit domain errors", async () => {
    const queryLatestErr = {
      select: vi.fn(() => queryLatestErr),
      order: vi.fn(() => queryLatestErr),
      limit: vi.fn(() => queryLatestErr),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "timeout reading latest" },
      }),
    };
    vi.mocked(createClient).mockResolvedValueOnce({ from: vi.fn(() => queryLatestErr) } as never);

    await expect(getLatestPayrollPeriodId()).rejects.toThrow(
      "Gagal membaca periode payroll terbaru: timeout reading latest"
    );

    const queryListErr = {
      select: vi.fn(() => queryListErr),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "connection refused" },
      }),
    };
    vi.mocked(createClient).mockResolvedValueOnce({ from: vi.fn(() => queryListErr) } as never);

    await expect(getPayrollPeriods()).rejects.toThrow(
      "Gagal membaca daftar periode payroll: connection refused"
    );
  });
});
