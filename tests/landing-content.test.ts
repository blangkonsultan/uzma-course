import { describe, it, expect } from "vitest";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";

describe("Landing Content Defaults (src/lib/landing-content.ts)", () => {
  it("contains all required landing section keys", () => {
    const requiredSections = [
      "hero",
      "programs",
      "why_us",
      "facilities",
      "team",
      "gallery",
      "testimonials",
      "videos",
      "locations",
      "faq",
      "cta",
      "footer",
      "navbar",
      "floating_wa",
    ] as const;

    for (const key of requiredSections) {
      expect(DEFAULT_LANDING_CONTENT[key]).toBeDefined();
    }
  });

  it("configures gallery section with the 3 default categories", () => {
    const { gallery } = DEFAULT_LANDING_CONTENT;
    expect(gallery.title).toBe("Galeri");
    expect(Array.isArray(gallery.groups)).toBe(true);

    const labels = gallery.groups.map((g) => g.label);
    expect(labels).toContain("Lisensi");
    expect(labels).toContain("Wisuda");
    expect(labels).toContain("Kegiatan Guru dan Murid");
  });

  it("configures navbar with brand and links", () => {
    const { navbar } = DEFAULT_LANDING_CONTENT;
    expect(navbar.brandName).toBe("Uzma Course");
    expect(navbar.navLinks.length).toBeGreaterThan(0);
    expect(navbar.navLinks.some((l) => l.href === "#programs")).toBe(true);
  });

  it("has floating WhatsApp enabled by default", () => {
    expect(DEFAULT_LANDING_CONTENT.floating_wa.isEnabled).toBe(true);
  });
});
