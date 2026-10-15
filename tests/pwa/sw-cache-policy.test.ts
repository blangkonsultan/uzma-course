import { describe, it, expect } from "vitest";

// Test the matching rule logic for sensitive routes
function isSensitiveRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logout")
  );
}

function shouldPurgeCache(cacheKey: string): boolean {
  return (
    cacheKey === "others" ||
    cacheKey.includes("rsc-prefetch") ||
    cacheKey.includes("uzma-pages-cache") ||
    cacheKey.includes("uzma-rsc-cache")
  );
}

describe("PWA Service Worker Cache Isolation Rules", () => {
  it("strictly matches admin, auth, and api paths as sensitive", () => {
    expect(isSensitiveRoute("/admin")).toBe(true);
    expect(isSensitiveRoute("/admin/guru")).toBe(true);
    expect(isSensitiveRoute("/admin/murid")).toBe(true);
    expect(isSensitiveRoute("/api/auth/callback")).toBe(true);
    expect(isSensitiveRoute("/login")).toBe(true);
    expect(isSensitiveRoute("/logout")).toBe(true);
  });

  it("does not flag public and guru operational pages as sensitive", () => {
    expect(isSensitiveRoute("/")).toBe(false);
    expect(isSensitiveRoute("/guru")).toBe(false);
    expect(isSensitiveRoute("/guru/absen")).toBe(false);
    expect(isSensitiveRoute("/guru/profil")).toBe(false);
  });

  it("identifies legacy and unsafe response caches for purging upon activate", () => {
    expect(shouldPurgeCache("others")).toBe(true);
    expect(shouldPurgeCache("pages-rsc-prefetch")).toBe(true);
    expect(shouldPurgeCache("uzma-pages-cache")).toBe(true);
    expect(shouldPurgeCache("uzma-rsc-cache")).toBe(true);
  });

  it("preserves precache and versioned safe caches", () => {
    expect(shouldPurgeCache("serwist-precache-v2")).toBe(false);
    expect(shouldPurgeCache("uzma-pages-v2")).toBe(false);
    expect(shouldPurgeCache("uzma-rsc-v2")).toBe(false);
  });
});
