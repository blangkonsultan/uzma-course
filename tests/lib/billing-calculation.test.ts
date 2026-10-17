import { describe, expect, it } from "vitest";
import {
  calculateCycleDates,
  formatInvoiceNumber,
  formatReceiptNumber,
  calculateTuitionDiscount,
} from "@/lib/billing-helpers";

describe("Billing & SPP calculation helpers", () => {
  describe("calculateCycleDates", () => {
    it("calculates exact 28-day period boundaries and due date for initial cycle", () => {
      const dates = calculateCycleDates("2026-10-05", 28, 0);
      expect(dates.period_start).toBe("2026-10-05");
      expect(dates.period_end).toBe("2026-11-01");
      expect(dates.due_date).toBe("2026-10-12"); // 7 days after period_start
    });

    it("calculates consecutive rolling 28-day cycles accurately", () => {
      const cycle1 = calculateCycleDates("2026-10-05", 28, 1);
      expect(cycle1.period_start).toBe("2026-11-02");
      expect(cycle1.period_end).toBe("2026-11-29");
      expect(cycle1.due_date).toBe("2026-11-09");

      const cycle2 = calculateCycleDates("2026-10-05", 28, 2);
      expect(cycle2.period_start).toBe("2026-11-30");
      expect(cycle2.period_end).toBe("2026-12-27");
    });

    it("handles year rollover gracefully", () => {
      const rollover = calculateCycleDates("2026-12-15", 28, 1);
      expect(rollover.period_start).toBe("2027-01-12");
      expect(rollover.period_end).toBe("2027-02-08");
    });
  });

  describe("formatInvoiceNumber & formatReceiptNumber", () => {
    it("formats standard accounting invoice numbers as INV-YYMM-NNNN", () => {
      expect(formatInvoiceNumber("2026-10-17", 1)).toBe("INV-2610-0001");
      expect(formatInvoiceNumber("2026-10-17", 45)).toBe("INV-2610-0045");
      expect(formatInvoiceNumber("2026-10-17", 1234)).toBe("INV-2610-1234");
    });

    it("formats standard accounting receipt numbers as RCT-YYMM-NNNN", () => {
      expect(formatReceiptNumber("2026-10-17", 1)).toBe("RCT-2610-0001");
      expect(formatReceiptNumber("2026-10-17", 99)).toBe("RCT-2610-0099");
    });
  });

  describe("calculateTuitionDiscount", () => {
    it("applies nominal discounts correctly", () => {
      const result = calculateTuitionDiscount(150000, "nominal", 15000);
      expect(result.discount_amount).toBe(15000);
      expect(result.total_amount).toBe(135000);
    });

    it("applies percentage discounts correctly", () => {
      const result = calculateTuitionDiscount(200000, "percentage", 10);
      expect(result.discount_amount).toBe(20000);
      expect(result.total_amount).toBe(180000);
    });

    it("handles zero or none discounts", () => {
      const result = calculateTuitionDiscount(150000, "none", 0);
      expect(result.discount_amount).toBe(0);
      expect(result.total_amount).toBe(150000);

      const nullType = calculateTuitionDiscount(150000, null, 0);
      expect(nullType.discount_amount).toBe(0);
      expect(nullType.total_amount).toBe(150000);
    });

    it("clamps discount so total_amount never drops below zero", () => {
      const excessive = calculateTuitionDiscount(100000, "nominal", 250000);
      expect(excessive.discount_amount).toBe(100000);
      expect(excessive.total_amount).toBe(0);
    });
  });
});
