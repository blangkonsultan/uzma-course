import { describe, expect, it } from "vitest";
import { normalizeImageUrl } from "@/lib/utils";

describe("normalizeImageUrl", () => {
  it.each([
    "javascript:alert(document.domain)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
  ])("rejects dangerous image scheme %s", (url) => {
    expect(normalizeImageUrl(url)).toBe("");
  });

  it("converts protocol-relative URLs to HTTPS", () => {
    expect(normalizeImageUrl("//example.com/photo.jpg")).toBe(
      "https://example.com/photo.jpg"
    );
  });

  it("preserves clean local and HTTPS image URLs", () => {
    expect(normalizeImageUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
    expect(normalizeImageUrl("https://example.com/photo.jpg")).toBe(
      "https://example.com/photo.jpg"
    );
  });

  it("converts Google Drive file links to the direct CDN URL", () => {
    expect(normalizeImageUrl("https://drive.google.com/file/d/file-123/view")).toBe(
      "https://lh3.googleusercontent.com/d/file-123"
    );
    expect(normalizeImageUrl("https://drive.google.com/open?id=file_456")).toBe(
      "https://lh3.googleusercontent.com/d/file_456"
    );
    expect(normalizeImageUrl("https://drive.google.com/uc?id=file-789")).toBe(
      "https://lh3.googleusercontent.com/d/file-789"
    );
  });

  it("normalizes an existing Googleusercontent CDN link", () => {
    expect(
      normalizeImageUrl("https://lh5.googleusercontent.com/d/drive-file_123?width=1200")
    ).toBe("https://lh3.googleusercontent.com/d/drive-file_123");
  });
});
