# Technical Specification: Phase 1 Security, Database Authorization & PWA Cache Boundary Hardening

- **Date:** 2026-10-14
- **Status:** Draft for Review (Brainstorming Architectural Path)
- **Target Subsystem:** Authentication, Database Access Control (RLS & Triggers), Service Worker Caching, Endpoint Input Validation
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Problem Statement

A comprehensive technical audit conducted on commit `17d3580` identified high-priority security vulnerabilities and trust-boundary defects:

1. **S1 (P1): Signup Metadata Admin Escalation**
   - File: `supabase/migrations/20260930042131_initial_schema.sql:33`
   - Issue: The database trigger `handle_new_user()` copies `NEW.raw_user_meta_data->>'role'` directly into `profiles.role`. If public email signup is enabled on Supabase, an unauthenticated user can self-register with `{"role": "admin"}` in their user metadata, becoming a full administrator upon confirming their email.

2. **S2 (P1): Unprotected Operational Master Data Tables**
   - File: `supabase/migrations/20261002010022_phase2b_master_data.sql:2-31`
   - Issue: Tables `program_variants` and `branch_shifts` were created without enabling Row Level Security (`ENABLE ROW LEVEL SECURITY`). By default in PostgREST, anonymous and authenticated API roles inherit direct table privileges, allowing unauthenticated reads (disclosing teacher fees and tuition rates) and direct modification/deletion. A deletion on `branch_shifts` cascades down to `schedule_classes` and student placements.

3. **S3 (P1): Post-Logout Private Response Exposure in Service Worker Cache**
   - File: `src/app/sw.ts:30-56`, `src/app/logout/route.ts:4-9`
   - Issue: The custom route matcher in `sw.ts` returned `false` for `/admin` paths, which merely bypassed the custom handler and fell through to Serwist's `...defaultCache`. As a result, private admin HTML responses were cached in the `others` cache, and private React Server Component (RSC) payloads (including `/admin/murid`) were cached in `pages-rsc-prefetch`. Logging out via `/logout` cleared cookies but left Cache Storage intact. A subsequent user on the same browser profile can read private pages and student data offline or inspect cached responses.

4. **S4 (P1): Unvalidated Post-Login Destination (Open Redirect & Scheme Injection)**
   - File: `src/components/admin/login-form.tsx:53-54`
   - Issue: After successful non-guru authentication, the unvalidated `next` query parameter was assigned directly to `window.location.href`. An attacker could craft a link such as `/login?next=https://evil.com` or `/login?next=javascript:...`, leading to open redirection or arbitrary script execution in the authenticated context.

5. **S5 (P2): Unauthenticated Blind SSRF in Maps Coordinator Resolver**
   - File: `src/lib/maps.ts:3-14`
   - Issue: The exported server action `extractCoordinatesFromUrl()` had no authentication guard and used loose substring checking (`url.includes('goo.gl')`). An attacker could supply internal or private network URLs (e.g., `http://127.0.0.1:9999/private?marker=goo.gl`) to trigger server-side `HEAD` and `GET` requests with automatic redirect following.

### Operating Invariant
**Zero Downtime & Zero Data Loss:** Production (`uzmacourse.com`) must remain live during remediation. PWA offline queues stored in teacher devices (`attendance_queue` in IndexedDB) must be preserved; cache purging must target response caches only without clearing IndexedDB data.

---

## 2. Architectural Design & Solutions

```
+---------------------------------------------------------------------------------------+
|                                    PHASE 1 ARCHITECTURE                               |
+---------------------------------------------------------------------------------------+
|                                                                                       |
|  1. DATABASE BOUNDARY (Supabase Migration):                                           |
|     +---------------------------+       +------------------------------------------+  |
|     |  handle_new_user()        |       |  RLS: program_variants & branch_shifts   |  |
|     |  Hardcode role = 'guru'   |       |  - ALL operations require is_admin()     |  |
|     |  Ignore metadata->>'role' |       |  - SELECT: public projection for variants|  |
|     +---------------------------+       |  - SELECT: branch_shifts (auth & active) |  |
|                                         +------------------------------------------+  |
|                                                                                       |
|  2. NEXT.JS SERVER & CLIENT BOUNDARIES:                                               |
|     +---------------------------+       +------------------------------------------+  |
|     |  src/lib/maps.ts          |       |  src/components/admin/login-form.tsx     |  |
|     |  - requireAdminAction()   |       |  - sanitizeNextUrl(rawUrl)               |  |
|     |  - Strict URL parse host  |       |  - Only internal relative paths /...     |  |
|     |  - Block loopback/private |       |  - Fallback: role default landing        |  |
|     +---------------------------+       +------------------------------------------+  |
|                                                                                       |
|  3. SERVICE WORKER & CACHE ISOLATION:                                                 |
|     +------------------------------------------------------------------------------+  |
|     |  src/app/sw.ts                                                               |  |
|     |  - Top-priority NetworkOnly handler for /admin/* and /api/*                  |  |
|     |  - Increment worker cache version (uzma-pages-v2, uzma-rsc-v2)               |  |
|     |  - activate event: purge old runtime response caches                         |  |
|     |  - EXCLUDE IndexedDB: attendance_queue remains untouched                     |  |
|     +------------------------------------------------------------------------------+  |
|                                                                                       |
+---------------------------------------------------------------------------------------+
```

### 2.1 Database Boundary (S1 & S2)

#### 2.1.1 Remediation of Trigger `handle_new_user()`
Create a version-controlled migration `supabase/migrations/20261014120000_phase1_security_hardening.sql`:

```sql
-- 1. Hardcode self-registration role to 'guru', ignoring caller-supplied metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'guru' -- Strictly ignore raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

*Note on Admin Creation:* Admin accounts can only be provisioned via direct database initialization, dedicated CLI seeds with service role, or an explicit admin management function restricted by `is_admin()`.

#### 2.1.2 Row Level Security for Master Data
Enable RLS on `program_variants` and `branch_shifts`, revoke blanket grants from `anon`, and establish explicit granular policies:

```sql
-- 2. Enable RLS on program_variants
ALTER TABLE public.program_variants ENABLE ROW LEVEL SECURITY;

-- Revoke default public/anon mutations
REVOKE ALL ON public.program_variants FROM anon;
GRANT SELECT ON public.program_variants TO anon;
GRANT SELECT ON public.program_variants TO authenticated;

-- Policies for program_variants
CREATE POLICY "Admins manage program variants"
  ON public.program_variants FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public reads active program variants"
  ON public.program_variants FOR SELECT
  USING (is_active = true);

-- 3. Enable RLS on branch_shifts
ALTER TABLE public.branch_shifts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.branch_shifts FROM anon;
REVOKE ALL ON public.branch_shifts FROM authenticated;
GRANT SELECT ON public.branch_shifts TO authenticated;

-- Policies for branch_shifts
CREATE POLICY "Admins manage branch shifts"
  ON public.branch_shifts FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated users read active branch shifts"
  ON public.branch_shifts FOR SELECT
  TO authenticated
  USING (is_active = true);
```

### 2.2 PWA Service Worker & Cache Isolation (S3)

#### 2.2.1 Route Matcher Hardening in `src/app/sw.ts`
Serwist's `defaultCache` contains catch-all rules for same-origin documents and RSC (`PAGES_CACHE_NAME.rsc`, `others`). Returning `false` in a custom matcher merely relinquishes handling to subsequent rules.

**Solution:** Place explicit `NetworkOnly` handlers at the **top** of `runtimeCaching`:

```typescript
import { NetworkOnly, NetworkFirst, StaleWhileRevalidate } from "serwist";

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
  // 2. Public / Guru pages cache
  {
    matcher: ({ request, url }) => {
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return false;
      return request.mode === "navigate";
    },
    handler: new NetworkFirst({
      cacheName: "uzma-pages-v2",
      networkTimeoutSeconds: 3,
    }),
  },
  // 3. Public / Guru RSC prefetch
  {
    matcher: ({ request, url }) => {
      if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return false;
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
]
```

#### 2.2.2 Service Worker Activation & Legacy Cache Cleanup
In `src/app/sw.ts`, listen for `activate` event to prune legacy caches (`others`, `pages-rsc-prefetch`, `uzma-pages-cache`, `uzma-rsc-cache`) while keeping standard static assets:

```typescript
self.addEventListener("activate", (event) => {
  const currentCaches = ["uzma-pages-v2", "uzma-rsc-v2", "serwist-precache-v2"];
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
        })
      )
    )
  );
});
```

*Invariant Preservation:* `caches.delete()` targets the Cache Storage API only. The `IndexedDB` database (`UzmaCoursePWA` -> `attendance_queue`) remains completely untouched.

### 2.3 Post-Login Destination Sanitization (S4)

In `src/components/admin/login-form.tsx`, implement a strict URL sanitizer function:

```typescript
function sanitizeNextUrl(rawUrl: string | null, defaultDestination: string): string {
  if (!rawUrl) return defaultDestination;
  
  const trimmed = rawUrl.trim();
  // Disallow protocol-relative URLs (e.g. //evil.com) and executable schemes (javascript:, data:)
  if (trimmed.startsWith("//") || trimmed.includes(":") || trimmed.includes("\\")) {
    return defaultDestination;
  }
  
  // Must be an internal path starting with exactly one '/'
  if (!trimmed.startsWith("/") || trimmed.startsWith("/login") || trimmed.startsWith("/logout")) {
    return defaultDestination;
  }
  
  return trimmed;
}
```

Integration inside `handleSubmit`:
```typescript
const destination = profile?.role === "guru"
  ? "/guru/absen"
  : sanitizeNextUrl(nextUrl, "/admin");
window.location.href = destination;
```

### 2.4 Server-Side Map URL Validation & Authentication (S5)

In `src/lib/maps.ts`:
1. Guard the server action using `await requireAdminAction()`.
2. Parse the input using `new URL(rawUrl)`.
3. Restrict protocols to `https:`.
4. Allowlist known Google Maps domain names:
   - Exact hosts: `maps.google.com`, `www.google.com`, `maps.app.goo.gl`, `goo.gl`.
5. Reject private IP addresses, loopback, or non-whitelisted hosts.

```typescript
"use server";

import { requireAdminAction } from "@/lib/auth";

const ALLOWED_MAP_HOSTS = new Set([
  "maps.google.com",
  "www.google.com",
  "google.com",
  "maps.app.goo.gl",
  "goo.gl"
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
    if (parsed.hostname.includes("goo.gl")) {
      const headRes = await fetch(finalUrl, { method: "HEAD", redirect: "follow" });
      const redirected = new URL(headRes.url);
      if (ALLOWED_MAP_HOSTS.has(redirected.hostname.toLowerCase())) {
        finalUrl = redirected.href;
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
    return { error: "Gagal memproses tautan Google Maps." };
  }
}
```

---

## 3. Rollout & Cutover Sequence (Zero Downtime)

To ensure continuous operation without race conditions or deployment locks:

1. **Step 1: Staging Verification & Pre-flight Database Migration**
   - Apply migration `20261014120000_phase1_security_hardening.sql` to staging database.
   - Run verification tests to ensure existing admin queries, public landing variant queries, and guru attendance queries operate without RLS rejection.

2. **Step 2: Database Migration Push to Production**
   - Run `npx supabase db push` to production database.
   - Since public landing only performs `SELECT` on `program_variants` with `is_active = true`, the public catalog continues serving without interruption.
   - Admin server actions use `supabase.auth` and server clients with valid admin cookies, keeping admin ERP unaffected.

3. **Step 3: Deploy Application Code (Next.js & Serwist Worker)**
   - Commit and push hardened code to `main` (triggering Vercel production build via `next build --webpack`).
   - The updated service worker takes over clients with `skipWaiting: true` and `clientsClaim: true`.
   - On worker `activate`, legacy response caches containing admin responses are deleted.
   - Offline queue in IndexedDB (`attendance_queue`) remains preserved.

4. **Step 4: Post-Deployment Smoke Verification**
   - Verify unauthenticated public landing page loads all program variants and branch details.
   - Verify unauthenticated POST to `/auth/v1/signup` produces `role: "guru"` in profile.
   - Verify logging into `/login?next=https://example.com` safely redirects to `/admin`.
   - Verify logging out clears session and prevents viewing `/admin` pages offline.
   - Verify `extractCoordinatesFromUrl` rejects unauthenticated callers with an authorization error.

---

## 4. Test Strategy & Acceptance Criteria

### 4.1 Automated Vitest Suites
1. **`tests/security/auth-signup.test.ts`**:
   - Mock `handle_new_user` trigger logic.
   - Assert input with `raw_user_meta_data: { role: 'admin' }` produces `role: 'guru'`.
2. **`tests/security/login-redirect.test.ts`**:
   - Test `sanitizeNextUrl` against:
     - Absolute external URLs: `https://evil.com` -> `/admin`
     - Protocol-relative URLs: `//evil.com` -> `/admin`
     - Executable schemes: `javascript:alert(1)` -> `/admin`
     - Normal app paths: `/admin/murid` -> `/admin/murid`
3. **`tests/security/maps-action.test.ts`**:
   - Verify unauthenticated call throws or returns error.
   - Verify non-Google hosts (e.g. `http://127.0.0.1:9999`) return validation error without initiating network fetch.
4. **`tests/pwa/cache-policy.test.ts`**:
   - Verify `/admin/*` matches the `NetworkOnly` strategy.
   - Verify Cache Storage cleanup does not touch `IndexedDB`.

### 4.2 Definition of Done for Phase 1
- [ ] Database migration file created and pushed cleanly to Supabase.
- [ ] `npm run lint` passes with 0 errors / 0 warnings.
- [ ] `npm test` passes with 100% success rate across all suites.
- [ ] `./init.sh` succeeds cleanly.
- [ ] Production smoke run confirms public landing, teacher portal, and admin dashboard function with 0 downtime.
