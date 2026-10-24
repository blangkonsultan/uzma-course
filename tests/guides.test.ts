import { describe, expect, it } from "vitest";
import {
  createGuideIndex,
  filterGuideIndex,
  resolveGuideArticle,
} from "@/lib/guides/navigation";
import type { GuideArticle, GuideDefinition } from "@/types/guides";

function article(slug: string, title: string, keywords: readonly string[] = []): GuideArticle {
  return {
    slug,
    title,
    summary: "Synthetic tutorial for topic selection.",
    keywords,
    prerequisites: ["Use a test account."],
    groups: [{ id: "read", steps: [{ title: "Read", paragraphs: ["Read the selected task."] }], screenshots: [] }],
    expected: ["The requested task is selected."],
    systemRules: [],
    recommendations: [],
    troubleshooting: [],
  };
}

const adminFixture: GuideDefinition = {
  role: "admin",
  title: "Admin fixture",
  description: "Synthetic admin guide.",
  defaultTopic: "mulai",
  chapters: [
    { id: "basics", title: "Basics fixture", articles: [article("mulai", "Intro fixture")] },
    { id: "finance", title: "Finance fixture", articles: [article("spp-catat-pembayaran", "Payment fixture", ["kwitansi"])] },
  ],
};
const guruFixture: GuideDefinition = {
  role: "guru",
  title: "Guru fixture",
  description: "Synthetic teacher guide.",
  defaultTopic: "mulai",
  chapters: [{ id: "basics", title: "Teacher basics", articles: [article("mulai", "Teacher intro")] }],
};

const invalidSelectors: Array<[string, string | string[] | undefined]> = [
  ["missing", undefined],
  ["unknown", "unknown"],
  ["empty", ""],
  ["prototype-looking", "__proto__"],
  ["repeated", ["mulai", "spp-catat-pembayaran"]],
];

describe("guide topic selection", () => {
  it("selects an existing task instead of the introduction", () => {
    expect(resolveGuideArticle(adminFixture, "spp-catat-pembayaran").slug).toBe("spp-catat-pembayaran");
  });

  it.each(invalidSelectors)("uses the role introduction for a %s selector", (_name, value) => {
    expect(resolveGuideArticle(adminFixture, value).slug).toBe("mulai");
  });

  it("does not select a task that belongs only to another role", () => {
    expect(resolveGuideArticle(guruFixture, "spp-catat-pembayaran").slug).toBe("mulai");
  });
});

describe("guide navigation search", () => {
  const index = createGuideIndex(adminFixture);

  it("matches authored keywords despite surrounding whitespace and different case", () => {
    expect(filterGuideIndex(index, "  KWITANSI  ").map((item) => item.slug)).toEqual(["spp-catat-pembayaran"]);
  });

  it("lets readers find tasks by their chapter", () => {
    expect(filterGuideIndex(index, "finance fixture").map((item) => item.slug)).toEqual(["spp-catat-pembayaran"]);
  });

  it("restores ordered topics when a search is cleared", () => {
    expect(filterGuideIndex(index, "   ").map((item) => item.slug)).toEqual(["mulai", "spp-catat-pembayaran"]);
  });

  it("returns no unrelated tasks for an unmatched search", () => {
    expect(filterGuideIndex(index, "no-such-task")).toEqual([]);
  });
});
