import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveTikTokShortlink } from "@/app/admin/landing/actions";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({
    user: { id: "admin-1" },
    profile: { role: "admin" },
  }),
}));

describe("resolveTikTokShortlink", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects invalid URL syntax before fetching", async () => {
    const result = await resolveTikTokShortlink("not a URL");

    expect(result).toEqual({ error: "Format URL tidak valid." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects non-HTTPS TikTok URLs before fetching", async () => {
    const result = await resolveTikTokShortlink(
      "http://www.tiktok.com/@uzma/video/7683120078589611285"
    );

    expect(result).toEqual({
      error: "Protokol tautan harus menggunakan HTTPS.",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    "https://evil-tiktok.com/@uzma/video/7683120078589611285",
    "https://127.0.0.1:8080/private?marker=tiktok.com",
    "https://evil.tiktok.com/@uzma/video/7683120078589611285",
  ])("rejects unapproved host %s before fetching", async (url) => {
    const result = await resolveTikTokShortlink(url);

    expect(result).toEqual({
      error:
        "Tautan harus berasal dari domain resmi TikTok (tiktok.com, vt.tiktok.com, vm.tiktok.com).",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects URLs containing credentials before fetching", async () => {
    const result = await resolveTikTokShortlink(
      "https://admin:secret@www.tiktok.com/@uzma/video/7683120078589611285"
    );

    expect(result).toEqual({
      error: "Tautan tidak boleh memuat kredensial pengguna.",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    "https://vt.tiktok.com/ZS12345",
    "https://vm.tiktok.com/ZS12345",
    "https://m.tiktok.com/@uzma/video/7683120078589611285",
    "https://www.tiktok.com/@uzma/video/7683120078589611285",
  ])("resolves approved TikTok URL %s", async (url) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      url: "https://www.tiktok.com/@uzma/video/7683120078589611285",
    } as Response);

    const result = await resolveTikTokShortlink(url);

    expect(result).toEqual({ videoId: "7683120078589611285" });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    "https://evil.example.com/@uzma/video/7683120078589611285",
    "https://evil.tiktok.com/@uzma/video/7683120078589611285",
    "https://user:secret@www.tiktok.com/@uzma/video/7683120078589611285",
    "http://www.tiktok.com/@uzma/video/7683120078589611285",
  ])("rejects an unsafe final redirect %s", async (finalUrl) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      url: finalUrl,
    } as Response);

    const result = await resolveTikTokShortlink("https://vt.tiktok.com/ZS12345");

    expect(result).toEqual({
      error: "Pengalihan tautan mengarah ke domain di luar TikTok.",
    });
  });

  it.each([
    "https://www.tiktok.com/@uzma/video/12345678901234567890123",
    "https://www.tiktok.com/@uzma/video/12345678901234567abc",
  ])("rejects a video path without an exact numeric ID boundary: %s", async (finalUrl) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      url: finalUrl,
    } as Response);

    const result = await resolveTikTokShortlink("https://vt.tiktok.com/ZS12345");

    expect(result).toEqual({
      error:
        "Tidak dapat mengekstrak ID video dari tautan tersebut. Pastikan video bersifat publik.",
    });
  });

  it("propagates admin authorization failures", async () => {
    vi.mocked(requireAdminAction).mockRejectedValueOnce(
      new Error("Hanya admin yang memiliki izin untuk operasi ini.")
    );

    await expect(
      resolveTikTokShortlink("https://vt.tiktok.com/ZS12345")
    ).rejects.toThrow("Hanya admin");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
