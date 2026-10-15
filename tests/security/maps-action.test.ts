import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { extractCoordinatesFromUrl } from "@/lib/maps";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({
    user: { id: "admin-1" },
    profile: { role: "admin" },
  }),
}));

describe("extractCoordinatesFromUrl", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws or rejects when caller is not an admin", async () => {
    vi.mocked(requireAdminAction).mockRejectedValueOnce(
      new Error("Hanya admin yang memiliki izin untuk operasi ini.")
    );
    await expect(
      extractCoordinatesFromUrl("https://maps.app.goo.gl/xyz")
    ).rejects.toThrow("Hanya admin");
  });

  it("rejects non-HTTPS URLs", async () => {
    const res = await extractCoordinatesFromUrl(
      "http://maps.google.com/?q=@-7.432,112.505"
    );
    expect(res).toEqual({ error: "Hanya tautan HTTPS yang diperbolehkan." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects non-Google hosts even if goo.gl appears in the path or query", async () => {
    const res = await extractCoordinatesFromUrl(
      "https://127.0.0.1:9999/private?marker=goo.gl"
    );
    expect(res).toEqual({
      error: "Hanya tautan resmi Google Maps yang didukung.",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid URL syntax", async () => {
    const res = await extractCoordinatesFromUrl("not a url");
    expect(res).toEqual({ error: "Format URL tidak valid." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("extracts coordinates from direct Google Maps URL", async () => {
    const res = await extractCoordinatesFromUrl(
      "https://www.google.com/maps/@-7.4320527,112.5054893,17z"
    );
    expect(res).toEqual({ latitude: -7.4320527, longitude: 112.5054893 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("follows Google shortlink redirect and extracts coordinates", async () => {
    const targetUrl =
      "https://www.google.com/maps/@-7.4062116,112.6081986,17z";
    vi.mocked(global.fetch).mockResolvedValueOnce({
      url: targetUrl,
      status: 302,
    } as unknown as Response);

    const res = await extractCoordinatesFromUrl(
      "https://maps.app.goo.gl/validShortlink"
    );
    expect(res).toEqual({ latitude: -7.4062116, longitude: 112.6081986 });
  });
});
