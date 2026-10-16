import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdminAction } from "@/lib/auth";
import {
  closePeriodAction,
  createPeriodAction,
  markPeriodPaidAction,
  addAdjustmentAction,
} from "@/app/admin/payroll/actions";
import {
  closePayrollPeriod,
  createPayrollPeriod,
  markPayrollPeriodPaid,
  addPayrollAdjustment,
} from "@/lib/payroll";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn(),
}));

vi.mock("@/lib/payroll", () => ({
  closePayrollPeriod: vi.fn(),
  createPayrollPeriod: vi.fn(),
  markPayrollPeriodPaid: vi.fn(),
  addPayrollAdjustment: vi.fn(),
}));

describe("Payroll admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propagates admin authorization failures", async () => {
    vi.mocked(requireAdminAction).mockRejectedValueOnce(
      new Error("Hanya admin yang memiliki izin untuk operasi ini.")
    );

    await expect(closePeriodAction("period-1")).rejects.toThrow("Hanya admin");
    expect(closePayrollPeriod).not.toHaveBeenCalled();
  });

  it("rejects invalid adjustment amounts or empty reasons before calling DAL", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);

    const result = await addAdjustmentAction({
      period_id: "period-1",
      teacher_id: "teacher-1",
      amount: 0,
      reason: " ",
    });

    expect(result).toEqual({
      error: "Nominal dan alasan adjustment wajib diisi.",
    });
    expect(addPayrollAdjustment).not.toHaveBeenCalled();
  });

  it("invokes DAL functions for valid action calls", async () => {
    vi.mocked(requireAdminAction).mockResolvedValue({
      user: { id: "admin-1" },
      profile: { id: "admin-1", role: "admin" },
    } as never);
    vi.mocked(createPayrollPeriod).mockResolvedValue({ id: "period-1" } as never);
    vi.mocked(closePayrollPeriod).mockResolvedValue({ id: "period-1" } as never);
    vi.mocked(markPayrollPeriodPaid).mockResolvedValue({ id: "period-1" } as never);

    await expect(createPeriodAction("2026-10-01")).resolves.toEqual({
      data: { id: "period-1" },
    });
    await expect(closePeriodAction("period-1")).resolves.toEqual({
      data: { id: "period-1" },
    });
    await expect(markPeriodPaidAction("period-1")).resolves.toEqual({
      data: { id: "period-1" },
    });
  });
});
