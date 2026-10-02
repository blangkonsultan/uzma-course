import { describe, it, expect } from "vitest";
import { extractVideoId, buildEmbedUrl, VIDEO_PREFIXES } from "@/lib/video-helpers";

describe("Video Helpers (src/lib/video-helpers.ts)", () => {
  describe("extractVideoId", () => {
    it("handles empty or falsy inputs", () => {
      expect(extractVideoId("", "youtube")).toBe("");
      expect(extractVideoId("", "tiktok")).toBe("");
    });

    describe("youtube", () => {
      it("extracts direct 11-character video ID", () => {
        expect(extractVideoId("dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
      });

      it("extracts from standard watch URL", () => {
        expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
        expect(extractVideoId("https://youtube.com/watch?feature=shared&v=dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
      });

      it("extracts from short URL youtu.be", () => {
        expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
      });

      it("extracts from embed URL", () => {
        expect(extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
      });

      it("extracts from shorts URL", () => {
        expect(extractVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ", "youtube")).toBe("dQw4w9WgXcQ");
      });

      it("returns trimmed input if no pattern matches", () => {
        expect(extractVideoId("custom-unknown-str", "youtube")).toBe("custom-unknown-str");
      });
    });

    describe("tiktok", () => {
      it("extracts direct numeric ID", () => {
        expect(extractVideoId("7683120078589611285", "tiktok")).toBe("7683120078589611285");
      });

      it("extracts from video path URL", () => {
        expect(extractVideoId("https://www.tiktok.com/@user/video/7683120078589611285", "tiktok")).toBe("7683120078589611285");
      });

      it("extracts from player URL", () => {
        expect(extractVideoId("https://www.tiktok.com/player/v1/7683120078589611285", "tiktok")).toBe("7683120078589611285");
      });

      it("extracts from embed URL", () => {
        expect(extractVideoId("https://www.tiktok.com/embed/v2/7683120078589611285", "tiktok")).toBe("7683120078589611285");
        expect(extractVideoId("https://www.tiktok.com/embed/7683120078589611285", "tiktok")).toBe("7683120078589611285");
      });

      it("returns trimmed input if no pattern matches", () => {
        expect(extractVideoId("not-a-number", "tiktok")).toBe("not-a-number");
      });
    });
  });

  describe("buildEmbedUrl", () => {
    it("returns empty string on empty input", () => {
      expect(buildEmbedUrl("", "youtube")).toBe("");
      expect(buildEmbedUrl("", "tiktok")).toBe("");
    });

    it("constructs correct YouTube embed URL", () => {
      expect(buildEmbedUrl("dQw4w9WgXcQ", "youtube")).toBe(`${VIDEO_PREFIXES.youtube}dQw4w9WgXcQ`);
    });

    it("constructs correct TikTok embed URL", () => {
      expect(buildEmbedUrl("7683120078589611285", "tiktok")).toBe(`${VIDEO_PREFIXES.tiktok}7683120078589611285`);
    });
  });
});
