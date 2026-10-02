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

import * as Constants from "@/lib/constants";

describe("Constants (src/lib/constants.ts)", () => {
  it("exports valid site constants", () => {
    expect(Constants.SITE_NAME).toBe("Uzma Course");
    expect(Constants.TAGLINE).toBe("Reader now, Leader tomorrow!");
    expect(Constants.WA_NUMBER).toBe("6285730332379");
    expect(Constants.FACILITIES.length).toBeGreaterThan(0);
    expect(Constants.FOUNDER.name).toBe("Nurul Ilmi Mega Puspita, S.Pd.");
  });
});
