import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HonorGuruPage from "@/app/guru/honor/page";
import { requireGuruPage } from "@/lib/auth";
import { getTeacherPayrollStatement } from "@/lib/payroll";

vi.mock("@/lib/auth", () => ({
  requireGuruPage: vi.fn(),
}));

vi.mock("@/lib/payroll", () => ({
  getTeacherPayrollStatement: vi.fn(),
}));

const guruProfile = {
  id: "teacher-1",
  full_name: "Guru Fida",
  role: "guru",
  minimum_income: 250000,
  allowances: [
    { name: "Transport", amount: 60000 },
    { name: "Kreativitas", amount: 50000 },
  ],
  bank_name: "BCA",
  bank_account_number: "1234567890",
};

describe("HonorGuruPage (Guru Honor Statement)", () => {
  it("renders statement details for a closed/paid period", async () => {
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: guruProfile,
    } as never);

    vi.mocked(getTeacherPayrollStatement).mockResolvedValue({
      period: {
        id: "period-1",
        period_month: "2026-10-01",
        status: "paid",
        closed_at: "2026-10-31T23:59:59Z",
        closed_by: "admin-1",
        paid_at: "2026-11-01T10:00:00Z",
        paid_by: "admin-1",
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-11-01T10:00:00Z",
      },
      entry: {
        id: "entry-1",
        period_id: "period-1",
        teacher_id: "teacher-1",
        fee_sessions_total: 45000,
        fixed_allowances_total: 110000,
        minimum_income_snapshot: 250000,
        allowances_snapshot: guruProfile.allowances,
        adjustments_total: 15000,
        total_amount: 170000,
        created_at: "2026-10-31T23:59:59Z",
        updated_at: "2026-10-31T23:59:59Z",
      },
      lines: [
        {
          id: "line-1",
          period_id: "period-1",
          teaching_session_student_id: "tss-1",
          teaching_session_id: "ts-1",
          teacher_id: "teacher-1",
          student_id: "st-1",
          session_date: "2026-10-14",
          attendance_status: "present",
          teacher_fee_snapshot: 3000,
          payable_amount: 3000,
          created_at: "2026-10-31T23:59:59Z",
        },
      ],
      adjustments: [
        {
          id: "adj-1",
          period_id: "period-1",
          teacher_id: "teacher-1",
          amount: 15000,
          reason: "Kompensasi",
          created_by: "admin-1",
          created_at: "2026-10-31T20:00:00Z",
        },
      ],
      totals: {
        fee_sessions_total: 45000,
        fixed_allowances_total: 110000,
        adjustments_total: 15000,
        total_amount: 170000,
      },
    });

    const page = await HonorGuruPage({
      searchParams: Promise.resolve({ period: "period-1" }),
    });
    render(page);

    expect(screen.getByText("Rekap Honor")).toBeDefined();
    expect(screen.getByText("Sudah Ditransfer / Paid")).toBeDefined();
    expect(screen.getByText("Rp 170.000")).toBeDefined();
    expect(screen.getByText("Rp 45.000")).toBeDefined();
    expect(screen.getByText("Kompensasi")).toBeDefined();

    // Verify absence of mutation controls
    expect(screen.queryByRole("button", { name: /Tutup Periode/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Tandai Sudah Dibayar/i })).toBeNull();
  });
});
