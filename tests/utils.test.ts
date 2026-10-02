import { describe, it, expect } from "vitest";
import {
  cn,
  formatClassRatio,
  formatDuration,
  formatFrequency,
  formatFrequencyShort,
  normalizeImageUrl,
} from "@/lib/utils";

describe("Utility Functions (src/lib/utils.ts)", () => {
  describe("cn (Tailwind class merging)", () => {
    it("merges classes and resolves Tailwind conflicts correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", true && "text-blue-500")).toBe("text-blue-500");
      expect(cn("bg-white", false && "bg-black", null, undefined)).toBe("bg-white");
    });
  });

  describe("formatClassRatio", () => {
    it("formats 1 as Privat (1 on 1)", () => {
      expect(formatClassRatio(1)).toBe("Privat (1 on 1)");
      expect(formatClassRatio("1")).toBe("Privat (1 on 1)");
    });

    it("formats 2 as 1 guru max 2 murid", () => {
      expect(formatClassRatio(2)).toBe("1 guru max 2 murid");
      expect(formatClassRatio("2")).toBe("1 guru max 2 murid");
    });

    it("formats arbitrary numbers correctly", () => {
      expect(formatClassRatio(4)).toBe("1 guru max 4 murid");
      expect(formatClassRatio("6")).toBe("1 guru max 6 murid");
    expect(normalizeImageUrl("https://lh3.googleusercontent.com/d/1A2B3C4D5E6F?authuser=0")).toBe("https://lh3.googleusercontent.com/d/1A2B3C4D5E6F");
    expect(normalizeImageUrl("https://drive.google.com/uc?export=view&id=1A2B3C4D5E6F")).toBe("https://lh3.googleusercontent.com/d/1A2B3C4D5E6F");
    expect(normalizeImageUrl("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
      expect(formatClassRatio("")).toBe("-");
      expect(formatClassRatio(null as unknown as number)).toBe("-");
    });
  });

  describe("formatDuration", () => {
    it("formats minutes with 'menit' or 'jam'", () => {
      expect(formatDuration(30)).toBe("30 menit");
      expect(formatDuration(60)).toBe("1 jam");
      expect(formatDuration(90)).toBe("1 jam 30 menit");
      expect(formatDuration("45")).toBe("45 menit");
    });

    it("returns '-' for empty or invalid input", () => {
      expect(formatDuration("")).toBe("-");
      expect(formatDuration(null as unknown as number)).toBe("-");
    });
  });

  describe("formatFrequency and formatFrequencyShort", () => {
    it("formats full frequency with monthly calculation", () => {
      expect(formatFrequency(3)).toBe("3x / minggu (12x / bulan)");
      expect(formatFrequency("2")).toBe("2x / minggu (8x / bulan)");
    });

    it("formats short frequency", () => {
      expect(formatFrequencyShort(3)).toBe("3x / minggu");
      expect(formatFrequencyShort("2")).toBe("2x / minggu");
    });

    it("handles empty or invalid inputs", () => {
      expect(formatFrequency("")).toBe("-");
      expect(formatFrequencyShort("")).toBe("-");
    });
  });

  describe("normalizeImageUrl", () => {
    it("converts Google Drive share links to lh3 CDN URLs", () => {
      const driveShare = "https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing";
      expect(normalizeImageUrl(driveShare)).toBe("https://lh3.googleusercontent.com/d/1A2B3C4D5E6F");
    });

    it("converts Google Drive open/uc links to lh3 CDN URLs", () => {
      const driveOpen = "https://drive.google.com/open?id=1A2B3C4D5E6F";
      expect(normalizeImageUrl(driveOpen)).toBe("https://lh3.googleusercontent.com/d/1A2B3C4D5E6F");
    });

    it("leaves standard web and local image URLs intact", () => {
      expect(normalizeImageUrl("/images/hero.webp")).toBe("/images/hero.webp");
      expect(normalizeImageUrl("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
    });

    it("returns empty string for empty input", () => {
      expect(normalizeImageUrl("")).toBe("");
      expect(normalizeImageUrl(null as unknown as string)).toBe("");
    });
  });
});
