import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HonorGuruPage from "@/app/guru/honor/page";
import { requireGuruPage } from "@/lib/auth";
import { getTeacherPayrollStatement, getOpenPayrollPeriod } from "@/lib/payroll";
import { createClient } from "@/lib/supabase/server";
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/auth", () => ({
  requireGuruPage: vi.fn(),
}));

vi.mock("@/lib/payroll", () => ({
  getTeacherPayrollStatement: vi.fn(),
  getOpenPayrollPeriod: vi.fn(),
  calculatePayrollTotals: vi.fn().mockReturnValue({
    fee_sessions_total: 6000,
    fixed_allowances_total: 110000,
    adjustments_total: 0,
    total_amount: 116000,
  }),
  getWIBMonthFirstDay: vi.fn().mockReturnValue("2026-10-01"),
  getWIBNextMonthFirstDay: vi.fn().mockReturnValue("2026-11-01"),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockResolvedValue({ data: [] }),
        order: vi.fn().mockResolvedValue({ data: [] }),
      }),
    } as never);
  });

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

  it("renders live open estimate with date bounds and period selector when no period requested", async () => {
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: guruProfile,
    } as never);
    vi.mocked(getOpenPayrollPeriod).mockResolvedValue(null);

    const gteFn = vi.fn().mockReturnThis();
    const ltFn = vi.fn().mockResolvedValue({
      data: [
        {
          id: "ts-1",
          teaching_session_students: [
            { attendance_status: "present", teacher_fee_snapshot: 3000 },
            { attendance_status: "present", teacher_fee_snapshot: 3000 },
          ],
        },
      ],
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "payroll_periods") {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                { id: "period-old", period_month: "2026-09-01", status: "paid" },
              ],
            }),
          };
        }
        if (table === "teaching_sessions") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: gteFn.mockReturnValue({
              lt: ltFn,
            }),
          };
        }
        return { select: vi.fn().mockReturnThis() };
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const page = await HonorGuruPage({
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByText("Estimasi Berjalan")).toBeDefined();
    expect(screen.getByText("Rp 116.000")).toBeDefined();
    expect(gteFn).toHaveBeenCalledWith("session_date", "2026-10-01");
    expect(ltFn).toHaveBeenCalledWith("session_date", "2026-11-01");
    expect(screen.getByLabelText("Pilih Periode Honor")).toBeDefined();
  });
});
