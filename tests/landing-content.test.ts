import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
  DEFAULT_LANDING_CONTENT,
  normalizeSocialLinks,
  getLandingContent,
  getLandingSectionContent,
} from "@/lib/landing-content";

// Mock @supabase/supabase-js createClient
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";

describe("Landing Content Layer (src/lib/landing-content.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  describe("DEFAULT_LANDING_CONTENT", () => {
    it("contains all 14 mandatory sections", () => {
      const keys = Object.keys(DEFAULT_LANDING_CONTENT);
      expect(keys).toContain("hero");
      expect(keys).toContain("programs");
      expect(keys).toContain("facilities");
      expect(keys).toContain("why_us");
      expect(keys).toContain("team");
      expect(keys).toContain("faq");
      expect(keys).toContain("cta");
      expect(keys).toContain("locations");
      expect(keys).toContain("testimonials");
      expect(keys).toContain("videos");
      expect(keys).toContain("gallery");
      expect(keys).toContain("footer");
      expect(keys).toContain("navbar");
      expect(keys).toContain("floating_wa");
    });
  });

  describe("normalizeSocialLinks", () => {
    it("filters and normalizes valid array of social items", () => {
      const input = [
        { platform: "instagram", url: "https://instagram.com/uzma", label: "IG" },
        { platform: "facebook", url: "", label: "Empty" },
        null,
        "not-an-object",
      ];
      const result = normalizeSocialLinks(input);
      expect(result).toHaveLength(1);
      expect(result[0].platform).toBe("instagram");
    });

    it("converts legacy object format with key-values to array", () => {
      const input = {
        instagram: "https://instagram.com/uzma",
        whatsapp: "https://wa.me/6281",
        youtube: "https://youtube.com/@uzma",
        facebook: "https://facebook.com/uzma",
        tiktok: "https://tiktok.com/@uzma",
      };
      const result = normalizeSocialLinks(input);
      expect(result).toHaveLength(5);
      expect(result.map((s) => s.platform)).toEqual([
        "instagram",
        "facebook",
        "tiktok",
        "youtube",
        "whatsapp",
      ]);
    });

    it("returns empty array for invalid inputs", () => {
      expect(normalizeSocialLinks(null)).toEqual([]);
      expect(normalizeSocialLinks(undefined)).toEqual([]);
      expect(normalizeSocialLinks("invalid")).toEqual([]);
      expect(normalizeSocialLinks(123)).toEqual([]);
    });
  });

  describe("getLandingContent", () => {
    it("falls back to DEFAULT_LANDING_CONTENT if env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      const content = await getLandingContent();
      expect(content.hero.title).toBe(DEFAULT_LANDING_CONTENT.hero.title);
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    });

    it("handles error response from supabase gracefully", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ data: null, error: new Error("DB Error") }),
        }),
      };
      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const content = await getLandingContent();
      expect(content).toBeDefined();
    });

    it("catches exception thrown during fetch", async () => {
      (createClient as unknown as Mock).mockImplementation(() => {
        throw new Error("Client initialization crash");
      });
      const content = await getLandingContent();
      expect(content).toBeDefined();
    });

    it("merges dynamic DB section content and programs", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "landing_content") {
            return {
              select: vi.fn().mockResolvedValue({
                data: [
                  { section: "hero", content: { title: "Custom Dynamic Hero" } },
                  { section: "footer", content: { copyrightText: "2026", socialLinks: [{ platform: "instagram", url: "https://ig.com" }] } },
                ],
                error: null,
              }),
            };
          }
          if (table === "programs") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        initials: "AHE",
                        name: "Anak Hebat",
                        tagline: "Baca Tulis",
                        description: "Desc",
                        age_range: "4-7",
                        icon: "BookOpen",
                        type: "franchise",
                        license_provider: "AHE Pusat",
                        license_url: "https://ahe.com",
                        license_description: "Lisensi resmi",
                        system: "Privat 1 on 1",
                        duration: 30,
                        frequency: 3,
                        features: ["Modul"],
                      },
                    ],
                  }),
                }),
              }),
            };
          }
          return { select: vi.fn() };
        }),
      };

      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const content = await getLandingContent();
      expect(content.hero.title).toBe("Custom Dynamic Hero");
      expect(content.programs.items[0].initials).toBe("AHE");
      expect(content.programs.items[0].licenseInfo?.provider).toBe("AHE Pusat");
    });
  });

  describe("getLandingSectionContent", () => {
    it("fetches single section and merges with fallback", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { content: { badgeText: "New Badge" } },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const hero = await getLandingSectionContent("hero");
      expect(hero.badgeText).toBe("New Badge");
    });

    it("fetches programs section and replaces with active program rows", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "landing_content") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { content: { title: "Daftar Program" } },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "programs") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [{ initials: "ASE", name: "Anak Pintar Berhitung" }],
                  }),
                }),
              }),
            };
          }
          return { select: vi.fn() };
        }),
      };

      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const programs = await getLandingSectionContent("programs");
      expect(programs.title).toBe("Daftar Program");
      expect(programs.items[0].initials).toBe("ASE");
    });

    it("normalizes footer social links when fetching footer section", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  content: {
                    socialLinks: { instagram: "https://ig.com/uzma" },
                  },
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const footer = await getLandingSectionContent("footer");
      expect(footer.socialLinks[0].platform).toBe("instagram");
    });

    it("returns fallback on error or exception", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockRejectedValue(new Error("Network crash")),
            }),
          }),
        }),
      };
      (createClient as unknown as Mock).mockReturnValue(mockSupabase);

      const hero = await getLandingSectionContent("hero");
      expect(hero.title).toBe(DEFAULT_LANDING_CONTENT.hero.title);
    });
  });
});
