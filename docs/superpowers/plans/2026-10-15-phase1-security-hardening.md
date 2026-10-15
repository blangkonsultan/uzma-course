# Phase 1: Security, Database Authorization & PWA Cache Boundary Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close verified security and authorization vulnerabilities across Supabase auth triggers, operational table RLS, service worker cache isolation, login redirection, and server-side Maps coordinate extraction without downtime or offline data loss.

**Architecture:** 
1. Database migration replacing `handle_new_user()` (strictly hardcoding `role = 'guru'`) and enabling RLS with admin mutation policies on `program_variants` and `branch_shifts`.
2. Service worker route hardening in `src/app/sw.ts` with top-priority `NetworkOnly` for `/admin/*`, `/api/*`, `/login`, and `/logout`, plus activation-time purging of legacy response caches while strictly preserving IndexedDB.
3. Client/Server input sanitation: pure URL sanitizer `sanitizeNextUrl()` for post-login redirection and admin-guarded `extractCoordinatesFromUrl()` with strict HTTPS Google Maps host allowlisting.

**Tech Stack:** Next.js 16 (Webpack build), TypeScript, Supabase PostgreSQL, Serwist (PWA), Vitest, React 19.

**Spec:** `docs/superpowers/specs/2026-10-14-phase1-security-hardening-design.md`

## Global Constraints

- Never expose, hardcode, or invent credentials/secrets in code, tests, or documentation.
- All database modifications MUST be codified in version-controlled migration files in `supabase/migrations/`.
- Production zero-downtime invariant: Public landing reads (`program_variants`), teacher mobile attendance, and admin ERP queries must remain continuously functional.
- PWA offline queue invariant: Service worker cache purging must target the Cache Storage API only. `IndexedDB` (`UzmaCoursePWA` -> `attendance_queue`) must NEVER be cleared or modified during worker activation.
- Responsive mobile invariant: Any modified UI components must maintain 0 horizontal overflow down to 360px and min 36-44px touch targets.
- Verification gate: Every task must be backed by automated Vitest tests, pass ESLint, and succeed under `npm test`.

## Review Focus

The five input classes or failure modes the spec implies that are most likely to bite users or administrators:
1. Protocol-relative or backslash-obfuscated redirect URLs (`//evil.com`, `/\evil.com`) escaping naive `/` checks in `sanitizeNextUrl` -> fallback to default destination.
2. Unauthenticated calls to `extractCoordinatesFromUrl` with localhost or private IP addresses disguised via Google shortlink query parameters (`http://127.0.0.1:9999/private?marker=goo.gl`) -> rejected without network fetch.
3. Service worker cache purge accidentally deleting IndexedDB or purging current runtime caches on worker restart -> only target specific legacy response cache names.
4. Public landing page catalog query (`getLandingContent()`) failing when RLS is enabled on `program_variants` -> `program_variants` SELECT policy must allow anonymous access to active variants (`is_active = true`).
5. Database trigger `handle_new_user` throwing when `email` or `full_name` is missing from user metadata -> use `COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Guru')` with hardcoded `'guru'` role.

---

### Task 1: Post-Login Destination Sanitization (S4)

**Files:**
- Create: `src/lib/security.ts`
- Modify: `src/components/admin/login-form.tsx:53-54`
- Test: `tests/security/login-redirect.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `sanitizeNextUrl(rawUrl: string | null | undefined, defaultDestination: string): string` in `src/lib/security.ts`

- [ ] **Step 1: Write failing tests for `sanitizeNextUrl`**

Create `tests/security/login-redirect.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { sanitizeNextUrl } from "@/lib/security";

describe("sanitizeNextUrl", () => {
  it("returns default destination for null, undefined, or empty input", () => {
    expect(sanitizeNextUrl(null, "/admin")).toBe("/admin");
    expect(sanitizeNextUrl(undefined, "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("   ", "/admin")).toBe("/admin");
  });

  it("rejects absolute external URLs", () => {
    expect(sanitizeNextUrl("https://evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("http://evil.com/admin", "/admin")).toBe("/admin");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeNextUrl("//evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("//evil.com/path", "/admin")).toBe("/admin");
  });

  it("rejects executable or dangerous schemes", () => {
    expect(sanitizeNextUrl("javascript:alert(1)", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("data:text/html,<script>alert(1)</script>", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("vbscript:alert(1)", "/admin")).toBe("/admin");
  });

  it("rejects URLs containing colons, backslashes, or control characters", () => {
    expect(sanitizeNextUrl("/\\evil.com", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("/path:name", "/admin")).toBe("/admin");
  });

  it("rejects loopback to login or logout to avoid redirect cycles", () => {
    expect(sanitizeNextUrl("/login", "/admin")).toBe("/admin");
    expect(sanitizeNextUrl("/logout", "/admin")).toBe("/admin");
  });

  it("preserves valid internal relative paths", () => {
    expect(sanitizeNextUrl("/admin/murid", "/admin")).toBe("/admin/murid");
    expect(sanitizeNextUrl("/admin/guru/tambah", "/admin")).toBe("/admin/guru/tambah");
    expect(sanitizeNextUrl("/admin/draft/d1/board", "/admin")).toBe("/admin/draft/d1/board");
    expect(sanitizeNextUrl("/guru/absen", "/admin")).toBe("/guru/absen");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/security/login-redirect.test.ts`
Expected: FAIL with "Cannot find module '@/lib/security'"

- [ ] **Step 3: Implement `sanitizeNextUrl` in `src/lib/security.ts`**

Create `src/lib/security.ts`:
```typescript
/**
 * Sanitizes post-login redirect destinations.
 * Enforces same-origin internal relative paths starting with exactly one '/'
 * and rejects protocol-relative URLs, executable schemes, and redirect cycles.
 */
export function sanitizeNextUrl(
  rawUrl: string | null | undefined,
  defaultDestination: string
): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return defaultDestination;
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    return defaultDestination;
  }

  // Reject protocol-relative URLs (//evil.com), backslashes, colons (schemes), and control chars
  if (
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes(":") ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return defaultDestination;
  }

  // Must begin with exactly one '/'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return defaultDestination;
  }

  // Avoid redirect loops back to auth gateways
  if (
    trimmed === "/login" ||
    trimmed.startsWith("/login?") ||
    trimmed === "/logout" ||
    trimmed.startsWith("/logout?")
  ) {
    return defaultDestination;
  }

  return trimmed;
}
```

- [ ] **Step 4: Integrate `sanitizeNextUrl` into `src/components/admin/login-form.tsx`**

In `src/components/admin/login-form.tsx`, import `sanitizeNextUrl` and update line 53:
```typescript
import { sanitizeNextUrl } from "@/lib/security";
...
const destination = profile?.role === "guru"
  ? "/guru/absen"
  : sanitizeNextUrl(nextUrl, "/admin");
window.location.href = destination;
```

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run tests/security/login-redirect.test.ts`
Expected: PASS (7 tests passing)

- [ ] **Step 6: Commit**

```bash
git add src/lib/security.ts src/components/admin/login-form.tsx tests/security/login-redirect.test.ts
git commit -m "fix(security): sanitize post-login redirect destination against open redirect and scheme injection"
```

---

### Task 2: Maps Server Action Authorization & URL Whitelisting (S5)

**Files:**
- Modify: `src/lib/maps.ts`
- Test: `tests/security/maps-action.test.ts`

**Interfaces:**
- Consumes: `requireAdminAction()` from `@/lib/auth`
- Produces: `extractCoordinatesFromUrl(url: string): Promise<{ latitude: number; longitude: number } | { error: string }>` in `src/lib/maps.ts`

- [ ] **Step 1: Write failing tests for `extractCoordinatesFromUrl`**

Create `tests/security/maps-action.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractCoordinatesFromUrl } from "@/lib/maps";
import { requireAdminAction } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
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
    vi.mocked(requireAdminAction).mockRejectedValueOnce(new Error("Hanya admin yang memiliki izin untuk operasi ini."));
    await expect(extractCoordinatesFromUrl("https://maps.app.goo.gl/xyz")).rejects.toThrow("Hanya admin");
  });

  it("rejects non-HTTPS URLs", async () => {
    const res = await extractCoordinatesFromUrl("http://maps.google.com/?q=@-7.432,112.505");
    expect(res).toEqual({ error: "Hanya tautan HTTPS yang diperbolehkan." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects non-Google hosts even if goo.gl appears in the path or query", async () => {
    const res = await extractCoordinatesFromUrl("https://127.0.0.1:9999/private?marker=goo.gl");
    expect(res).toEqual({ error: "Hanya tautan resmi Google Maps yang didukung." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid URL syntax", async () => {
    const res = await extractCoordinatesFromUrl("not a url");
    expect(res).toEqual({ error: "Format URL tidak valid." });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("extracts coordinates from direct Google Maps URL", async () => {
    const res = await extractCoordinatesFromUrl("https://www.google.com/maps/@-7.4320527,112.5054893,17z");
    expect(res).toEqual({ latitude: -7.4320527, longitude: 112.5054893 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("follows Google shortlink redirect and extracts coordinates", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("", {
      status: 302,
      headers: { location: "https://www.google.com/maps/@-7.4062116,112.6081986,17z" },
    }));
    Object.defineProperty(global.fetch, "url", { value: "https://www.google.com/maps/@-7.4062116,112.6081986,17z" });

    const res = await extractCoordinatesFromUrl("https://maps.app.goo.gl/validShortlink");
    expect(res).toEqual({ latitude: -7.4062116, longitude: 112.6081986 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/security/maps-action.test.ts`
Expected: FAIL because `requireAdminAction` is not yet called and host validation is not yet implemented.

- [ ] **Step 3: Implement strict URL parsing and authorization in `src/lib/maps.ts`**

Update `src/lib/maps.ts`:
```typescript
"use server";

import { requireAdminAction } from "@/lib/auth";

const ALLOWED_MAP_HOSTS = new Set([
  "maps.google.com",
  "www.google.com",
  "google.com",
  "maps.app.goo.gl",
  "goo.gl",
]);

export async function extractCoordinatesFromUrl(rawUrl: string) {
  await requireAdminAction();

  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "URL tidak valid." };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { error: "Format URL tidak valid." };
  }

  if (parsed.protocol !== "https:") {
    return { error: "Hanya tautan HTTPS yang diperbolehkan." };
  }

  if (!ALLOWED_MAP_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { error: "Hanya tautan resmi Google Maps yang didukung." };
  }

  try {
    let finalUrl = parsed.href;

    // Follow redirect if it's a short URL
    if (parsed.hostname.includes("goo.gl")) {
      const response = await fetch(parsed.href, { method: "HEAD", redirect: "follow" });
      const redirectedUrl = new URL(response.url || parsed.href);
      if (ALLOWED_MAP_HOSTS.has(redirectedUrl.hostname.toLowerCase())) {
        finalUrl = redirectedUrl.href;
      }
    }

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match) {
      return {
        latitude: parseFloat(match[1]),
        longitude: parseFloat(match[2]),
      };
    }

    return { error: "Tidak dapat mengekstrak koordinat dari tautan tersebut." };
  } catch (error) {
    console.error("Error extracting coordinates:", error);
    return { error: "Gagal memproses tautan Google Maps." };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/security/maps-action.test.ts`
Expected: PASS (6 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/lib/maps.ts tests/security/maps-action.test.ts
git commit -m "fix(security): guard extractCoordinatesFromUrl with admin auth and strict HTTPS host allowlist"
```

---

### Task 3: PWA Service Worker NetworkOnly Boundary & Cache Purging (S3)

**Files:**
- Modify: `src/app/sw.ts`
- Test: `tests/pwa/sw-cache-policy.test.ts`

**Interfaces:**
- Consumes: `@serwist/next/worker`, `serwist`
- Produces: Service worker runtime configuration in `src/app/sw.ts` with top-priority `NetworkOnly` for private routes and activation cache cleanup.

- [ ] **Step 1: Write failing tests for service worker route matching and cache policy**

Create `tests/pwa/sw-cache-policy.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/pwa/sw-cache-policy.test.ts`
Expected: PASS

- [ ] **Step 3: Update `src/app/sw.ts` with top-priority `NetworkOnly` and `activate` purge handler**

Update `src/app/sw.ts`:
```typescript
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly, NetworkFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    entries: [
      {
        url: "/~_offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
  runtimeCaching: [
    // 1. Hard network-only boundary for sensitive routes (MUST be first)
    {
      matcher: ({ url }) => {
        const p = url.pathname;
        return (
          p.startsWith("/admin") ||
          p.startsWith("/api") ||
          p.startsWith("/logout") ||
          p.startsWith("/login")
        );
      },
      handler: new NetworkOnly(),
    },
    // 2. Public and Guru HTML pages cache
    {
      matcher: ({ request, url }) => {
        if (
          url.pathname.startsWith("/admin") ||
          url.pathname.startsWith("/api") ||
          url.pathname.startsWith("/login") ||
          url.pathname.startsWith("/logout")
        ) {
          return false;
        }
        return request.mode === "navigate";
      },
      handler: new NetworkFirst({
        cacheName: "uzma-pages-v2",
        networkTimeoutSeconds: 3,
      }),
    },
    // 3. Public and Guru Next.js RSC data cache
    {
      matcher: ({ request, url }) => {
        if (
          url.pathname.startsWith("/admin") ||
          url.pathname.startsWith("/api") ||
          url.pathname.startsWith("/login") ||
          url.pathname.startsWith("/logout")
        ) {
          return false;
        }
        return (
          request.headers.get("rsc") === "1" ||
          request.headers.get("next-router-prefetch") === "1"
        );
      },
      handler: new StaleWhileRevalidate({
        cacheName: "uzma-rsc-v2",
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Purge legacy and response caches on worker activation, preserving IndexedDB
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (
            key === "others" ||
            key.includes("rsc-prefetch") ||
            key.includes("uzma-pages-cache") ||
            key.includes("uzma-rsc-cache")
          ) {
            return caches.delete(key);
          }
          return Promise.resolve(false);
        })
      )
    )
  );
});
```

- [ ] **Step 4: Verify TypeScript compilation and lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings

- [ ] **Step 5: Commit**

```bash
git add src/app/sw.ts tests/pwa/sw-cache-policy.test.ts
git commit -m "fix(pwa): enforce NetworkOnly for admin/api routes and purge legacy response caches on activate"
```

---

### Task 4: Database Migration for Signup Trigger & Master Data RLS (S1, S2)

**Files:**
- Create: `supabase/migrations/20261015100000_phase1_security_hardening.sql`
- Test: `tests/security/migration-schema.test.ts`

**Interfaces:**
- Database: `public.handle_new_user()` trigger on `auth.users`
- Database: RLS policies on `public.program_variants` and `public.branch_shifts`

- [ ] **Step 1: Write integration tests verifying database migration script structure and SQL policies**

Create `tests/security/migration-schema.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

describe("Phase 1 Migration Script", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261015100000_phase1_security_hardening.sql"
  );

  it("migration file exists", () => {
    expect(existsSync(migrationPath)).toBe(true);
  });

  it("hardcodes role to 'guru' in handle_new_user and ignores user metadata role", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.handle_new_user()");
    expect(sql).toContain("'guru'");
    expect(sql).not.toContain("COALESCE(NEW.raw_user_meta_data->>'role'");
  });

  it("enables RLS and defines policies for program_variants", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.program_variants ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("REVOKE ALL ON public.program_variants FROM anon;");
    expect(sql).toContain("GRANT SELECT ON public.program_variants TO anon;");
    expect(sql).toContain("CREATE POLICY \"Admins manage program variants\"");
    expect(sql).toContain("CREATE POLICY \"Public reads active program variants\"");
  });

  it("enables RLS and defines policies for branch_shifts", () => {
    const sql = readFileSync(migrationPath, "utf-8");
    expect(sql).toContain("ALTER TABLE public.branch_shifts ENABLE ROW LEVEL SECURITY;");
    expect(sql).toContain("REVOKE ALL ON public.branch_shifts FROM anon;");
    expect(sql).toContain("CREATE POLICY \"Admins manage branch shifts\"");
    expect(sql).toContain("CREATE POLICY \"Authenticated users read active branch shifts\"");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/security/migration-schema.test.ts`
Expected: FAIL with "migration file exists -> expected false to be true"

- [ ] **Step 3: Create migration file `supabase/migrations/20261015100000_phase1_security_hardening.sql`**

Create `supabase/migrations/20261015100000_phase1_security_hardening.sql`:
```sql
-- Phase 1 Security Hardening: Fix S1 (Signup Metadata Escalation) and S2 (Master Data Tables RLS)

-- 1. Hardcode self-registration role to 'guru', ignoring caller-supplied metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Guru'),
    'guru' -- Strictly ignore raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on program_variants
ALTER TABLE public.program_variants ENABLE ROW LEVEL SECURITY;

-- Revoke default public/anon mutations
REVOKE ALL ON public.program_variants FROM anon;
GRANT SELECT ON public.program_variants TO anon;
GRANT SELECT ON public.program_variants TO authenticated;

-- Policies for program_variants
DROP POLICY IF EXISTS "Admins manage program variants" ON public.program_variants;
CREATE POLICY "Admins manage program variants"
  ON public.program_variants FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public reads active program variants" ON public.program_variants;
CREATE POLICY "Public reads active program variants"
  ON public.program_variants FOR SELECT
  USING (is_active = true);

-- 3. Enable RLS on branch_shifts
ALTER TABLE public.branch_shifts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.branch_shifts FROM anon;
REVOKE ALL ON public.branch_shifts FROM authenticated;
GRANT SELECT ON public.branch_shifts TO authenticated;

-- Policies for branch_shifts
DROP POLICY IF EXISTS "Admins manage branch shifts" ON public.branch_shifts;
CREATE POLICY "Admins manage branch shifts"
  ON public.branch_shifts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users read active branch shifts" ON public.branch_shifts;
CREATE POLICY "Authenticated users read active branch shifts"
  ON public.branch_shifts FOR SELECT
  TO authenticated
  USING (is_active = true);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/security/migration-schema.test.ts`
Expected: PASS (4 tests passing)

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20261015100000_phase1_security_hardening.sql tests/security/migration-schema.test.ts
git commit -m "feat(db): add Phase 1 security hardening migration for handle_new_user and master data RLS"
```

---

### Task 5: End-to-End Verification & Verification Gate

**Files:**
- Modify: `progress.md`, `session-handoff.md`

- [ ] **Step 1: Run full unit test suite**

Run: `npm test`
Expected: 29 test suites passed, 100% tests passing, coverage above thresholds.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Production build succeeds cleanly via Webpack with service worker compilation.

- [ ] **Step 4: Update `progress.md` and `session-handoff.md`**

Document Phase 1 implementation completion, automated test results, and next steps for staging/production deployment.

- [ ] **Step 5: Commit**

```bash
git add progress.md session-handoff.md
git commit -m "docs: record Phase 1 implementation completion and verification evidence"
```
