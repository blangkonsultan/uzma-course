---
name: Uzma Course
description: Pusat bimbingan belajar dengan metode ramah anak dan bebas trauma
colors:
  primary: "#9333ea"
  primary-deep: "#581c87"
  primary-light: "#f3e8ff"
  accent: "#be3099"
  accent-light: "#d946a8"
  neutral-bg: "oklch(98.4% 0.003 247.858)"
  neutral-surface: "#ffffff"
  neutral-text: "oklch(37.2% 0.044 257.287)"
typography:
  display:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "700"
  headline:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "600"
  title:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "600"
  body:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "400"
  label:
    fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif"
    fontWeight: "500"
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "var(--color-slate-700)"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  button-outline-white:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  button-secondary:
    backgroundColor: "var(--color-slate-100)"
    textColor: "var(--color-slate-800)"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  button-whatsapp:
    backgroundColor: "var(--color-green-500)"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.full}"
    padding: "0.625rem 1.5rem"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.2xl}"
  card-body:
    padding: "2rem"
  input-field:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "var(--color-slate-900)"
    rounded: "{rounded.xl}"
    padding: "0.625rem 0.875rem"
  tag-primary:
    backgroundColor: "var(--color-primary-50)"
    textColor: "var(--color-primary-700)"
    rounded: "{rounded.full}"
  guru-navigation:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "var(--color-slate-500)"
---

# Design System: Uzma Course

## Overview

**Creative North Star: "The Friendly Classroom"**

Warm, rounded, calm interfaces make the tutoring centre approachable without making operational work feel playful or imprecise. Preserve the established purple and magenta identity, Poppins typography, white surfaces, and Slate neutrals. Financial, attendance, permission, and deletion messages must remain factual and serious.

**Key Characteristics:**
- Pill-shaped actions and softly rounded structural surfaces.
- Clear task hierarchy, restrained colour, and readable spacing.
- Desktop tables for administration and focused, single-column teacher workflows.
- Subtle surface lift rather than decorative effects that compete with the task.

This guide owns visual tokens and new-feature UI patterns. The frontmatter records implemented defaults; component overrides and responsive usage are described below. It does not claim every legacy screen already meets the new-feature requirements. [.impeccable/design.json](.impeccable/design.json) extends this guide with source-derived previews, shadows, motion, and breakpoint metadata, not a second set of primitive tokens.

Sources: [application theme](src/app/globals.css), [installed Tailwind theme](node_modules/tailwindcss/theme.css), and the linked components. Keep these references and the sidecar aligned when updating the system. See [PRODUCT.md](PRODUCT.md) for product scope, not page-specific styling rules.

## Colors

Use the existing named palette and semantic utility families. Numeric primitives live in the frontmatter; do not introduce competing hex approximations for Tailwind's canonical OKLCH neutrals.

### Primary
- **Nurturing Purple** (`primary`): primary actions, selected program context, and brand identity.
- **Deep Purple** (`primary-deep`): strong brand emphasis and dark brand surfaces.
- **Soft Purple** (`primary-light`): gentle selected backgrounds and supporting emphasis.

### Secondary
- **Warm Magenta** (`accent`) and **Bright Magenta** (`accent-light`): supporting brand accents, not substitutes for error or payment states.

### Neutral
- **Slate Background** (`neutral-bg`): the application canvas.
- **Surface White** (`neutral-surface`): cards, forms, and documents.
- **Slate Text** (`neutral-text`): normal foregrounds; select other Slate shades through the existing theme for hierarchy and contrast.

### Domain semantics

| Family | Status meaning | Entity/identity use |
| --- | --- | --- |
| Emerald | Success, active, present, paid | Teacher avatars |
| Blue | Information or partially paid groups | Student avatars; existing teacher navigation selection |
| Amber | Pending, unpaid, warning, leave | Branch/shift accents where appropriate |
| Rose | Error, destructive action, absent, cancelled | Consequence, not general decoration |
| Primary purple | Primary action and selection | Program avatars use `avatar.color="primary"`, not `"purple"` |

**The Non-Corporate Rule.** Keep neutral structure in Slate and preserve the warm brand. This does not prohibit semantic Blue, Emerald, Amber, or Rose. Pair colour with text or an accessible icon; colour alone must not communicate a status. Measure actual foreground/background contrast, including hover, focus, and tinted surfaces; a token name is not a WCAG pass.

## Typography

**Display Font:** Poppins, with the frontmatter fallback stack.
**Body Font:** Poppins, with the same fallback stack.

Use the existing weight hierarchy: display emphasis, semibold page/group headings, regular reading text, and medium labels. Buttons retain their implemented semibold treatment. Use `tabular-nums` for aligned money and numeric summaries.

Form controls use `text-base sm:text-sm` so mobile text entry remains at least the normal 16px base size rather than triggering iOS focus zoom. Keep labels persistent; placeholders are examples, not labels. Preserve browser zoom and readable reflow rather than solving layout problems by preventing scaling.

Do not copy the teacher navigation's small legacy captions as a general body-text size. Short labels and longer names must remain understandable without truncating essential actions or payment values.

## Layout

Reuse the existing Admin and Guru layout shells rather than adding a second navigation system or conflicting outer container. Teacher pages remain a focused single column; administrative lists switch between mobile cards and desktop tables using the existing component breakpoints.

### Responsive and interaction requirements

| Context | Minimum interactive target | Usage |
| --- | --- | --- |
| Mobile and touch-first controls | 44px in both dimensions | `min-h-11`; add `min-w-11` for compact/icon-only controls |
| Deliberately compact desktop controls | 36px in both dimensions | `min-h-9`; add `min-w-9` where needed; do not shrink touch controls merely because a screen is wider |
| Noninteractive initials avatar | 40px square | Existing `size-10`/`w-10 h-10`; this is not an interactive-target exception |

Use `min-w-0` on flexible input/text containers and `shrink-0` on action groups. Keep layout-wide horizontal overflow at zero; a bounded, keyboard/touch-operable document or table scroller is allowed when all columns cannot fit. Its controls and scrollable content must remain discoverable.

On long forms, place the full-width primary action above the secondary action on mobile and restore a horizontal action group on wider layouts. Use responsive card padding rather than stacking fixed desktop padding inside already padded mobile containers. Existing `CardHeader`/`CardBody` defaults are not a requirement to use that desktop padding everywhere.

Verify representative screens at 360px, 375px, an intermediate width, and 1280px or wider. A viewport resize is not proof of physical touch, a safe-area inset, or OS integration.

### Safe areas and bottom clearance

For fixed controls, apply the actual CSS property on the owning surface, for example `padding-bottom: env(safe-area-inset-bottom, 0px)`. Use `max(base-padding, env(...))` when a floating panel also needs its ordinary outer gutter; preserve the inset on other edges as applicable.

Reserve the rendered bottom navigation height, the floating Presensi button's protrusion, and the safe inset in scrollable content clearance. A fixed save/action bar must sit above that occupied region and contribute its own height and gap to the clearance. Do not place two fixed bars over the same bottom edge.

**Known implementation boundary:** [GuruBottomNav](src/components/guru/guru-bottom-nav.tsx) still contains `pb-safe`, but no utility definition or generated rule exists for that alias. It is not a ready-to-use design token. This documentation update does not implement the missing runtime safe-area behaviour; use explicit supported CSS in new work and verify actual inset/keyboard behaviour on the target device.

## Elevation & Depth

Use shallow lift for ordinary controls and surfaces; reserve stronger elevation for overlays. Reuse the actual Tailwind shadow classes, whose exact values are stored in the sidecar extensions: `shadow-2xs` on primary buttons, `shadow-xs` on master cards/fields, `shadow-md` on the shared Card, and stronger existing overlay shadows where needed. These are different tokens, not interchangeable names for one shadow.

Keep focus indication visible. Preserve the existing restrained colour transitions and reduced-motion handling; do not add large blur effects or animation solely to make a feature look new. Print removes shadows, backdrop effects, and motion.

## Shapes

Buttons and badges retain pill silhouettes (`rounded-full`). Structural cards and modal sheets use `rounded-2xl`; fields, avatar tiles, and inset summary boxes use their existing `rounded-xl`/`rounded-lg` treatments. Use the frontmatter radius scale rather than assuming that an `xl` label has the same value as an `xl` spacing step.

The ordinary radius/spacing steps retain the installed Tailwind rem values. At the default 16px root size, computed browser styles confirmed the corrected scale; do not hard-code a different radius while keeping the same token name. The pill token and standalone previews use a finite, serialization-compatible pill radius. Tailwind's actual utility is `calc(infinity * 1px)`; this documented serialization equivalent is not an application CSS override. A rounded frame may deliberately become borderless and square-edged in print, where the paper document replaces the screen container.

## Components

### Reuse map

| Need | Existing source | Contract to reuse |
| --- | --- | --- |
| Actions and CTA links | [Button](src/components/ui/button.tsx) | Variants: `primary`, `outline`, `outline-white`, `secondary`, `ghost`, `whatsapp`; sizes: `sm`, `md`, `lg` |
| Structural surfaces | [Card](src/components/ui/card.tsx) | `Card`, `CardHeader`, `CardBody`; there is no `CardFooter` export |
| Labelled form controls | [Form fields](src/components/admin/form-field.tsx) | `InputField`, `TextareaField`, `SelectField`, checkbox fields; preserve `id`, label, hint, error and native control semantics |
| Search and filters | [SearchFilterBar](src/components/admin/search-filter-bar.tsx) | Existing URL-backed query/reset and pending behaviour |
| Master lists | [DataTable](src/components/admin/data-table.tsx) | Supply `mobileCard` for the standard mobile representation |
| Mobile master records | [MasterMobileCard](src/components/admin/master-mobile-card.tsx) | Header, status, optional badges/specs, and caller-provided actions |
| Active/inactive labels | [StatusBadge](src/components/admin/status-badge.tsx) | `isActive`, optional label overrides; do not infer an accounting status from this boolean |
| Consequential confirmation | [ConfirmDialog](src/components/admin/confirm-dialog.tsx) | `isOpen`, `onConfirm`, `onCancel`, `isLoading`, contextual title/description |
| Teacher navigation | [GuruBottomNav](src/components/guru/guru-bottom-nav.tsx) | Preserve the five actual tabs and their routes |
| Printable billing documents | [OfficialReceiptModal](src/components/admin/billing/official-receipt-modal.tsx), [SppExportModal](src/components/admin/billing/spp-export-modal.tsx) | Independent print roots, active body state, and cleanup |

Check actual props before using a component. Reusing a primitive does not automatically enforce touch sizes, safe areas, or the accessibility of its caller-provided content. `Button` uses a native button by default and an anchor when `href` is supplied; navigation is not a form submission.

### Forms and feedback

Keep labels, requirements and error recovery next to the relevant field. Prefer the existing field components over visually similar one-off inputs. Normal form fields have white surfaces; the search bar uses its existing Slate-tinted field treatment. Associate hints/errors with the control and expose invalid state without relying only on colour.

Preserve entered data when a submission fails. Distinguish first-use emptiness, no search matches, missing permission, loading, server failure, and a completed save. A success toast is not a substitute for persisted readback in a consequential workflow. Show busy/progress presentation only while an operation is actually pending; do not manufacture progress. Disabled or read-only states are also valid for unavailable actions, unmet prerequisites, and completed/locked records. Explain the reason and any available recovery rather than presenting every unavailable action as a loading operation.

### Master data and CRUD

Compose a master list from the existing page header, search/filter bar, table, empty/pending feedback, and mobile cards. New master lists use `DataTable.mobileCard` with `MasterMobileCard`; reports and documents may instead require a bounded scroller rather than forcing financial columns into unrelated card fields.

The mobile card has six content responsibilities:
1. A noninteractive initials avatar in the entity colour family.
2. Identity and optional subtitle, with a semantic detail link where applicable.
3. A clear status label.
4. Optional branch/category tags.
5. An optional two-column summary using the real `specs.left` / `specs.right` API.
6. An action bar with visible labels or accessible icon names and the interaction targets from Layout.

The card does not resize `actions` passed by its caller. Older `h-10` action examples are legacy, not the new mobile minimum. Use the shared Button and existing status/confirmation controls with the required hit area; do not enlarge the noninteractive avatar merely to satisfy the action rule.

### Native and custom dialogs

- **Native dialog:** `<dialog>` owns `showModal()`/`close()`. Opening it provides modal focus containment and an inert background. Handle `cancel` for Escape, provide an accessible title and close control, and restore the opener after close/unmount. Reuse the native pattern already used by billing/guide viewers.
- **Custom dialog:** reuse the existing `ConfirmDialog` API for its supported confirmation flow. A portal only relocates DOM; it is not an element with `showModal()` and does not itself implement focus containment, background inertness, Escape handling, or focus restoration. Do not build a new custom focus system from scratch.
- **Consequences and pending writes:** name the action and affected object. Preserve the existing protection against cancelling a confirmation while its consequential write is pending; explain pending state rather than leaving an unexplained permanent keyboard trap.

### Print ownership and pagination

For direct-body-child print isolation, the printable root must be an actual direct child of `document.body`. Portal the billing document there before applying selectors that hide its siblings; otherwise hiding the shell also hides a nested document.

| Surface | Active state on `body` | Printable root |
| --- | --- | --- |
| Official receipt | `data-receipt-modal-open` | `#official-receipt-modal` containing `#receipt-print-area` |
| SPP recap | `data-spp-export-open` | `#spp-export-modal` containing `#spp-export-print-area` |

The owning component sets its own attribute when the document opens and removes it on close/unmount, including cancellation or navigation. Apply print-only hiding only for the active document, not as an always-active global rule. Do not leave competing print roots active. [Global print rules](src/app/globals.css) exclude the shell, while each document restores static flow, removes fixed/full-viewport dimensions and max-height/overflow clipping, hides controls/backdrops, and removes screen borders/shadows/animations. Keep normal page controls, focus and scrolling intact on return.

The [guide print lifecycle](src/components/guides/guide-print-button.tsx) is a different, selected-article flow using `data-guide-printing`; it is not a billing portal. Preserve its disclosure-state restoration.

A normal single-invoice receipt is expected to fit one A4 page when its content fits. A recap can legitimately span multiple pages. `break-inside: avoid` only discourages a split; it does not guarantee one page or prevent blank pages. For recaps, repeat column headers and keep pupil groups/summary/signature blocks together where they fit, rather than forcing the entire report onto one page. Never hide financial rows, clip long notes, select only page one, or blindly shrink text to claim success.

Keep each currency label and number together with a nonbreaking space, `whitespace-nowrap`, and `tabular-nums`. Verify native PDF page count, text completeness, unbroken amounts, absence of portal chrome/backdrop, and nonblank page rasters. Repeat from a long underlying billing page and a narrow viewport. Printing a PDF is not proof of a physical printer; see [manual QA procedures](docs/manual-testing-guide.md).

### Guru PWA navigation

Keep the five tabs in their actual order:

| Tab | Route |
| --- | --- |
| Beranda | `/guru` |
| Jadwal | `/guru/jadwal` |
| Presensi | `/guru/absen` |
| Honor | `/guru/honor` |
| Profil | `/guru/profil` |

Teaching cards open through an applicable class/session in Jadwal at `/guru/mengajar/[id]`; Mengajar is not a sixth tab or a replacement for Beranda. User guides and account settings are reached through Profil. Place future teacher features beneath the relevant existing area rather than adding a sixth bottom tab.

Keep cards and fields usable with one hand, but position bottom actions above navigation using the safe-area/clearance rules in Layout. Verify the final focused input, virtual keyboard and last scrollable action rather than assuming that a fixed button is reachable.

### Offline attendance and recovery

Current offline storage covers teacher attendance check-in/check-out only. Teaching cards, honor/payroll, billing and CMS are not automatically offline-capable. [AttendanceClient](src/components/guru/attendance-client.tsx) and the [IndexedDB queue](src/lib/pwa/db.ts) are the source contracts.

The following state distinctions are required for new work; they are not a claim that every legacy message already implements this wording:

| State | What the UI can truthfully say | Recovery or next action |
| --- | --- | --- |
| Offline, no confirmed local save | Connection is unavailable; saving is not yet confirmed | Obtain required permissions/data, then establish whether the local write succeeded |
| Queued locally | “Tersimpan di perangkat; belum terkirim” after IndexedDB confirms the write | Show pending count and retain the record while waiting for connectivity |
| Synchronizing | A real sync request is in progress, not a completed server save | Prevent overlapping sync attempts while keeping unrelated navigation usable |
| Server-confirmed | The server accepted the specific queued records | Remove only acknowledged IDs from the queue and update the pending count |
| Failed or rejected sync | The record remains pending; show a known reason without inventing one | Retain data, explain permission/validation/network recovery, and use the existing retry/sync path |

A network indicator based on `navigator.onLine` is not proof of server connectivity or a successful attendance write. An optimistically checked-in card and an empty spinner are not payroll eligibility proof. Never label a queued record as server-confirmed, invent success percentages, clear genuine pending records on logout, or synchronize another teacher's queue. Account scope and deterministic attendance IDs remain intact through retries.

GPS denial, unsupported location, missing coordinates, or a validation rejection needs a factual explanation and recovery; do not fabricate attendance or overwrite stored coordinates to make a test pass. Database reseeding changes identities but does not clear a browser queue; use disposable profiles for QA and obtain separate approval before any reset.

Serwist is [disabled during development](next.config.ts). A loaded dev page can exercise its JavaScript/IndexedDB queue, but does not prove cold offline reload, installation or service-worker caching. Verify those behaviours on an approved secure production-mode origin with an active worker, and record physical-device versus emulated evidence. Do not allocate another development port without checking the workstation registry.

## Do's and Don'ts

### Do
- **Do** start from the linked components and preserve the Friendly Classroom identity rather than inventing a parallel library.
- **Do** keep the YAML primitives, source CSS, this usage guide and the sidecar consistent; record deliberate legacy exceptions instead of claiming an automatic application fix.
- **Do** verify touch targets, reflow, keyboard focus, labels, error recovery and actual contrast for each new surface.
- **Do** distinguish a local queued action from a server-confirmed result and protect pending data.
- **Do** inspect every native PDF page and verify the selected document independently of other print surfaces.

### Don't
- **Don't** invent utility aliases, component exports, enum values, or navigation tabs that the code does not provide.
- **Don't** call `showModal()` on a generic portal/container or assume that moving DOM supplies modal behaviour.
- **Don't** copy a small legacy action target or an undefined `pb-safe` class as a new-feature standard.
- **Don't** communicate state only with colour, suppress useful errors, or use humour for consequential financial/permission failures.
- **Don't** hide data, crop documents, disable zoom, or prevent recovery to make a layout check appear to pass.
