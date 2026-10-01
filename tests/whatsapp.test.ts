import { describe, it, expect } from "vitest";
import { buildWaLink } from "@/lib/whatsapp";
import { WA_BASE_URL } from "@/lib/constants";

describe("WhatsApp Link Builder (src/lib/whatsapp.ts)", () => {
  it("generates default inquiry message when context is omitted", () => {
    const link = buildWaLink();
    expect(link.startsWith(WA_BASE_URL)).toBe(true);
    expect(link).toContain(encodeURIComponent("Halo Uzma Course, saya ingin informasi lebih lanjut."));
  });

  it("embeds context into inquiry message when provided", () => {
    const link = buildWaLink("Program AHE");
    expect(link.startsWith(WA_BASE_URL)).toBe(true);
    expect(link).toContain(encodeURIComponent("Halo Uzma Course, saya ingin bertanya tentang Program AHE."));
  });
});
