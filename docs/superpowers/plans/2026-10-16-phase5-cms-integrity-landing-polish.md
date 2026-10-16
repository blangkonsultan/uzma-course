# Phase 5 CMS Integrity & Landing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the landing CMS against unsafe TikTok and image URLs, preserve sortable editor state during mutations, and make public landing anchors and floating contact UI safe on mobile.

**Architecture:** Keep validation at the existing server-action boundary before any TikTok fetch, with one exact HTTPS hostname allowlist applied to both the submitted URL and the final redirect. Keep image URL normalization centralized in `src/lib/utils.ts`; keep gallery preview failure state local to each gallery image. Preserve `SortableItemList`'s existing index-based state contract by explicitly swapping or shifting state whenever the items array changes. Apply the specified landing CSS/type cleanup without introducing new dependencies or abstractions.

**Tech Stack:** Next.js 16.3.7, React 19.2.8, TypeScript, Tailwind CSS v4, Vitest 5, Testing Library, Supabase server actions.

**Spec:** `docs/superpowers/specs/2026-10-15-phase5-cms-integrity-landing-polish-design.md`

## Global Constraints

- Server mutations MUST continue through `requireAdminAction()` before URL resolution or database work.
- TikTok resolver input and final redirect MUST use HTTPS and the exact approved TikTok host set: `tiktok.com`, `www.tiktok.com`, `vt.tiktok.com`, `vm.tiktok.com`, and `m.tiktok.com`.
- Dangerous image schemes (`javascript:`, `data:`, `vbscript:`) MUST normalize to an empty string; protocol-relative image URLs MUST normalize to HTTPS.
- Landing image elements MUST retain `referrerPolicy="no-referrer"`.
- Existing UI conventions, touch targets, Poppins typography, and zero-horizontal-overflow rules remain unchanged.
- No new third-party dependency is allowed for this scope.
- `npm run lint`, `npm test`, and `npm run build` MUST remain clean; coverage thresholds in `vitest.config.mts` MUST continue to pass.

## Review Focus

- A hostile TikTok URL (`http`, credentials, localhost, spoofed host, or an off-site redirect) must be rejected before or after fetch as applicable, with no unsafe extraction.
- A dangerous image scheme must never be returned as an image source, while local paths, protocol-relative URLs, and Google Drive conversions retain their intended behavior.
- Moving or deleting an item with mixed collapsed/expanded siblings must keep each surviving item's visual state attached to that item.
- A gallery image that fails to load must render the placeholder, and editing its URL must make the preview eligible to load again.
- All landing section anchors must clear the sticky navigation, and the floating WhatsApp control must account for iOS bottom/right safe-area insets.

---

### Task 1: Harden TikTok shortlink resolution and editor detection (A20)

**Files:**
- Modify: `src/app/admin/landing/actions.ts:83-118`
- Modify: `src/components/admin/landing/video-item-editor.tsx:47-95,160-169`
- Create: `tests/security/tiktok-resolver.test.ts`
- Modify: `tests/components-cms.test.tsx:207-225` only if the existing shortlink interaction needs to cover `vm.tiktok.com`

**Interfaces:**
- Consumes: existing `resolveTikTokShortlink(shortUrl: string): Promise<{ videoId?: string; error?: string }>` and `requireAdminAction()`.
- Produces: the same resolver return shape; only validated HTTPS TikTok URLs reach `fetch`, and final redirect validation uses the same approved host policy.

- [ ] **Step 1: Write failing resolver security tests**
  - Mock `@/lib/auth` with an admin result and replace `global.fetch` per test.
  - Add named tests for: non-HTTPS rejection, invalid URL rejection, spoofed/loopback host rejection, credential rejection, off-site final redirect rejection, successful `vt.tiktok.com`/`vm.tiktok.com`/`www.tiktok.com` resolution, and admin authorization failure.
  - Assert rejected inputs do not call `fetch`, successful resolution extracts a 15–22 digit video ID from the final TikTok URL, and an off-site redirect returns an error.

- [ ] **Step 2: Run the focused tests to verify the old implementation fails**
  - Run: `npx vitest run tests/security/tiktok-resolver.test.ts`
  - Expected: FAIL for the new protocol, host, credential, redirect, and mobile-shortlink cases.

- [ ] **Step 3: Implement the resolver hardening**
  - Add a module-level approved host set with the exact five hosts above.
  - Parse the trimmed input with `new URL()`, require `https:`, require an approved hostname, and reject username/password credentials before fetching.
  - Parse `res.url` after redirects and enforce HTTPS, no credentials, and the same exact host set before matching `/video/(\d{15,22})`.
  - Preserve the existing Indonesian error/result contract and admin authorization call.

- [ ] **Step 4: Update the editor's shortlink recognition**
  - Make both input handling and the shortlink helper state recognize `vt.tiktok.com` and `vm.tiktok.com` case-insensitively, while preserving normal ID/full-URL extraction for other inputs.
  - Update the helper copy if needed so it does not claim only `vt.tiktok.com` is supported.

- [ ] **Step 5: Run focused A20 tests**
  - Run: `npx vitest run tests/security/tiktok-resolver.test.ts tests/components-cms.test.tsx`
  - Expected: all focused security and editor tests pass.

- [ ] **Step 6: Commit the A20 change**
  - Run: `git add src/app/admin/landing/actions.ts src/components/admin/landing/video-item-editor.tsx tests/security/tiktok-resolver.test.ts tests/components-cms.test.tsx && git commit -m "fix: harden TikTok shortlink resolution"`

### Task 2: Sanitize image URLs and restore gallery preview fallback (A21)

**Files:**
- Modify: `src/lib/utils.ts:8-43`
- Modify: `src/components/admin/landing/gallery-form.tsx:1-12,166-190,199-212`
- Create: `tests/utils/image-normalizer.test.ts`
- Create: `tests/components/gallery-form.test.tsx`

**Interfaces:**
- Consumes: existing `normalizeImageUrl(url: string): string`, `GalleryForm`, and `GalleryContent` types.
- Produces: normalized safe image source strings; gallery previews render an `ImageIcon` fallback after load failure and reset that failure state when the affected URL changes.

- [ ] **Step 1: Write failing image-normalizer tests**
  - Cover `javascript:...`, `data:text/html,...`, and `vbscript:...` returning `""`.
  - Cover `//example.com/photo.jpg` returning `https://example.com/photo.jpg`.
  - Preserve `/images/photo.jpg`, ordinary HTTPS URLs, existing Googleusercontent URLs, Google Drive file URLs, `open?id=`, and `uc?id=` conversions.

- [ ] **Step 2: Run the focused utility test to verify failure**
  - Run: `npx vitest run tests/utils/image-normalizer.test.ts`
  - Expected: FAIL for dangerous schemes and protocol-relative URLs against the current implementation.

- [ ] **Step 3: Implement central URL sanitization**
  - Reject the case-insensitive dangerous-scheme regex before any provider conversion.
  - Convert protocol-relative URLs to `https:` before returning or matching provider formats.
  - Preserve all existing Google Drive conversion behavior and clean local/remote URL behavior.

- [ ] **Step 4: Write the failing gallery fallback test**
  - Mock `updateLandingSection`, render `GalleryForm` with one image, fire an image error, and assert the broken `<img>` is removed from the preview in favor of the placeholder icon.
  - Change the same image URL after failure and assert the new preview image is rendered again, proving state is keyed per gallery image and reset on URL edit.

- [ ] **Step 5: Implement per-image gallery error state**
  - Add a stable group/image key for the local error map.
  - Render the placeholder whenever the normalized URL is empty or the keyed image has failed.
  - Set the keyed error on `onError`; clear it on URL change before calling the existing image update path.
  - Keep the existing `no-referrer`, dimensions, and mobile layout intact.

- [ ] **Step 6: Run focused A21 tests**
  - Run: `npx vitest run tests/utils/image-normalizer.test.ts tests/components/gallery-form.test.tsx`
  - Expected: all sanitizer and gallery fallback tests pass.

- [ ] **Step 7: Commit the A21 change**
  - Run: `git add src/lib/utils.ts src/components/admin/landing/gallery-form.tsx tests/utils/image-normalizer.test.ts tests/components/gallery-form.test.tsx && git commit -m "fix: sanitize CMS image URLs and restore gallery fallback"`

### Task 3: Preserve sortable collapse state across reorder and delete (A22)

**Files:**
- Modify: `src/components/admin/landing/sortable-item-list.tsx:37-76`
- Create: `tests/components/sortable-item-list.test.tsx`

**Interfaces:**
- Consumes: existing generic `SortableItemList<T>` props and index-based `collapsedIndices` state.
- Produces: reorder and delete callbacks that preserve each surviving item's collapsed/expanded state at its new index.

- [ ] **Step 1: Write failing controlled-component tests**
  - Render a small controlled wrapper with three uniquely labeled items and stateful `onItemsChange`.
  - Collapse specific items, move one item up and down, and assert the collapsed body follows the moved item rather than the old array position.
  - Delete a middle item and assert the remaining items retain their previous collapsed/expanded states after indices shift.
  - Keep boundary move buttons as no-ops.

- [ ] **Step 2: Run the focused component test to verify failure**
  - Run: `npx vitest run tests/components/sortable-item-list.test.tsx`
  - Expected: FAIL because the current implementation does not update `collapsedIndices` on move/delete.

- [ ] **Step 3: Implement positional state synchronization**
  - In `handleMoveUp`, swap the two affected boolean entries before `onItemsChange`.
  - In `handleMoveDown`, swap the two affected boolean entries before `onItemsChange`.
  - In `handleDelete`, rebuild the map while omitting the deleted index and shifting every larger key down by one.
  - Preserve existing add, toggle, render, button labels, and callback behavior.

- [ ] **Step 4: Run focused A22 tests**
  - Run: `npx vitest run tests/components/sortable-item-list.test.tsx tests/components-cms.test.tsx`
  - Expected: all dedicated and existing CMS component tests pass.

- [ ] **Step 5: Commit the A22 change**
  - Run: `git add src/components/admin/landing/sortable-item-list.tsx tests/components/sortable-item-list.test.tsx tests/components-cms.test.tsx && git commit -m "fix: preserve sortable CMS collapse state"`

### Task 4: Standardize landing anchors, safe-area positioning, and type imports (A24)

**Files:**
- Modify: `src/components/landing/programs-section.tsx:26`
- Modify: `src/components/landing/why-us-section.tsx:37`
- Modify: `src/components/landing/facilities-section.tsx:41`
- Modify: `src/components/landing/team-section.tsx:35` (same discovered anchor inconsistency)
- Modify: `src/components/landing/gallery-section.tsx:78`
- Modify: `src/components/landing/testimonials-section.tsx:16`
- Modify: `src/components/landing/video-section.tsx:18`
- Modify: `src/components/landing/locations-section.tsx:17`
- Modify: `src/components/landing/faq-section.tsx:24`
- Modify: `src/components/landing/floating-whatsapp.tsx:31-34`
- Modify: `src/lib/landing-content.ts:1-10,350`
- Modify: `tests/components-landing.test.tsx:82-153` for observable anchor and safe-area behavior

**Interfaces:**
- Consumes: existing landing section components, `FloatingWhatsApp`, and `Program` type export.
- Produces: every section anchor uses `scroll-mt-20`; the WhatsApp wrapper includes bottom/right safe-area insets; `landing-content.ts` uses a top-level type import.

- [ ] **Step 1: Write failing landing polish assertions**
  - Add a test that renders the affected section components and asserts their `<section>` anchors use `scroll-mt-20`.
  - Assert the floating WhatsApp wrapper includes bottom and right `env(safe-area-inset-...,0px)` positioning classes.

- [ ] **Step 2: Run the focused landing test to verify failure**
  - Run: `npx vitest run tests/components-landing.test.tsx`
  - Expected: FAIL because the current sections still use `scroll-mt-16` and the wrapper lacks safe-area classes.

- [ ] **Step 3: Apply the exact CSS/type cleanup**
  - Replace every remaining landing section `scroll-mt-16` occurrence with `scroll-mt-20`, including the existing team section occurrence so no inconsistent anchor remains.
  - Replace the WhatsApp wrapper positioning with the specified `calc(1.5rem + env(...,0px))` bottom/right utilities while preserving its fixed z-index and child link behavior.
  - Add `import type { Program } from "@/types"` and use `Program` in `mapProgramRowToItem`.

- [ ] **Step 4: Run focused A24 checks**
  - Run: `npx vitest run tests/components-landing.test.tsx && npm run lint`
  - Expected: landing behavior assertions pass and lint reports zero errors/warnings.

- [ ] **Step 5: Commit the A24 change**
  - Run: `git add src/components/landing src/lib/landing-content.ts tests/components-landing.test.tsx && git commit -m "fix: polish landing anchors and safe-area spacing"`

### Task 5: Full verification, responsive smoke check, and project artifacts

**Files:**
- Modify: `progress.md`
- Modify: `session-handoff.md`
- Modify: `feature_list.json` only to record the completed Phase 5 evidence against the existing CMS/landing feature entry without changing unrelated feature statuses

**Interfaces:**
- Consumes: all completed A20–A24 code and regression tests.
- Produces: a restartable repository with recorded evidence and no uncommitted implementation changes.

- [ ] **Step 1: Run the complete verification harness**
  - Run: `./init.sh`
  - Expected: zero lint errors/warnings, all Vitest suites pass with thresholds, and the Webpack production build completes.

- [ ] **Step 2: Run the responsive public landing smoke check**
  - Start the real app with the existing dev command and inspect the public landing page at 360px, 375px, and 1280px+.
  - Verify no horizontal overflow, no clipped floating WhatsApp control, and correct anchor positioning around the sticky navbar.
  - Stop the dev server after the smoke check.

- [ ] **Step 3: Update continuity artifacts**
  - Add a dated Phase 5 implementation entry to `progress.md` with changed files, test counts, and harness/build evidence.
  - Replace the handoff's "awaiting planning" recommendation with the completed implementation status, verification evidence, and next available scope.
  - Record Phase 5 completion evidence in the existing CMS/landing feature entry in `feature_list.json`; leave unrelated ERP feature statuses unchanged.

- [ ] **Step 4: Review final repository state and commit artifacts**
  - Run: `git diff --check` and `git status --short`
  - Expected: no whitespace errors and only the intended documentation/feature evidence changes remain before the final commit.
  - Commit: `git add progress.md session-handoff.md feature_list.json && git commit -m "docs: record Phase 5 implementation completion"`
