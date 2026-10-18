# Release Readiness Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining Admin DAL boundary violations and harden SPP, Payroll, shared filters, and mobile navigation controls without changing business behavior or database schema.

**Architecture:** Reuse the existing `src/lib/` services as the only Server Component data-access boundary. Add narrowly scoped payroll read helpers for the two queries currently embedded in the Payroll page, then keep the existing page fallback order and client prop contracts unchanged. Apply responsive control sizing and explicit form naming at the shared/component boundaries; defer billing-search debouncing, image-dimension cleanup, and `transition-all` cleanup to separate plans.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase server client, Tailwind CSS v4, Vitest, Testing Library, headless Chromium smoke checks.

**Spec:** `progress.md` — `Cross-Surface Release Readiness Audit` dated 2026-10-18.

## Global Constraints

- Do not add database migrations, schema changes, dependencies, routes, or new product features.
- Server Components MUST NOT call raw `supabase.from(...)`; billing and payroll reads MUST go through `src/lib/` services.
- Mobile form controls MUST use `text-base sm:text-sm`; interactive controls MUST remain within the project’s 36–44px touch-target standard, using 44px on coarse/mobile layouts where space permits.
- Preserve existing SPP URL filter state, search-input identity/focus preservation, Payroll period fallback order, period-switch refresh, and adjustment-form reset behavior.
- Do not debounce or otherwise change the SPP search navigation contract in this slice; query-churn optimization is deferred.
- No copy, authorization, RPC, financial calculation, or persistence behavior changes.
- Mobile action bars MUST make the primary action full-width and first on mobile, then return to side-by-side actions from `sm:` upward.
- Run `./init.sh`, responsive browser smoke at 360px, 375px, and 1280px, and the mechanical UI detector before delivery.

## Review Focus

- **No current open Payroll period / no historical period:** the page creates the current period, includes it in the period selector, and renders its detail. **Test:** Payroll page fallback test in `tests/pages.test.tsx` plus DAL null-result coverage in `tests/crud/payroll-dal.test.ts`.
- **Supabase read failure:** new Payroll period helpers throw explicit domain errors instead of returning ambiguous empty state. **Test:** error-mapping cases in `tests/crud/payroll-dal.test.ts`.
- **SPP search accessibility and filter composition:** the search remains named, URL-backed, and preserves existing filter composition. **Test:** accessible-name/name assertions in `tests/components/billing-client.test.tsx`; retain existing rapid filter composition test.
- **360px/375px mobile controls:** controls meet the minimum height/font-size contract and the document does not gain horizontal overflow. **Test:** authenticated browser smoke in the final verification task.
- **Server-prop refreshes:** SPP search focus/value and Payroll period/adjustment state continue to settle from new server props. **Test:** retain and rerun existing `billing-client.test.tsx` and `payroll-period-client.test.tsx` regression cases after styling/prop-boundary edits.

---

## File Map

- **Modify `src/lib/payroll.ts`** — expose typed period-list and latest-period read helpers with explicit Supabase error handling.
- **Modify `src/app/admin/spp/page.tsx`** — replace the inline active-branch query with `getBranches()`.
- **Modify `src/app/admin/payroll/page.tsx`** — replace inline latest-period and period-list queries with payroll DAL helpers; preserve current-period/open-period/latest-period/create fallback order.
- **Modify `src/components/admin/search-filter-bar.tsx`** — standardize shared search/filter controls, form metadata, and clear/reset touch targets.
- **Modify `src/components/admin/admin-shell.tsx`** — enlarge mobile navigation/logout hit areas without changing desktop layout.
- **Modify `src/components/admin/billing/billing-client.tsx`** — style SPP filters/actions responsively and name the search control.
- **Modify `src/components/admin/billing/payment-modal.tsx`** — align payment form fields/actions with the same mobile typography and touch contract.
- **Modify `src/components/admin/payroll/payroll-period-client.tsx`** — align period selector, period actions, confirmation controls, and new-period controls.
- **Modify `src/components/admin/payroll/payroll-adjustment-form.tsx`** — align adjustment fields and action buttons.
- **Modify `tests/crud/payroll-dal.test.ts`** — cover new typed payroll read helpers and error paths.
- **Modify `tests/pages.test.tsx`** — cover SPP DAL branch loading and Payroll fallback/page rendering with mocked DAL services.
- **Modify `tests/components-admin.test.tsx`** — cover shared search control naming and existing shell interactions.
- **Modify `tests/components/billing-client.test.tsx`** — cover explicit SPP search accessible name and `name` contract while retaining filter refresh regressions.
- **Modify `tests/components/payroll-period-client.test.tsx`** — retain period refresh/adjustment reset coverage and add selector/control accessibility assertions if needed by the final markup.
- **Modify `progress.md` and `session-handoff.md`** — record implementation evidence, final verification, and the deferred optimization items.

No files are created by the implementation; all changes fit existing service, page, component, and test boundaries.

---

### Task 1: Add typed Payroll period read services

**Files:**
- Modify: `src/lib/payroll.ts:4-13,113-128` and adjacent read-service section
- Test: `tests/crud/payroll-dal.test.ts:1-69`

**Interfaces:**
- Consumes: existing `PayrollPeriodRow`, `createClient()`, and Supabase query conventions already used by `getOpenPayrollPeriod`.
- Produces:
  - `export type PayrollPeriodSummary = Pick<PayrollPeriodRow, "id" | "period_month" | "status">`.
  - `export async function getLatestPayrollPeriodId(): Promise<string | null>`; query `payroll_periods`, select only `id`, order `period_month` descending, limit 1, return `null` when no row exists.
  - `export async function getPayrollPeriods(): Promise<PayrollPeriodSummary[]>`; query `payroll_periods`, select `id, period_month, status`, order `period_month` descending, return `[]` for a successful null data result.
  - Both helpers throw explicit `Error` messages containing the Supabase error message when the read fails.

- [ ] **Step 1: Write failing DAL tests**

  Add tests with these names and observable assertions:
  - `returns the latest payroll period id or null when none exists` — a mocked `maybeSingle()` row returns its `id`; a second null result resolves to `null`; assert the latest query uses descending `period_month` ordering and `limit(1)`.
  - `returns payroll period summaries in database order` — a mocked list resolves unchanged with only `id`, `period_month`, and `status` fields.
  - `maps payroll period read errors to explicit domain errors` — latest-id and period-list failures reject with messages beginning `Gagal membaca periode payroll` / `Gagal membaca daftar periode payroll` and include the Supabase message.

- [ ] **Step 2: Run the targeted tests to verify they fail**

  Run: `npm test -- tests/crud/payroll-dal.test.ts`

  Expected: FAIL because the two new exports do not exist.

- [ ] **Step 3: Implement the two helpers in `src/lib/payroll.ts`**

  Keep query ownership in the DAL, use the same `createClient()` instance pattern as neighboring functions, and do not alter `getOpenPayrollPeriod` or any mutation/RPC behavior.

- [ ] **Step 4: Run the targeted tests to verify they pass**

  Run: `npm test -- tests/crud/payroll-dal.test.ts`

  Expected: PASS for the full Payroll DAL test file.

- [ ] **Step 5: Commit the DAL contract**

  ```bash
  git add src/lib/payroll.ts tests/crud/payroll-dal.test.ts
  git commit -m "refactor(payroll): expose period reads through DAL"
  ```

---

### Task 2: Cut SPP and Payroll pages over to DAL services

**Files:**
- Modify: `src/app/admin/spp/page.tsx:1-39`
- Modify: `src/app/admin/payroll/page.tsx:1-64`
- Test: `tests/pages.test.tsx:1-106,225-482`

**Interfaces:**
- Consumes: `getBranches()` from `src/lib/branches.ts`; `getLatestPayrollPeriodId()` and `getPayrollPeriods()` from Task 1; existing `getOpenPayrollPeriod()`, `createPayrollPeriod()`, and `getPayrollPeriodForAdmin()`.
- Produces: unchanged `AdminBillingPage` and `AdminPayrollPage` props/client contracts. Neither page imports `createClient` or contains `.from(...)` calls after this task.

- [ ] **Step 1: Add page behavior tests around DAL-provided data**

  Extend the existing page test mocks/imports with `getBillingSummary`, `getLatestPayrollPeriodId`, `getPayrollPeriods`, `getOpenPayrollPeriod`, `getPayrollPeriodForAdmin`, and `createPayrollPeriod`. Add these tests:
  - `renders AdminBillingPage with DAL-provided active branches` — mock summary/branches, render with empty search params, assert the page heading and the branch filter option are present.
  - `uses the latest Payroll period when no current open period exists` — mock `getOpenPayrollPeriod()` as `null`, `getLatestPayrollPeriodId()` as `period-2`, return period summaries/detail, render with empty search params, assert `Periode November 2026` is rendered and `createPayrollPeriod` is not called.
  - `creates and renders a current Payroll period when no period exists` — mock both read helpers as empty/null, return a created period from `createPayrollPeriod`, render, and assert the created period detail is shown.

- [ ] **Step 2: Run the page tests to verify the new cases fail or expose the old inline-read contract**

  Run: `npm test -- tests/pages.test.tsx`

  Expected: the new tests fail until the page mocks and DAL imports are wired; existing page tests remain green.

- [ ] **Step 3: Replace inline reads without changing fallback order**

  In `src/app/admin/spp/page.tsx`, import `getBranches` and use it in the existing `Promise.all` alongside `getBillingSummary`; remove the server-client import and branch query.

  In `src/app/admin/payroll/page.tsx`, remove the server-client import. Preserve this exact decision order when `searchParams.period` is absent:
  1. `getOpenPayrollPeriod(currentMonthDate)`;
  2. `getLatestPayrollPeriodId()`;
  3. `createPayrollPeriod(user.id, currentMonthDate)` when no existing period exists.

  Fetch `getPayrollPeriods()` for the selector in the same final page data path and keep `getPayrollPeriodForAdmin(targetPeriodId)` as the detail source. Do not change period status labels or mutation actions.

- [ ] **Step 4: Run the page tests to verify they pass**

  Run: `npm test -- tests/pages.test.tsx`

  Expected: all page tests pass, including the three new billing/payroll cases.

- [ ] **Step 5: Commit the page cutover**

  ```bash
  git add src/app/admin/spp/page.tsx src/app/admin/payroll/page.tsx tests/pages.test.tsx
  git commit -m "refactor(admin): route billing and payroll reads through DAL"
  ```

---

### Task 3: Standardize shared search/filter and Admin shell controls

**Files:**
- Modify: `src/components/admin/search-filter-bar.tsx:82-143`
- Modify: `src/components/admin/admin-shell.tsx:303-386`
- Test: `tests/components-admin.test.tsx:270-298,366-410`

**Interfaces:**
- Consumes: existing `SearchFilterBar` query behavior and `AdminShell` navigation/logout behavior.
- Produces: unchanged router URLs and labels, plus the following DOM contract:
  - shared search input has `name="search"`, `inputMode="search"`, `autoComplete="off"`, `text-base sm:text-sm`, and a 44px mobile / 36px desktop minimum height;
  - shared selects use the same mobile/desktop typography and minimum height;
  - clear/reset actions remain keyboard-focusable and meet the same touch target rule;
  - mobile navigation and mobile logout controls have 44px hit areas while desktop sizing remains unchanged.

- [ ] **Step 1: Extend component tests for the new form contract**

  In `SearchFilterBar` tests, query the control by role/name rather than only placeholder and assert `name="search"` and `inputmode="search"`; continue submitting the form and clicking reset to prove query behavior is unchanged. In the `AdminShell` test, continue opening/closing the drawer and logging out through the existing accessible labels.

- [ ] **Step 2: Run the targeted component tests to establish the failing contract**

  Run: `npm test -- tests/components-admin.test.tsx`

  Expected: the new search metadata assertions fail before implementation.

- [ ] **Step 3: Implement shared responsive control classes and metadata**

  Update only the shared control class lists and form attributes. Use explicit `min-h-[44px] sm:min-h-[36px]`, `text-base sm:text-sm`, and `focus-visible` styling for the clear button. Add 44px mobile hit areas to the shell’s navigation trigger and logout controls; preserve `aria-label`s and all route/transition logic.

- [ ] **Step 4: Run the targeted component tests**

  Run: `npm test -- tests/components-admin.test.tsx`

  Expected: PASS with existing navigation/query assertions intact.

- [ ] **Step 5: Commit the shared control contract**

  ```bash
  git add src/components/admin/search-filter-bar.tsx src/components/admin/admin-shell.tsx tests/components-admin.test.tsx
  git commit -m "fix(admin): standardize shared mobile controls"
  ```

---

### Task 4: Harden SPP and Payroll surface controls

**Files:**
- Modify: `src/components/admin/billing/billing-client.tsx:238-303`
- Modify: `src/components/admin/billing/payment-modal.tsx:140-243`
- Modify: `src/components/admin/payroll/payroll-period-client.tsx:195-410`
- Modify: `src/components/admin/payroll/payroll-adjustment-form.tsx:34-171`
- Test: `tests/components/billing-client.test.tsx:108-281`
- Test: `tests/components/payroll-period-client.test.tsx:129-272`

**Interfaces:**
- Consumes: unchanged `BillingClient` URL/filter state, `PaymentModal` form submission contract, `PayrollPeriodClient` period/action state, and `PayrollAdjustmentForm` action payload.
- Produces:
  - Billing search has `aria-label="Cari tagihan SPP"`, `name="q"`, `inputMode="search"`, and `autoComplete="off"`.
  - SPP branch/status selects, search input, invoice-generation action, payment fields/actions, Payroll period selector, Payroll actions, new-period controls, adjustment fields, and adjustment actions use 44px mobile / 36px desktop minimum heights and `text-base sm:text-sm` for form controls.
  - Existing server-prop synchronization, filter composition, modal opening, period switching, adjustment reset, and mutation payloads remain unchanged.
- Mobile action bars in payment, Payroll confirmation/new-period, and adjustment forms show the primary action first/full-width and the secondary action below it; desktop restores a compact side-by-side layout.

- [ ] **Step 1: Add failing accessible-control assertions**

  In `tests/components/billing-client.test.tsx`, add `renders a named SPP search control` and assert:
  - `screen.getByRole("textbox", { name: "Cari tagihan SPP" })` exists;
  - it has `name="q"` and `inputmode="search"`;
  - existing filter controls and invoice actions still render.

  In `tests/components/payroll-period-client.test.tsx`, assert the period picker remains available by `aria-label="Pilih Periode Payroll"` after rendering a period with `allPeriods`; retain the existing refresh/reset/action tests unchanged.

- [ ] **Step 2: Run targeted component tests to verify the new SPP contract fails**

  Run: `npm test -- tests/components/billing-client.test.tsx tests/components/payroll-period-client.test.tsx`

  Expected: the new SPP search metadata assertion fails before implementation; existing regressions pass.

- [ ] **Step 3: Implement surface-level sizing, naming, and mobile action ordering**

  Add the SPP search metadata and apply the responsive class contract to SPP selects/search/action and payment-modal fields/actions. In `PaymentModal`, render the save/submit action first in the mobile action stack and make it full-width, with Batal below it; restore a compact side-by-side layout at `sm:`.

  Apply the same contract to Payroll’s period selector, open/close/paid/new-period/confirmation controls, month input, adjustment form fields, and adjustment actions. Make confirmation/new-period and adjustment primary actions full-width and first on mobile, then side-by-side at `sm:`. Do not modify `handleFilterChange`, `useEffect` prop synchronization, router URLs, action calls, or financial values.

- [ ] **Step 4: Run targeted component tests to verify behavior remains green**

  Run: `npm test -- tests/components/billing-client.test.tsx tests/components/payroll-period-client.test.tsx`

  Expected: all billing/payroll component tests pass, including search-focus, rapid-filter-composition, period-refresh, adjustment-reset, modal, and mutation tests.

- [ ] **Step 5: Commit the surface control hardening**

  ```bash
  git add src/components/admin/billing/billing-client.tsx src/components/admin/billing/payment-modal.tsx src/components/admin/payroll/payroll-period-client.tsx src/components/admin/payroll/payroll-adjustment-form.tsx tests/components/billing-client.test.tsx tests/components/payroll-period-client.test.tsx
  git commit -m "fix(admin): harden billing and payroll controls"
  ```

---

### Task 5: Integrated verification, browser proof, and handoff evidence

**Files:**
- Modify: `progress.md` — append remediation status and evidence
- Modify: `session-handoff.md` — replace the recommended-next-step block with completed remediation details and deferred optimization items
- Do not modify: `feature_list.json` unless feature status/evidence actually changes; this slice does not add a feature.

**Interfaces:**
- Consumes: completed Tasks 1–4 and the existing admin test accounts/local Supabase data.
- Produces: reproducible full-suite, build, detector, and responsive browser evidence with a clean working tree.

- [ ] **Step 1: Run the complete automated verification**

  Run: `./init.sh`

  Expected: ESLint passes with zero errors/warnings, Vitest passes with zero failures, and the production Webpack build completes successfully.

- [ ] **Step 2: Run the mechanical UI detector on changed targets**

  Run: `.claude/skills/impeccable/scripts/impeccable detect --json src/components/admin src/app/admin/spp/page.tsx src/app/admin/payroll/page.tsx`

  Expected: `[]` or only findings verified as unrelated to this slice; fix any new finding before handoff.

- [ ] **Step 3: Execute authenticated browser smoke at 360px, 375px, and 1280px**

  Exercise `/admin/guru`, `/admin/murid`, `/admin/spp`, and `/admin/payroll` with the Admin account. At each viewport:
  - assert `document.documentElement.scrollWidth === window.innerWidth`;
  - inspect visible search/select/button controls and assert mobile controls are at least 36px high, mobile form controls use at least 16px computed font size, and the 1280px layout remains intact;
  - verify SPP search/filter URL state and preserved input value after navigation;
  - open the SPP payment modal without submitting and inspect its fields/actions;
  - switch Payroll periods and open/close the adjustment/new-period controls without submitting destructive mutations;
  - record browser console/errors and screenshots for the final evidence.

- [ ] **Step 4: Update continuity artifacts with observed results**

  Record exact test count/coverage/build result, detector result, browser viewports, overflow result, and any deferred work in `progress.md` and `session-handoff.md`. Do not claim production deployment or database changes.

- [ ] **Step 5: Commit the final evidence**

  ```bash
  git add progress.md session-handoff.md
  git commit -m "docs: record release readiness remediation"
  ```

- [ ] **Step 6: Confirm repository state**

  Run: `git status --short --branch`

  Expected: clean working tree; the plan’s implementation commits and final evidence commit are present.

---

## Self-Review Notes

- **Spec coverage:** DAL violations, mobile typography/touch targets, SPP search naming, responsive browser proof, and handoff evidence each map to a task. Deferred P2 optimizations are explicitly excluded.
- **Step scan:** Every implementation task starts with a failing or behavior-pinning test, names the exact files/interfaces, and ends with a targeted verification and commit.
- **Type consistency:** `PayrollPeriodSummary`, `getLatestPayrollPeriodId()`, and `getPayrollPeriods()` are introduced in Task 1 and consumed by Task 2 with matching signatures.
- **Review focus coverage:** Fallback creation, read errors, search composition, responsive dimensions, and server-prop refresh behavior are assigned to Tasks 1–5.
- **Proportion:** The plan stays within the existing DAL/page/component boundaries; no new abstraction, dependency, migration, or secondary optimization is introduced.
