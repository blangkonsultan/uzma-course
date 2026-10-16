import { describe, expect, it } from "vitest";
import {
  calculatePayrollTotals,
  type PayrollSessionLineCalculationItem,
  type ProfileAllowanceItem,
  type PayrollAdjustmentCalculationItem,
} from "@/lib/payroll";

const lines: PayrollSessionLineCalculationItem[] = [
  { attendance_status: "present", payable_amount: 3000 },
  { attendance_status: "absent", payable_amount: 0 },
  { attendance_status: "excused", payable_amount: 0 },
  { attendance_status: "cancelled", payable_amount: 0 },
  { attendance_status: "present", payable_amount: 4000 },
];

const allowances: ProfileAllowanceItem[] = [
  { name: "Transport", amount: 60000 },
  { name: "Kreativitas", amount: 50000 },
];

const adjustments: PayrollAdjustmentCalculationItem[] = [
  { amount: 15000 },
  { amount: -5000 },
];

describe("calculatePayrollTotals", () => {
  it("sums payable lines, fixed allowances, and signed adjustments", () => {
    const totals = calculatePayrollTotals(lines, allowances, adjustments);

    expect(totals).toEqual({
      fee_sessions_total: 7000,
      fixed_allowances_total: 110000,
      adjustments_total: 10000,
      total_amount: 127000,
    });
  });

  it("handles empty lines and allowances safely for zero-fee teachers", () => {
    const totals = calculatePayrollTotals([], [], []);

    expect(totals).toEqual({
      fee_sessions_total: 0,
      fixed_allowances_total: 0,
      adjustments_total: 0,
      total_amount: 0,
    });
  });
});
