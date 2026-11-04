import { describe, it, expect } from "vitest";

// Protected boundary predicate representing Task 3 contract in src/app/sw.ts
export function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/guru") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logout")
  );
}

export function shouldPurgeCacheKey(cacheKey: string): boolean {
  return (
    cacheKey === "others" ||
    cacheKey === "uzma-pages-v2" ||
    cacheKey === "uzma-rsc-v2" ||
    cacheKey.includes("rsc-prefetch") ||
    cacheKey.includes("uzma-pages-cache") ||
    cacheKey.includes("uzma-rsc-cache")
  );
}

describe("PWA Service Worker Cache Isolation Rules (v3)", () => {
  it("strictly matches all private teacher, admin, auth, and api paths as protected", () => {
    expect(isProtectedPath("/guru")).toBe(true);
    expect(isProtectedPath("/guru/jadwal")).toBe(true);
    expect(isProtectedPath("/guru/absen")).toBe(true);
    expect(isProtectedPath("/guru/mengajar/123")).toBe(true);
    expect(isProtectedPath("/guru/honor")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(true);
    expect(isProtectedPath("/admin/spp")).toBe(true);
    expect(isProtectedPath("/admin/payroll")).toBe(true);
    expect(isProtectedPath("/api/auth/callback")).toBe(true);
    expect(isProtectedPath("/login")).toBe(true);
    expect(isProtectedPath("/logout")).toBe(true);
  });

  it("does not flag public pages as protected", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/#programs")).toBe(false);
    expect(isProtectedPath("/robots.txt")).toBe(false);
  });

  it("identifies legacy mixed caches (v2) and unsafe caches for purging upon activate", () => {
    expect(shouldPurgeCacheKey("others")).toBe(true);
    expect(shouldPurgeCacheKey("uzma-pages-v2")).toBe(true);
    expect(shouldPurgeCacheKey("uzma-rsc-v2")).toBe(true);
    expect(shouldPurgeCacheKey("pages-rsc-prefetch")).toBe(true);
    expect(shouldPurgeCacheKey("uzma-pages-cache")).toBe(true);
    expect(shouldPurgeCacheKey("uzma-rsc-cache")).toBe(true);
  });

  it("preserves precache and new public-only v3 caches", () => {
    expect(shouldPurgeCacheKey("serwist-precache-v2")).toBe(false);
    expect(shouldPurgeCacheKey("uzma-public-pages-v3")).toBe(false);
    expect(shouldPurgeCacheKey("uzma-public-rsc-v3")).toBe(false);
  });
});
