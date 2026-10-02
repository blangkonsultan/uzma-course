/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { formatTimeString, formatDateString, formatClassRatio, formatFrequency, formatFrequencyShort } from "@/lib/utils";

describe("Utils (src/lib/utils.ts) New Functions", () => {
  describe("formatTimeString", () => {
    it("formats full time strings correctly", () => {
      expect(formatTimeString("09:00:00")).toBe("09:00");
      expect(formatTimeString("15:30:45")).toBe("15:30");
    });

    it("handles null or undefined safely", () => {
      expect(formatTimeString(null)).toBe("");
      expect(formatTimeString(undefined)).toBe("");
      expect(formatTimeString("")).toBe("");
    });

    it("handles malformed strings safely", () => {
      expect(formatTimeString("0900")).toBe("0900");
    });
  });

  describe("formatDateString", () => {
    it("formats ISO date strings correctly", () => {
      // Testing with a specific date
      const result = formatDateString("2026-10-15");
      expect(result).toMatch(/15 Okt(ober)? 2026/); // Accommodate different locale output variations in Node
    });

    it("handles null or undefined safely", () => {
      expect(formatDateString(null)).toBe("");
      expect(formatDateString(undefined)).toBe("");
      expect(formatDateString("")).toBe("");
    });

    it("handles invalid dates by returning the raw string", () => {
      expect(formatDateString("invalid-date")).toBe("invalid-date");
    });
  });

  describe("formatClassRatio", () => {
    it("formats ratios correctly", () => {
      expect(formatClassRatio(1)).toBe("Privat (1 on 1)");
      expect(formatClassRatio("2")).toBe("1 guru max 2 murid");
      expect(formatClassRatio(0)).toBe("-");
      expect(formatClassRatio(null as any)).toBe("-");
    });
  });

  describe("formatFrequency", () => {
    it("formats frequency correctly", () => {
      expect(formatFrequency(3)).toBe("3x / minggu (12x / bulan)");
      expect(formatFrequency("2")).toBe("2x / minggu (8x / bulan)");
      expect(formatFrequency(0)).toBe("-");
      
      expect(formatFrequencyShort(3)).toBe("3x / minggu");
      expect(formatFrequencyShort("0")).toBe("-");
    });
  });
});
