# Technical Specification: Phase 5 CMS Integrity, Public Landing Page UI Polish & Visual Assets

- **Date:** 2026-10-15
- **Status:** Draft for Review (Brainstorming Architectural Path)
- **Target Subsystem:** Landing Page Content Management System (CMS), Shortlink Video Resolvers, Image Normalizer, Landing Page Sections & Layout
- **Author:** Assistant & Project Owner (Uzma Course)

---

## 1. Context & Problem Statement

Following the completion of Phase 1 (Security & Auth Hardening), Phase 2 (Master Data CRUD Integrity), Phase 3 (Teacher Attendance Lifecycle & PWA Offline Model), and Phase 4 (Scheduling Invariants, Multi-Branch Allocation & Modal Accessibility), Phase 5 addresses the final technical audit findings relating to CMS integrity, shortlink resolver security, image normalization, list reordering state, and public landing page UI ergonomics (A20, A21, A22, A24):

1. **A20 (P1): TikTok Shortlink Resolver SSRF & Incomplete Host Validation**
   - Files: `src/app/admin/landing/actions.ts:83-118`, `src/components/admin/landing/video-item-editor.tsx:50-54`
   - Issue: `resolveTikTokShortlink()` only checks `if (!shortUrl || !shortUrl.includes("tiktok.com"))`. An attacker can supply unvalidated protocols or malicious domains (e.g. `http://127.0.0.1:8080/private?marker=tiktok.com` or `https://evil-tiktok.com`), creating an SSRF hazard. Additionally, `video-item-editor.tsx` only matches `vt.tiktok.com`, failing to recognize `vm.tiktok.com` mobile shortlinks.

2. **A21 (P2): Image Normalizer Dangerous URI Schemes & Broken Gallery Preview Fallback**
   - Files: `src/lib/utils.ts:8-43`, `src/components/admin/landing/gallery-form.tsx:182-186`
   - Issue: `normalizeImageUrl()` does not strip dangerous URI schemes (`javascript:`, `data:`, `vbscript:`) and does not resolve protocol-relative URLs (`//example.com/img.jpg`). In `gallery-form.tsx`, an image load error hides the `<img>` tag without displaying the placeholder icon, creating a hollow, broken card appearance.

3. **A22 (P2): SortableItemList Collapse State Desynchronization on Move & Delete**
   - File: `src/components/admin/landing/sortable-item-list.tsx:37-66`
   - Issue: Item collapse state is stored using raw numeric array indices in `collapsedIndices: Record<number, boolean>`. When an item moves up or down via `handleMoveUp` or `handleMoveDown`, the collapse state does not swap positions. When an item is deleted via `handleDelete`, indices above the deleted item are not shifted down, causing sibling items to inherit the deleted item's collapse status.

4. **A24 (P2): Inconsistent Section Anchor Offsets, Floating Button Safe Area & Inline Type Anotation**
   - Files: `src/components/landing/{programs,why-us,facilities,gallery,testimonials,video,locations,faq}-section.tsx`, `src/components/landing/floating-whatsapp.tsx`, `src/lib/landing-content.ts:350`
   - Issue: Section anchor tags use `scroll-mt-16` (64px), which causes heading text to sit partially under the sticky navbar on certain screen sizes. The floating WhatsApp button lacks iOS safe-area inset padding (`env(safe-area-inset-bottom)`). In `src/lib/landing-content.ts`, an inline type import `import("@/types").Program` violates project rule `ts-import-type`.

---

## 2. Architectural Design & Solutions

```
+---------------------------------------------------------------------------------------------------------+
|                                        PHASE 5 ARCHITECTURE                                             |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  1. TIKTOK SHORTLINK RESOLVER & SSRF HARDENING (A20):                                                   |
|     +-----------------------------------------------------------------------------------------------+   |
|     |  src/app/admin/landing/actions.ts: resolveTikTokShortlink()                                    |   |
|     |  - Parse URL via new URL(); enforce protocol === 'https:'                                     |   |
|     |  - Hostname whitelist: ['tiktok.com', 'www.tiktok.com', 'vt.tiktok.com', 'vm.tiktok.com']     |   |
|     |  - Disallow credentials (username / password); reject private IP hosts                         |   |
|     |  - Validate final redirected URL stays within allowed TikTok hosts before extracting video ID |   |
|     |  src/components/admin/landing/video-item-editor.tsx                                           |   |
|     |  - Recognize both 'vt.tiktok.com' and 'vm.tiktok.com' shortlink formats                       |   |
|     +-----------------------------------------------------------------------------------------------+   |
|                                                                                                         |
|  2. IMAGE NORMALIZER SCHEME SANITIZATION & GALLERY PREVIEW (A21):                                       |
|     +-----------------------------------------------------------------------------------------------+   |
|     |  src/lib/utils.ts: normalizeImageUrl()                                                        |   |
|     |  - Block dangerous schemes ('javascript:', 'data:', 'vbscript:') -> return ''                 |   |
|     |  - Convert protocol-relative ('//...') to 'https://...'                                      |   |
|     |  - Preserve clean local paths ('/images/...') and direct Google Drive CDN conversions         |   |
|     |  src/components/admin/landing/gallery-form.tsx                                                |   |
|     |  - Handle broken image state per item to render consistent fallback icon                      |   |
|     +-----------------------------------------------------------------------------------------------+   |
|                                                                                                         |
|  3. SORTABLE ITEM LIST COLLAPSE STATE STABILITY (A22):                                                  |
|     +-----------------------------------------------------------------------------------------------+   |
|     |  src/components/admin/landing/sortable-item-list.tsx                                          |   |
|     |  - handleMoveUp(idx): swap collapsedIndices[idx] and collapsedIndices[idx - 1]                 |   |
|     |  - handleMoveDown(idx): swap collapsedIndices[idx] and collapsedIndices[idx + 1]               |   |
|     |  - handleDelete(idx): shift all keys > idx down by 1 in collapsedIndices                       |   |
|     +-----------------------------------------------------------------------------------------------+   |
|                                                                                                         |
|  4. SECTION ANCHOR OFFSETS, SAFE AREA & TYPE CLEANUP (A24):                                             |
|     +-----------------------------------------------------------------------------------------------+   |
|     |  Landing Page Sections: upgrade 'scroll-mt-16' to 'scroll-mt-20'                              |   |
|     |  src/components/landing/floating-whatsapp.tsx: add env(safe-area-inset-bottom/right)           |   |
|     |  src/lib/landing-content.ts: replace inline import("@/types").Program with top-level import    |   |
|     +-----------------------------------------------------------------------------------------------+   |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### 2.1 TikTok Shortlink Resolver Hardening (A20)

In `src/app/admin/landing/actions.ts:resolveTikTokShortlink`:
```typescript
const ALLOWED_TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "vt.tiktok.com",
  "vm.tiktok.com",
  "m.tiktok.com",
]);

export async function resolveTikTokShortlink(
  shortUrl: string
): Promise<{ videoId?: string; error?: string }> {
  await requireAdminAction();

  if (!shortUrl || typeof shortUrl !== "string") {
    return { error: "Tautan TikTok tidak boleh kosong." };
  }

  let parsed: URL;
  try {
    parsed = new URL(shortUrl.trim());
  } catch {
    return { error: "Format URL tidak valid." };
  }

  if (parsed.protocol !== "https:") {
    return { error: "Protokol tautan harus menggunakan HTTPS." };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!ALLOWED_TIKTOK_HOSTS.has(hostname)) {
    return { error: "Tautan harus berasal dari domain resmi TikTok (tiktok.com, vt.tiktok.com, vm.tiktok.com)." };
  }

  if (parsed.username || parsed.password) {
    return { error: "Tautan tidak boleh memuat kredensial pengguna." };
  }

  try {
    const res = await fetch(parsed.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    const finalParsed = new URL(res.url);
    if (!ALLOWED_TIKTOK_HOSTS.has(finalParsed.hostname.toLowerCase()) && !finalParsed.hostname.endsWith(".tiktok.com")) {
      return { error: "Pengalihan tautan mengarah ke domain di luar TikTok." };
    }

    const match = finalParsed.pathname.match(/\/video\/(\d{15,22})/);
    if (match && match[1]) {
      return { videoId: match[1] };
    }

    return {
      error: "Tidak dapat mengekstrak ID video dari tautan tersebut. Pastikan video bersifat publik.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menghubungkan ke server TikTok.";
    return { error: msg };
  }
}
```

In `src/components/admin/landing/video-item-editor.tsx`:
```typescript
  const handleIdChange = (val: string) => {
    setResolveError(null);

    // If it's a TikTok shortlink (vt.tiktok.com or vm.tiktok.com), keep the raw URL so user can trigger extract
    if (val.includes("vt.tiktok.com") || val.includes("vm.tiktok.com")) {
      setRawInput(val);
      return;
    }
...
```

### 2.2 Image Normalizer Protocol Sanitization (A21)

In `src/lib/utils.ts:normalizeImageUrl`:
```typescript
const DANGEROUS_SCHEME_REGEX = /^(?:javascript|data|vbscript):/i;

export function normalizeImageUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Reject script schemes and dangerous URIs
  if (DANGEROUS_SCHEME_REGEX.test(trimmed)) {
    return "";
  }

  // Normalize protocol-relative URLs
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // Normalize existing Google Drive CDN links with trailing paths/params
  const lh3Match = trimmed.match(
    /(?:lh[0-9]*\.)?googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/
  );
  if (lh3Match) {
    return `https://lh3.googleusercontent.com/d/${lh3Match[1]}`;
  }

  // Convert Google Drive sharing links to direct CDN embed URLs
  const fileDMatch = trimmed.match(
    /drive\.google\.com\/file\/(?:u\/[0-9]+\/)?d\/([a-zA-Z0-9_-]+)/
  );
  if (fileDMatch) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  const openIdMatch = trimmed.match(
    /drive\.google\.com\/open\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (openIdMatch) {
    return `https://lh3.googleusercontent.com/d/${openIdMatch[1]}`;
  }

  const ucMatch = trimmed.match(
    /drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/
  );
  if (ucMatch) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  return trimmed;
}
```

### 2.3 `SortableItemList` Collapse State Synchronization (A22)

In `src/components/admin/landing/sortable-item-list.tsx`:
```typescript
  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(idx - 1, 0, moved);

    // Swap collapse states between idx and idx - 1
    setCollapsedIndices((prev) => {
      const nextCollapsed = { ...prev };
      const currentVal = Boolean(prev[idx]);
      const targetVal = Boolean(prev[idx - 1]);
      nextCollapsed[idx - 1] = currentVal;
      nextCollapsed[idx] = targetVal;
      return nextCollapsed;
    });

    onItemsChange(next);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    const [moved] = next.splice(idx, 1);
    next.splice(idx + 1, 0, moved);

    // Swap collapse states between idx and idx + 1
    setCollapsedIndices((prev) => {
      const nextCollapsed = { ...prev };
      const currentVal = Boolean(prev[idx]);
      const targetVal = Boolean(prev[idx + 1]);
      nextCollapsed[idx + 1] = currentVal;
      nextCollapsed[idx] = targetVal;
      return nextCollapsed;
    });

    onItemsChange(next);
  };

  const handleDelete = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);

    // Reconstruct collapsed indices shifting all keys > idx down by 1
    setCollapsedIndices((prev) => {
      const nextCollapsed: Record<number, boolean> = {};
      Object.entries(prev).forEach(([keyStr, val]) => {
        const k = parseInt(keyStr, 10);
        if (k < idx) {
          nextCollapsed[k] = val;
        } else if (k > idx) {
          nextCollapsed[k - 1] = val;
        }
      });
      return nextCollapsed;
    });

    onItemsChange(next);
  };
```

### 2.4 Landing Page Scroll Anchor Offsets, Safe Area & Type Standards (A24)

1. **Section Scroll Offsets:**
   - In `src/components/landing/{programs,why-us,facilities,gallery,testimonials,video,locations,faq}-section.tsx`:
   - Replace `scroll-mt-16` with `scroll-mt-20` (80px) to clear sticky navbar height comfortably without clipping section titles.

2. **Safe-Area Inset on Floating WhatsApp:**
   - In `src/components/landing/floating-whatsapp.tsx`:
   - Add safe-area padding:
     `className="fixed bottom-6 right-6 z-50 [bottom:calc(1.5rem+env(safe-area-inset-bottom,0px))] [right:calc(1.5rem+env(safe-area-inset-right,0px))]"`

3. **Type Annotation Standard:**
   - In `src/lib/landing-content.ts`:
   - Replace inline `import("@/types").Program` with top-level `import type { Program } from "@/types"`.

---

## 3. Testing Strategy & Verification Plan

### Automated Tests
1. `tests/security/tiktok-resolver.test.ts`:
   - Rejects non-HTTPS schemes (`http://...`).
   - Rejects unlisted/spoofed hosts (`https://evil-tiktok.com`, `https://127.0.0.1`).
   - Rejects URLs containing credentials.
   - Accepts legitimate TikTok URLs (`https://vt.tiktok.com/...`, `https://vm.tiktok.com/...`, `https://www.tiktok.com/...`).
2. `tests/utils/image-normalizer.test.ts`:
   - Strips `javascript:...` and `data:text/html,...`.
   - Converts `//example.com/photo.jpg` to `https://example.com/photo.jpg`.
   - Preserves Google Drive conversions and local images.
3. `tests/components/sortable-item-list.test.tsx`:
   - Verifies collapse states swap properly when moving items up or down.
   - Verifies indices shift down when deleting an item.

---

## 4. Definition of Done

- [ ] All 4 sections (A20, A21, A22, A24) implemented.
- [ ] `./init.sh` succeeds with 0 ESLint errors/warnings.
- [ ] Vitest unit tests pass 100% across all suites with coverage exceeding all thresholds.
- [ ] Clean production Webpack build.
