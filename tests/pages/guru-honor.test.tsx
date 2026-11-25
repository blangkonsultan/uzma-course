import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HonorGuruPage from "@/app/guru/honor/page";
import { requireGuruPage } from "@/lib/auth";
import { getTeacherPayrollStatement, getOpenPayrollPeriod } from "@/lib/payroll";
import type * as PayrollModule from "@/lib/payroll";
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

vi.mock("@/lib/payroll", async (importOriginal) => {
  const actual = await importOriginal<typeof PayrollModule>();
  return {
    ...actual,
    getTeacherPayrollStatement: vi.fn(),
    getOpenPayrollPeriod: vi.fn(),
    getWIBMonthFirstDay: vi.fn().mockReturnValue("2026-10-01"),
  };
});

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
        lt: vi.fn().mockResolvedValue({ data: [], error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    } as never);
  });

  it.each([
    { kind: "minimum_income_topup" as const, deduction: 0, total: "Rp 450.000", automatic: true },
    { kind: "minimum_income_topup" as const, deduction: -25000, total: "Rp 425.000", automatic: true },
    { kind: "manual" as const, deduction: 0, total: "Rp 450.000", automatic: false },
  ])("renders booked $kind and later deduction $deduction without changing snapshots", async ({ kind, deduction, total, automatic }) => {
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
        fee_sessions_total: 3000,
        fixed_allowances_total: 400000,
        minimum_income_snapshot: 450000,
        allowances_snapshot: [{ name: "Transport", amount: 400000 }],
        adjustments_total: 47000 + deduction,
        total_amount: deduction === 0 ? 450000 : 425000,
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
          amount: 47000,
          reason: "Top-up Garansi Gaji Minimum",
          kind,
          created_by: "admin-1",
          created_at: "2026-10-31T20:00:00Z",
        },
        ...(deduction === 0 ? [] : [{
          id: "adj-2",
          period_id: "period-1",
          teacher_id: "teacher-1",
          amount: deduction,
          reason: "Potongan manual setelah penutupan untuk koreksi yang telah disetujui",
          kind: "manual" as const,
          created_by: "admin-1",
          created_at: "2026-10-31T21:00:00Z",
        }]),
      ],
      totals: {
        fee_sessions_total: 3000,
        fixed_allowances_total: 400000,
        adjustments_total: 47000 + deduction,
        total_amount: deduction === 0 ? 450000 : 425000,
      },
    });

    const page = await HonorGuruPage({
      searchParams: Promise.resolve({ period: "period-1" }),
    });
    render(page);

    expect(screen.getByText("Rekap Honor")).toBeDefined();
    expect(screen.getByText("Sudah Ditransfer / Paid")).toBeDefined();
    expect(screen.getAllByText(total)).toHaveLength(deduction === 0 ? 2 : 1);
    expect(screen.getByText("Rp 3.000")).toBeDefined();
    expect(screen.getAllByText("Rp 400.000")).toHaveLength(2);
    expect(screen.getAllByText("+Rp 47.000").length).toBeGreaterThan(0);
    expect(screen.getByText("Top-up Garansi Gaji Minimum")).toBeDefined();
    expect(screen.queryByText("Otomatis") !== null).toBe(automatic);
    if (deduction !== 0) {
      expect(screen.getByText("-Rp 25.000")).toBeDefined();
      expect(screen.getByText("Potongan manual setelah penutupan untuk koreksi yang telah disetujui")).toBeDefined();
    }
    // Verify absence of mutation controls
    expect(screen.queryByRole("button", { name: /Tutup Periode/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Tandai Sudah Dibayar/i })).toBeNull();
  });

  it("renders live open estimate with date bounds and period selector when no period requested", async () => {
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: {
        ...guruProfile,
        minimum_income: 450000,
        allowances: [{ name: "Transport", amount: 400000 }],
      },
    } as never);
    vi.mocked(getOpenPayrollPeriod).mockResolvedValue(null);

    const gteFn = vi.fn().mockReturnThis();
    const ltFn = vi.fn().mockResolvedValue({
      data: [
        {
          id: "ts-1",
          teaching_session_students: [
            { attendance_status: "present", teacher_fee_snapshot: 3000 },
            { attendance_status: "absent", teacher_fee_snapshot: 3000 },
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
    expect(screen.getByText("Rp 403.000")).toBeDefined();
    expect(screen.queryByText("Otomatis")).toBeNull();
    expect(gteFn).toHaveBeenCalledWith("session_date", "2026-10-01");
    expect(ltFn).toHaveBeenCalledWith("session_date", "2026-11-01");
    expect(screen.getByLabelText("Pilih Periode Honor")).toBeDefined();
  });

  it("renders live estimate instead of zero totals when an open period is explicitly selected", async () => {
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: {
        ...guruProfile,
        minimum_income: 450000,
        allowances: [{ name: "Transport", amount: 400000 }],
      },
    } as never);

    vi.mocked(getTeacherPayrollStatement).mockResolvedValue({
      period: {
        id: "period-open-nov",
        period_month: "2026-11-01",
        status: "open",
        closed_at: null,
        closed_by: null,
        paid_at: null,
        paid_by: null,
        created_at: "2026-11-01T00:00:00Z",
        updated_at: "2026-11-01T00:00:00Z",
      },
      entry: null,
      lines: [],
      adjustments: [],
      totals: {
        fee_sessions_total: 0,
        fixed_allowances_total: 0,
        adjustments_total: 0,
        total_amount: 0,
      },
    });

    const gteFn = vi.fn().mockReturnThis();
    const ltFn = vi.fn().mockResolvedValue({
      data: [
        {
          id: "ts-nov-1",
          teaching_session_students: [
            { attendance_status: "present", teacher_fee_snapshot: 3000 },
          ],
        },
      ],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "payroll_periods") {
          return {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                { id: "period-open-nov", period_month: "2026-11-01", status: "open" },
              ],
              error: null,
            }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: gteFn.mockReturnValue({ lt: ltFn }),
        };
      }),
    } as never);

    const page = await HonorGuruPage({
      searchParams: Promise.resolve({ period: "period-open-nov" }),
    });
    render(page);

    expect(screen.getByText("Estimasi Berjalan")).toBeDefined();
    expect(screen.getByText("Rp 403.000")).toBeDefined();
    expect(screen.getByText("Rp 3.000")).toBeDefined();
    expect(screen.getAllByText("Rp 400.000")).toHaveLength(2);
    expect(gteFn).toHaveBeenCalledWith("session_date", "2026-11-01");
    expect(ltFn).toHaveBeenCalledWith("session_date", "2026-12-01");
    expect(screen.queryByText("Otomatis")).toBeNull();
  });

  it.each([
    ["period options", "order"],
    ["earned sessions", "lt"],
  ])("does not present incomplete financial data after a failed %s read", async (_case, failedRead) => {
    vi.mocked(requireGuruPage).mockResolvedValue({ profile: guruProfile } as never);
    vi.mocked(getOpenPayrollPeriod).mockResolvedValue(null);
    const outage = { data: null, error: { message: "QA financial read unavailable" } };
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue(failedRead === "order" ? outage : { data: [], error: null }),
        lt: vi.fn().mockResolvedValue(failedRead === "lt" ? outage : { data: [], error: null }),
      }),
    } as never);

    await expect(HonorGuruPage({ searchParams: Promise.resolve({}) }))
      .rejects.toThrow("QA financial read unavailable");
  });
});
