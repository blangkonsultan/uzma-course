import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PayrollPeriodClient } from "@/components/admin/payroll/payroll-period-client";
import type { AdminPayrollPeriodDetail } from "@/lib/payroll";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));
vi.mock("@/app/admin/payroll/actions", () => ({
  createPeriodAction: vi.fn(),
  closePeriodAction: vi.fn(),
  markPeriodPaidAction: vi.fn(),
  addAdjustmentAction: vi.fn(),
}));

import {
  closePeriodAction,
  markPeriodPaidAction,
  addAdjustmentAction,
} from "@/app/admin/payroll/actions";

const openPeriodDetail: AdminPayrollPeriodDetail = {
  period: {
    id: "period-1",
    period_month: "2026-10-01",
    status: "open",
    closed_at: null,
    closed_by: null,
    paid_at: null,
    paid_by: null,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  entries: [
    {
      id: "entry-1",
      period_id: "period-1",
      teacher_id: "teacher-1",
      fee_sessions_total: 60000,
      fixed_allowances_total: 110000,
      minimum_income_snapshot: 250000,
      allowances_snapshot: [{ name: "Transport", amount: 60000 }],
      adjustments_total: 0,
      total_amount: 170000,
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
      teacher: {
        id: "teacher-1",
        full_name: "Guru Fida",
        phone: "08123456789",
      },
    },
  ],
  adjustments: [],
  linesCount: 20,
  totals: {
    fee_sessions_total: 60000,
    fixed_allowances_total: 110000,
    adjustments_total: 0,
    total_amount: 170000,
  },
};

const closedPeriodDetail: AdminPayrollPeriodDetail = {
  ...openPeriodDetail,
  period: {
    ...openPeriodDetail.period,
    status: "closed",
    closed_at: "2026-10-31T23:59:59Z",
    closed_by: "admin-1",
  },
};

const paidPeriodDetail: AdminPayrollPeriodDetail = {
  ...closedPeriodDetail,
  period: {
    ...closedPeriodDetail.period,
    status: "paid",
    paid_at: "2026-11-01T10:00:00Z",
    paid_by: "admin-1",
  },
};

describe("PayrollPeriodClient", () => {
  it("renders open period and handles close confirmation flow", async () => {
    vi.mocked(closePeriodAction).mockResolvedValueOnce({
      data: closedPeriodDetail,
    });

    render(<PayrollPeriodClient initialDetail={openPeriodDetail} />);

    expect(screen.getByText("Periode Terbuka")).toBeDefined();
    expect(screen.getByText("Guru Fida")).toBeDefined();

    // Click close trigger button to show confirmation state
    fireEvent.click(screen.getByRole("button", { name: "Tutup Periode Payroll" }));
    expect(screen.getByText(/Apakah Anda yakin ingin menutup periode ini/i)).toBeDefined();

    // Confirm close
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Konfirmasi Tutup Periode" }));
    });

    expect(closePeriodAction).toHaveBeenCalledWith("period-1");
  });

  it("handles mark paid in closed period", async () => {
    vi.mocked(markPeriodPaidAction).mockResolvedValueOnce({
      data: paidPeriodDetail,
    });

    render(<PayrollPeriodClient initialDetail={closedPeriodDetail} />);

    expect(screen.getByText("Periode Ditutup")).toBeDefined();
    const markPaidBtn = screen.getByRole("button", { name: "Tandai Sudah Dibayar" });

    await act(async () => {
      fireEvent.click(markPaidBtn);
    });

    expect(markPeriodPaidAction).toHaveBeenCalledWith("period-1");
  });

  it("adds adjustment in closed period", async () => {
    vi.mocked(addAdjustmentAction).mockResolvedValueOnce({
      data: {
        id: "adj-1",
        period_id: "period-1",
        teacher_id: "teacher-1",
        amount: 25000,
        reason: "Kompensasi cancel murid",
        created_by: "admin-1",
        created_at: "2026-10-31T20:00:00Z",
      },
    });

    render(<PayrollPeriodClient initialDetail={closedPeriodDetail} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Tambah Adjustment" }));

    fireEvent.change(screen.getByLabelText("Nominal Adjustment (Rp)"), {
      target: { value: "25000" },
    });
    fireEvent.change(screen.getByLabelText("Alasan Adjustment"), {
      target: { value: "Kompensasi cancel murid" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Simpan Adjustment" }));
    });

    expect(addAdjustmentAction).toHaveBeenCalledWith({
      period_id: "period-1",
      teacher_id: "teacher-1",
      amount: 25000,
      reason: "Kompensasi cancel murid",
    });
  });

  it("disables mutation controls in paid period", () => {
    render(<PayrollPeriodClient initialDetail={paidPeriodDetail} />);

    expect(screen.getByText("Sudah Dibayar")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Tutup Periode Payroll" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Tandai Sudah Dibayar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "+ Tambah Adjustment" })).toBeNull();
  });
});
