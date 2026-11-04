# Financial Safety and Automatic Minimum-Income Top-up Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all reviewed financial/privacy/search/shift issues and book an auditable automatic minimum-income adjustment exactly once when an admin closes payroll.

**Architecture:** Use new version-controlled PostgreSQL migrations for admin RPC guards, a current-assignment teacher summary boundary, and the owner-selected atomic close-period top-up. Keep protected HTML/RSC network-only, maintain independent editable search drafts, and preserve existing scheduling and payroll history contracts. Implement seven independently reviewable vertical tasks; this document coordinates them without treating them as one unreviewable patch.

**Tech Stack:** Existing Next.js 16.3.7 App Router, React 19, TypeScript, Supabase/PostgreSQL, Serwist, Vitest, and installed `pg`/`dotenv`; no new dependency.

**Spec:** [Financial safety and minimum-income design](../specs/2026-11-04-financial-safety-and-minimum-income-design.md).

**Status:** Planning only. The owner approved the database approach and requested this spec/plan; implementation, production migration/deployment, and publication are not completed or implied. Reviewed application baseline: `9a982cea2db0e618d67949a10e0d8b9836ec5d52`.

## Global Constraints

- All SQL changes use **new migrations**; do not rewrite already-applied migrations or manually edit live schema/policies/RPCs.
- Local disposable fixtures only for financial writes; verify loopback database/API targets before any mutation. No production writes, reset, seed, migration deployment, or manual app deployment without separate authorization.
- Admin mutations retain centralized `requireAdminAction()` / `requireAdminPage()` checks and database authorization. Teacher pages/actions retain their existing guards.
- All database reads stay in DAL modules/RPCs, not UI components. Authorization must also survive direct API access.
- Keep integer rupiah, WIB calendar boundaries, `open -> closed -> paid`, and teacher read-only billing. Marking paid records ledger state; it does not transfer money.
- Preserve submitted teaching-card locking, historical card readability, and the separate teacher-scoped attendance IndexedDB queue.
- Preserve `300 ms` search debounce, immediate Enter/dropdown application, mounted input identity, and focus.
- UI uses existing primitives and Indonesian copy; `Rp` plus amount stays together using a nonbreaking space, `whitespace-nowrap`, and `tabular-nums`.
- Verify 360px, 375px, an intermediate width, and 1280px+: zero document overflow; mobile/touch targets at least 44px; deliberately compact desktop controls at least 36px; form text at least 16px on mobile.
- No new third-party dependencies, compatibility aliases, generic policy engines, or feature scaffolds.
- Follow the complete spec's remaining invariants. Product code is not changed during this planning session.

## Review Focus

1. **A-B-A search edits and out-of-order acknowledgments:** version edits, not only text, so returning to a prior query does not discard newer work (Task 4 regression).
2. **Duplicate requested class IDs and repeated placement pairs:** deduplicate authorization relations before aggregating, so a pupil's money is never multiplied (Task 2 database contract).
3. **An exact 1,000-summary-row page followed by a failure:** fetch the next page, and discard the entire enrichment on failure rather than show a valid-looking partial total (Task 2 boundary regression).
4. **Closing while profile settings change, then applying a manual deduction:** use the captured minimum/allowance snapshot once; do not cancel the later deduction or rewrite history (Task 5 database contracts).
5. **Worker upgrade with genuine queued attendance and previously cached private responses:** evict unsafe response caches without deleting or syncing another teacher's IndexedDB records (Task 3 real-worker browser gate).

---

## File and migration map

| Responsibility | Create / modify |
| --- | --- |
| Local-only SQL behavior runner and rollback-owned fixtures | Create `scripts/verify-financial-contracts.mjs`, `scripts/sql/financial-contract-fixtures.sql`, and the three suite files named in Tasks 1, 2, 5. Reuse target-safety conventions from `scripts/lib/seed-target.mjs` without changing its seeding responsibilities. |
| Billing RPC privilege / actor boundary | Create `supabase/migrations/20261104090000_harden_billing_rpc_authorization.sql`; preserve DAL/action signatures. |
| Authorized aggregate and minimal roster cutover | Create `supabase/migrations/20261104091000_authorize_teacher_overdue_summaries.sql`, `src/lib/teacher-billing.ts`, `src/lib/teacher-roster.ts`; modify both teacher DALs, `src/types/database.ts`, and meaningful affected tests. |
| PWA response boundary and upgrade | Modify `src/app/sw.ts`; regenerate `public/sw.js` only through a matching build; replace copied-policy tests with production-policy behavior coverage where useful and mandatory real-worker proof. |
| Billing draft/history lifecycle | Modify `src/components/admin/billing/billing-client.tsx`, `tests/components/billing-client.test.tsx`. |
| Atomic guarantee ledger | Create `supabase/migrations/20261104092000_book_minimum_income_topups.sql`; modify generated database types, payroll DAL types/fixtures as required, and owned fixture invariants. |
| Truthful compensation surfaces | Modify admin payroll list, teacher honor page, Master Guru minimum help, associated UI tests and user/domain docs named in Task 6. |
| Shift editing/recovery | Modify `src/lib/shifts.ts`, `src/app/admin/shift/actions.ts`, `src/components/admin/shift/shift-form.tsx`, associated behavior tests and guide. |
| Completion evidence | Maintain `feature_list.json`, `progress.md`, `session-handoff.md`, and `docs/manual-testing-guide.md` with executed evidence. |

Migration names above reserve ordered files for this plan. Before creating them, check the latest local/remote migration inventory for collisions or newer schema changes; keep ordering and update this plan if allocation changes. Creating the plan does not create or apply those migrations.

## Dependency and execution rules

Task 1 creates the database contract runner used by Tasks 2 and 5. Task 2 is one coordinated database/DAL cutover; do not ship financial SELECT revocation without its reader. Task 3 and Task 4 are independent of ledger changes. Task 6 consumes Task 5's generated `kind` field. Task 7 is independent of billing/payroll behavior. Execute one vertical slice at a time under the project harness, with focused red/green checks and a review after each slice; run the full global lint/test/build gate once after integration rather than repeatedly while other edits are in flight.

Before implementing, read all project startup files, installed Next documentation for the affected APIs, and run `./init.sh` in the chosen execution checkout. Keep a generated worker with its matching build; do not restore a different committed worker into a running production build and then diagnose the resulting install failure as an application cache proof. Check the existing workstation port registry before launching a server; do not allocate another port casually. Use LSP references before exported-symbol changes and migrate all callers, including tests, without shims.

## Task 1: Close the anonymous billing mutation boundary

**Acceptance:** SEC-01; foundations for real database acceptance, not source-text assertions.

**Files:**
- Create: `supabase/migrations/20261104090000_harden_billing_rpc_authorization.sql`.
- Create: `scripts/verify-financial-contracts.mjs`, `scripts/sql/financial-contract-fixtures.sql`, `scripts/sql/billing-security-contracts.sql`.
- Retire: source-string assertions in `tests/security/billing-migration-schema.test.ts`; remove the obsolete file if no behavioral cases remain. Do not replace it with new `toContain` assertions.
- Preserve: `src/lib/billing.ts`, `src/app/admin/spp/actions.ts`, and their meaningful domain tests unless a real contract change requires an update.

**Interfaces:**
- Preserve `generate_due_student_invoices(text DEFAULT NULL)` and `record_student_payment(uuid, text, date DEFAULT CURRENT_DATE, text DEFAULT NULL, text DEFAULT NULL)` successful API shapes.
- Runner CLI: `node scripts/verify-financial-contracts.mjs --suite billing-security|teacher-billing|payroll-minimum|all`.
- Runner module export: `runFinancialContracts(suites: readonly ("billing-security" | "teacher-billing" | "payroll-minimum")[]): Promise<void>`; no application import depends on it.
- Each suite uses common temporary `qa_financial_ids(key text PRIMARY KEY, id uuid NOT NULL)` IDs and random, explicitly dummy fixture names; no hard-coded deployment IDs. SQL cases are named in assertion/error messages. Transactions roll back unless a specific concurrency/HTTP smoke tracks committed IDs for checked cleanup.

- [ ] **Step 1: Add the guarded runner and failing behavioral cases.** Load local credentials without printing them, reject non-loopback API/database targets before connection, verify expected schema/migrations, and never auto-reset/apply migrations. Establish owned dummy admin/guru users, student/program enrollment, invoice and counters. Cases: `anonymous_generation_denied`, `anonymous_payment_denied`, `guru_generation_denied`, `guru_payment_denied`, `uidless_service_call_denied`, `admin_generation_idempotent`, `admin_payment_attributed_once`. Assert SQLSTATE `42501`/effective EXECUTE denial and unchanged owned ledger for rejected cases; admin success has one payment, `status = 'paid'`, `received_by = authenticated_admin_id`, and no duplicate receipt/payment on replay. Retain real role switching and `request.jwt.claim.sub` semantics, not mocked `is_admin()`.

  Core assertions inside `anonymous_payment_denied`, after catching the attempted call under the anonymous role (the case records its exception as `v_sqlstate`):
  ```sql
  ASSERT v_sqlstate = '42501', 'anonymous_payment_denied: wrong authorization result';
  ASSERT (SELECT count(*) FROM public.student_payments
          WHERE invoice_id = (SELECT id FROM qa_financial_ids WHERE key = 'invoice')) = 0,
         'anonymous_payment_denied: payment was created';
  ```

- [ ] **Step 2: Run the new suite before applying the fix.** `node scripts/verify-financial-contracts.mjs --suite billing-security`. Expected RED: the anonymous guard/privilege cases fail on the baseline. Record the actual failure and verify rollback/cleanup; no production endpoint is eligible.
- [ ] **Step 3: Implement the migration.** Replace only the two existing function definitions; reject null UID OR non-admin before side effects with `42501`, revoke PUBLIC/anon EXECUTE, retain intended authenticated/service grants subject to the same actor guard, and use the authenticated UID for payment attribution. Remove the arbitrary first-admin fallback. Preserve function argument defaults, numbering, locks and successful idempotence semantics.
- [ ] **Step 4: Apply locally and prove the Data API boundary.** Use the repository's Supabase CLI migration path after local-target validation; run the runner GREEN. In a throwaway authenticated/anonymous API smoke, attempt both mutation RPCs against owned fixtures, assert denial leaves status/rows unchanged, and perform one legitimate admin payment/generation. Reuse existing action authorization tests: `npm test -- --coverage.enabled=false tests/security/billing-actions.test.ts`. No new permanent tests that only echo an RPC mock call.
- [ ] **Step 5: Document and commit the complete slice.** Record role, endpoint, before/after counts, error codes, attribution, cleanup and limits in `progress.md` / manual QA. `git add` only this task's migration, runner, SQL cases, retired tests and evidence; commit `fix(billing): reject unauthenticated financial RPC calls`.

## Task 2: Cut over to current-assignment teacher summaries and complete totals

**Acceptance:** SEC-02, DEBT-01, DEBT-02, DEBT-03; includes raw policies, both consumers, archives, transfers, secondary rosters and response caps as one compatible deliverable.

**Files:**
- Create: `supabase/migrations/20261104091000_authorize_teacher_overdue_summaries.sql`, `src/lib/teacher-billing.ts`, `src/lib/teacher-roster.ts`, `scripts/sql/teacher-billing-contracts.sql`, `tests/teacher-billing.test.ts`, `tests/teacher-roster.test.ts`.
- Modify: `src/lib/teacher-schedule.ts`, `src/lib/teaching-logs.ts`, `src/types/database.ts`, `tests/teacher-schedule.test.ts`, `tests/crud/teaching-log-dal.test.ts`, and affected teacher UI fixtures only where necessary.
- Preserve: teacher HTML/RSC ownership guards, teaching-card submission/history behavior, admin financial reads/writes.

**Interfaces:**
- SQL RPC `get_teacher_overdue_spp(p_class_ids uuid[])` returns exactly `(class_id uuid, student_id uuid, program_id uuid, due_date date, total_amount bigint, invoice_count bigint)`.
- New DAL exports `StudentOverdueSppInfo` and `getTeacherOverdueSppByClass(supabase: SupabaseClient<Database>, classIds: readonly string[]): Promise<Map<string, StudentOverdueSppInfo>>`; keys are `${class_id}:${student_id}:${program_id}`.
- Roster RPC `get_teacher_class_students(p_class_ids uuid[])` returns `(class_id uuid, student_id uuid, full_name text, student_number text)` for owned active or historical classes. `src/lib/teacher-roster.ts` exports `TeacherRosterStudent` (`id`, `full_name`, nullable `student_number`) and `getTeacherClassStudents(supabase: SupabaseClient<Database>, classIds: readonly string[]): Promise<Map<string, TeacherRosterStudent[]>>`; keys are class IDs.
- Existing `TeacherClassItem.students[].overdue_spp`, `overdue_students_count`, `TeacherScheduleClassForLog.students[].overdue_spp`, and public teacher DAL signatures remain unchanged.

- [ ] **Step 1: Add failing real-database and meaningful DAL regressions.** Cases: `raw_invoice_and_receipt_rows_hidden_from_guru`, `only_owned_active_class_program_pairs`, `duplicate_inputs_do_not_multiply_debt`, `archived_class_has_no_live_summary`, `transferred_invoice_matches_current_assignment`, `secondary_branch_roster_is_readable`, `archived_secondary_card_preserves_students_without_live_debt`, `minimal_roster_has_no_financial_or_guardian_fields`, `paid_cancelled_due_today_and_other_program_excluded`, `earliest_date_count_and_total_across_1001_invoices`. For the last case create 1,001 owned past-due invoices of Rp1,000 each using unique real calendar periods, and assert count `1001`, sum `1001000`, earliest known due date; include other-program invoices that must not affect it. Add adapter cases for 999/1,000/1,001 summary and roster groups, exact-page continuation, empty class input, and later-page failure producing no partial enrichment/roster. These assert actual returned data and authorization behavior, not source strings or RPC forwarding.

  In `earliest_date_count_and_total_across_1001_invoices`, set the first known due date to `1940-01-08` and keep all generated calendar periods in the past. After selecting the owned class's one aggregate into record `v_summary`:
  ```sql
  ASSERT v_summary.invoice_count = 1001, 'large invoice count truncated';
  ASSERT v_summary.total_amount = 1001000, 'large overdue amount truncated';
  ASSERT v_summary.due_date = DATE '1940-01-08', 'earliest overdue date lost';
  ```

- [ ] **Step 2: Demonstrate baseline failures safely.** Run `node scripts/verify-financial-contracts.mjs --suite teacher-billing` (RED on absent RPC/authorization/large result contract), and `npm test -- --coverage.enabled=false tests/teacher-billing.test.ts tests/teacher-roster.test.ts tests/teacher-schedule.test.ts tests/crud/teaching-log-dal.test.ts`. Do not call unrelated function absence the full large-dataset reproduction: also capture baseline results through the actual old DAL/teacher route with the owned 1,001-invoice dataset before cutover.
- [ ] **Step 3: Implement SQL authorization, aggregation, and minimal roster reads.** Use fixed-empty-search-path security-definer RPCs with fully qualified objects, explicit authenticated-guru guards, and no teacher-ID arguments. Financial summaries use deduplicated owned active class/placement/program joins, WIB strict past-due filtering, and database SUM/COUNT/MIN. Minimal roster reads allow owned historical classes as well, returning only student IDs, names and numbers. Preserve admin raw policies and existing non-financial student permissions; remove branch-wide teacher invoice/payment SELECT without adding broad student RLS. Test malicious unowned class IDs, archived/secondary requests, duplicated IDs, and direct API access independently of UI filters.
- [ ] **Step 4: Generate types and migrate every consumer.** Generate `src/types/database.ts` from the migrated local schema. Implement summary ordering by `class_id`, `student_id`, `program_id` and roster ordering by `class_id`, `student_id`; use `.range(start, start + 999)` until fewer than 1,000 rows. Enforce safe integer financial results. On any summary page failure log once and discard the entire enrichment; roster failures are explicit data-read errors, never successful empty classes. Both teacher readers use cookie-authenticated adapters and replace nested `students` roster dependencies with the minimal roster RPC. Teaching-log DAL selects/types draft status and skips only financial enrichment when not active. Remove both old financial helper exports and all references, moving their shared type to `teacher-billing.ts`. Preserve non-blocking financial-query failure behavior and do not add teacher billing writes.
- [ ] **Step 5: Prove both actual screens and raw API behavior.** Run both suites GREEN. Using real authenticated teacher routes, inspect schedule accordion and teaching card for the same transferred/secondary pupil, archived history without live debt, other-teacher denial, and the full large-dataset amount/count/date. Inspect HTML/RSC payloads as well as visible text. Use owned fixture IDs and verified `finally` cleanup; never merely reproduce the SQL in a separate script and label it DAL/UI proof.
- [ ] **Step 6: Document the cutover and commit.** Update the overdue design/QA spec with current-assignment authorization and full-result semantics; remove obsolete helper references in active documentation, not archival commit history. Commit the entire compatible slice as `fix(guru): authorize complete overdue summaries by active class`.

## Task 3: Isolate protected PWA responses and evict mixed caches

**Acceptance:** CACHE-01; actual upgraded worker proof is mandatory.

**Files:**
- Modify: `src/app/sw.ts`, generated `public/sw.js` through the matching production build, `docs/manual-testing-guide.md`.
- Retire/rewrite: `tests/pwa/sw-cache-policy.test.ts`, which currently tests copied predicates rather than the production worker. Delete its obsolete copied-rule assertions; do not re-pin them to new constants. Retain/add a permanent test only if it executes production cache behavior rather than a mirror.
- Preserve: `src/lib/pwa/db.ts`, attendance mutation/sync/teacher-scoping contracts, normal logout authentication.

**Interfaces:** No new user-facing API, logout storage-clear endpoint, or database contract. Protected paths are `/guru`, `/admin`, `/api`, `/login`, `/logout` and their applicable descendants. New public response caches are `uzma-public-pages-v3` and `uzma-public-rsc-v3`.

- [ ] **Step 1: Establish a real-worker failing baseline.** In an isolated execution checkout/build, build and run matching production assets at an approved existing port. Inspect `navigator.serviceWorker.controller` and activation/asset failures; if inactive, resolve that test prerequisite without modifying away the manifest. In a disposable browser profile seed only owned attendance queue data, load account A's personal schedule/honor/teaching card, sign out, sign in as B, and request the same HTML/RSC/prefetch paths with delayed/offline network. Record any A-content replay and unsafe CacheStorage entries. If replay does not occur, retain the source-backed risk but do not invent a failed observation.

  Required page-world prerequisite before any claimed isolation result:
  ```js
  if (!navigator.serviceWorker.controller) {
    throw new Error("CACHE-01 requires an active production worker");
  }
  ```

- [ ] **Step 2: Implement first-match NetworkOnly and cache upgrade.** Include teacher paths in the hard protected boundary before navigation/RSC/default rules. Keep only public HTML/RSC in the new caches. Activation deletes old mixed `uzma-pages-v2` / `uzma-rsc-v2` and already-known unsafe legacy response caches; preserve static precache and all IndexedDB data. Do not treat HTTP `no-store` alone as CacheStorage protection or clear queues on logout.
- [ ] **Step 3: Exercise upgrade and steady-state isolation.** With an active new controller, verify old unsafe caches disappear, no protected HTML/RSC key appears in new public caches, account B/anonymous cannot receive A's data, offline private navigation yields only the generic offline outcome, and public assets/fallback still work. Verify queued record IDs and values are unchanged before/after upgrade/logout, and B does not synchronize A's queue. Repeat HTML, RSC, prefetch and slow-network routes; network errors must not reveal stale personal content.
- [ ] **Step 4: Review and commit matching assets/evidence.** Keep generated worker and production build consistent for verification; remove no user data. Record browser/controller/build evidence and physical-device limits. Commit `fix(pwa): exclude protected responses and purge mixed caches`. The final integration build below is the publication artifact; do not manually edit the generated worker.

## Task 4: Preserve search drafts and invalidate abandoned history work

**Acceptance:** SEARCH-01 / SEARCH-02; no remount or input lag workaround.

**Files:** Modify `src/components/admin/billing/billing-client.tsx`, `tests/components/billing-client.test.tsx`, affected manual QA search cases.

**Interfaces:** Preserve `BillingClientProps`, `300 ms` delay, canonical `branch` / `status` / `q` URL parameters, `router.push`, and Enter/dropdown behavior. State stays component-local: editable draft tuple, committed tuple, edit version, timer metadata, and in-flight navigation snapshots. No shared state library or general navigation abstraction.

- [ ] **Step 1: Write failing input/navigation regressions.** `earlier_ack_preserves_newer_draft_and_focus`: type `X`, trigger navigation, type `XY`, settle `currentSearch='X'`, assert input `XY` and same focused DOM node, then Enter submits `q=XY` exactly once. `dropdown_flushes_latest_draft_during_earlier_ack`: same sequence plus branch/status change keeps `XY`. `back_and_forward_cancel_pending_search`: establish committed distinct URLs, type an abandoned draft, dispatch/restores real navigation state before 300 ms, assert restored draft/URL and no later push. `a_b_a_edits_use_version_not_text_equality`: return to earlier text with a newer edit, settle the older response, assert newer intent survives. `unmount_cancels_pending_search`: no navigation after disposal. Keep existing payment/receipt behavior tests; remove incidental copy/attribute assertions encountered in this touched suite rather than re-pin them.

  Core assertions after the delayed `X` props settle while `XY` is still the local draft:
  ```tsx
  expect(searchInput).toHaveValue("XY");
  expect(document.activeElement).toBe(searchInput);
  fireEvent.keyDown(searchInput, { key: "Enter" });
  expect(pushMock).toHaveBeenLastCalledWith("/admin/spp?q=XY");
  ```

- [ ] **Step 2: Run focused RED.** `npm test -- --coverage.enabled=false tests/components/billing-client.test.tsx`. Record which race assertions fail before changing the component; ordinary Enter/debounce success is not a substitute.
- [ ] **Step 3: Implement the documented lifecycle.** Increment a ref-backed edit version on local changes; timer closures validate their version. Distinguish own navigation acknowledgments from external/restored URL state. Older own acknowledgments cannot overwrite drafts edited afterward; `popstate` immediately invalidates queued work and adopts restored filters. External URL changes invalidate abandoned work without discarding valid newer edits on own acknowledgments. Enter/dropdowns flush the latest full tuple once; unmount clears timers/listeners. Use installed App Router APIs; no `next/router` events or awaiting `router.push` as a promise.
- [ ] **Step 4: Run GREEN and real-browser scenarios.** Run the focused suite, then intercept/delay actual RSC requests for `X` and assert `XY` remains visible and is used by Enter/dropdowns. Establish each history URL via a URL/DOM condition before Back/Forward; use no fixed sleep as proof of commitment. Observe beyond the debounce deadline and late old response settlement. Verify mounted focus, branch/status preservation, rapid typing, empty search, and refresh with the latest filters.
- [ ] **Step 5: Update evidence and commit.** Commit `fix(billing): preserve search drafts across navigation and history`.

## Task 5: Book one automatic minimum-income adjustment inside closing

**Acceptance:** PAY-01; owner-selected PostgreSQL approach, not a web orchestration or table-trigger payroll generator.

**Files:**
- Create: `supabase/migrations/20261104092000_book_minimum_income_topups.sql`, `scripts/sql/payroll-minimum-contracts.sql`.
- Modify: generated `src/types/database.ts`, `src/lib/payroll.ts` only for required typed row propagation, affected typed fixtures in payroll/honor tests, and `scripts/sql/local-demo-invariants.sql` where its business invariant must include automatic adjustments.
- Retire: `tests/security/payroll-migration-schema.test.ts` source-string tests when replaced by real database contracts; no re-pinning migration text.
- Preserve: `calculatePayrollTotals` as a sum of earned fees, fixed allowances, and persisted adjustments; do not make it continuously enforce a floor on open estimates or historical statements.

**Interfaces:**
- Add `payroll_adjustments.kind: 'manual' | 'minimum_income_topup'`, default `manual`; existing manual row API and RPC arguments stay compatible.
- Preserve `close_payroll_period(p_period_id uuid) RETURNS payroll_periods`, `add_payroll_adjustment(uuid, uuid, integer, text) RETURNS payroll_adjustments`, `mark_payroll_period_paid(uuid)` shapes.
- Generated `PayrollAdjustmentRow.kind` is consumed by Task 6. Automatic reason: `Top-up Garansi Gaji Minimum`; one positive row at most per teacher/period.

- [ ] **Step 1: Add failing SQL behavioral cases.** `shortfall_403000_to_450000_books_47000`: owned fee Rp3,000 + fixed allowance Rp400,000, minimum Rp450,000; assert automatic amount `47000`, total `450000`, admin actor and one typed row. `equal_or_above_minimum_no_row` covers base `450000` / `500000`; `zero_or_unset_minimum_no_row` keeps base `403000`. `active_zero_earnings_gets_configured_guarantee` yields `450000`; `inactive_no_earned_entry_not_created` preserves existing eligibility. `disable_minimum_changes_next_close_only` retains prior minimum/top-up and creates no row on the next eligible close. `legacy_closed_and_paid_not_backfilled` compares existing snapshots. `manual_negative_after_close_stays_effective` applies `-25000`, asserts fixed automatic `47000` and total `425000`; positive manual bonus stays additional. Also assert raw authenticated insert/update/delete cannot forge/reclassify/remove automatic rows and manual RPC cannot set kind.

  Core assertions for `shortfall_403000_to_450000_books_47000`, with owned IDs registered as `period` / `payroll_teacher`:
  ```sql
  ASSERT (SELECT amount FROM public.payroll_adjustments
          WHERE period_id = (SELECT id FROM qa_financial_ids WHERE key = 'period')
            AND teacher_id = (SELECT id FROM qa_financial_ids WHERE key = 'payroll_teacher')
            AND kind = 'minimum_income_topup') = 47000, 'wrong automatic shortfall';
  ASSERT (SELECT total_amount FROM public.payroll_entries
          WHERE period_id = (SELECT id FROM qa_financial_ids WHERE key = 'period')
            AND teacher_id = (SELECT id FROM qa_financial_ids WHERE key = 'payroll_teacher')) = 450000,
         'automatic adjustment missing or double-counted';
  ```

- [ ] **Step 2: Run RED and boundary transaction cases.** `node scripts/verify-financial-contracts.mjs --suite payroll-minimum`. Add `close_failure_rolls_back_all_writes` using a deliberate test-only failure in the transaction, verifying open status and zero owned generated rows. For `concurrent_close_books_once`, the runner uses two real connections and manifest-owned committed fixtures: exactly one success, one domain rejection, one automatic row, no duplicate fee lines. `captured_minimum_during_profile_change` verifies top-up uses the entry snapshot rather than a second profile read; restore only owned profiles and verify cleanup.
- [ ] **Step 3: Implement ledger schema and protected adjustment writes.** Add the checked kind column, positive automatic-kind constraint, and partial unique `(period_id, teacher_id)` index. Revoke direct adjustment DML from PUBLIC/anon/authenticated. Make only close and add-adjustment narrowly authenticated-admin `SECURITY DEFINER` RPCs with empty search path/qualified objects and no PUBLIC/anon EXECUTE; preserve locks/signatures. The manual RPC checks an existing closed-before-paid entry and inserts explicit `kind='manual'`. Do not add UI/private service bypasses or silently ignore duplicate automatic rows.
- [ ] **Step 4: Implement atomic closing arithmetic.** Under the existing period row lock and open-only guard, capture fee/profile/allowance/minimum snapshots using the existing teacher eligibility rule, insert positive `max(0, captured_minimum - captured_fee_and_allowances)` once, sum stored adjustments exactly once into the entry, then close. Do not recompute from mutable profiles after capture, backfill old periods, synthesize zero rows, or add per-teacher web calls after closing. Later manual deductions/bonuses do not recompute the booked subsidy; setting minimum to `0` applies to future closings only.
- [ ] **Step 5: Generate types and prove real closing.** Generate local types and update every typed adjustment fixture/caller without aliases; retain earned-total calculation behavior. Run runner GREEN and `npm test -- --coverage.enabled=false tests/crud/payroll-calculation.test.ts tests/crud/payroll-dal.test.ts tests/security/payroll-actions.test.ts tests/pages/guru-honor.test.tsx tests/components/payroll-period-client.test.tsx`. In a real local admin session close an owned dummy period, inspect the persisted typed row and total via DAL/readback, retry closing, and test next-period disabling. Do not submit a bank transfer or alter real closed/paid records.
- [ ] **Step 6: Record and commit the ledger slice.** Record atomicity, actor, row-kind, manual-adjustment precedence, retry/concurrency and legacy-history evidence; commit `feat(payroll): book minimum income topups atomically at close`.

## Task 6: Align compensation estimates, statements, master help, and domain docs

**Acceptance:** PAY-02; completes the visible feature using Task 5's real ledger row, not a fabricated frontend addition.

**Files:**
- Modify: `src/app/guru/honor/page.tsx`, `src/components/admin/payroll/payroll-period-client.tsx`, `src/components/admin/guru/guru-form.tsx`, `tests/pages/guru-honor.test.tsx`, `tests/components/payroll-period-client.test.tsx`, `tests/components/guru-form.test.tsx`.
- Update: `src/lib/guides/admin/payroll.ts`, `src/lib/guides/guru/honor.ts`, affected guide screenshot alt/captions at `src/lib/guides/guru/screenshots.ts`, `docs/buku-panduan-pengguna.md`, `docs/rumus-gaji-guru.md`, `docs/manual-testing-guide.md`, `docs/superpowers/specs/2026-10-16-payroll-guru-design.md` with an explicit supersession note rather than rewriting historical evidence.
- Update the domain rule in `CLAUDE.md` when runtime changes ship; use the repository-memory improvement skill for that targeted harness correction. Do not make the harness describe a completed top-up during planning.

**Interfaces:** Consume generated `PayrollAdjustmentRow.kind`; never classify by reason text. Existing totals already include the stored row, so the UI must not add it again. Existing manual form accepts amount/reason only.

- [ ] **Step 1: Add consumer-visible statement regressions.** An open period with earned estimate `403000` and configured minimum `450000` still displays earned estimate `403000`, no persisted automatic row, and explains closing-time calculation. A newly closed statement contains one `minimum_income_topup` row of `47000` and total `450000` on both teacher/admin views. A later manual `-25000` row yields `425000` with the original top-up unchanged. A legacy/manual row whose reason resembles a top-up is not labelled automatic. Switching profiles/minimum after close does not change the chosen statement; saving minimum `0` affects the next close only. Assert roles, amounts and transitions, not exact incidental prose copies.

  Core visible-kind assertions for a teacher statement fixture containing exactly one persisted automatic row:
  ```tsx
  expect(screen.getByText("Top-up Garansi Gaji Minimum")).toBeVisible();
  expect(screen.getByText("Otomatis")).toBeVisible();
  ```

- [ ] **Step 2: Run the focused tests RED for the new behavior.** `npm test -- --coverage.enabled=false tests/pages/guru-honor.test.tsx tests/components/payroll-period-client.test.tsx tests/components/guru-form.test.tsx`. Existing wording-only assertions must be removed, not re-pinned.
- [ ] **Step 3: Implement truthful existing-layout presentation.** Open copy: `Gaji minimum terkonfigurasi` / `Top-up dihitung otomatis saat admin menutup periode.` Closed/paid snapshot label: `Gaji minimum periode ini`; typed automatic row reason is the exact persisted reason, with `Otomatis` indicator. Master Guru help: `Isi 0 untuk menonaktifkan top-up pada penutupan periode berikutnya.` Show historic amounts unchanged; no fake received-payment guarantee, top-up preview transaction, or manual kind selector. Retain existing responsive controls/currency invariants.
- [ ] **Step 4: Verify actual admin/teacher flow and docs.** Run tests GREEN. Through UI, configure minimum on an owned teacher, compare open estimate, close the dummy period, inspect both persisted adjustment lists/total, apply an allowed manual correction, disable minimum, and close the next owned period. Verify the required viewports and no double-counted subsidy. Update active guides/domain notes with one-time closing semantics, manual deactivation, post-close manual precedence, and no bank transfer; refresh only affected real sanitized guide screenshots if their content is materially changed. Do not relabel old screenshots as new proof.
- [ ] **Step 5: Commit the visible, documented slice.** Commit `feat(payroll): show automatic guarantee adjustments and lifecycle`.

## Task 7: Resolve valid shift edits and retain safe rejection/retry behavior

**Acceptance:** SHIFT-01; the reported user failure is not explained away by reproducing only an intentional narrowing rejection.

**Files:** Modify `src/lib/shifts.ts`, `src/app/admin/shift/actions.ts`, `src/components/admin/shift/shift-form.tsx`, `tests/crud/shift-time-validation.test.ts`, `tests/components/shift-form.test.tsx`, `src/lib/guides/admin/shifts.ts`, applicable manual QA cases.

**Interfaces:** Preserve `updateShift(id: string, formData: FormData): Promise<ShiftActionResponse | void>`, existing admin guards, and `updateBranchShift(id, data)` including partial name/time updates. No branch reassignment, auto-moving classes, or removal of the class-containment rule.

- [ ] **Step 1: Establish ordinary controls and failing recovery/error cases.** Through an owned shift/class, exercise rename-only, unchanged bounds, and widening, then capture 08:00–08:30 -> 08:05–08:30 rejection with a class at 08:00. Do not change the real user's operational shift. Add `rejected_shift_edit_keeps_name_and_time_inputs_for_retry` and `corrected_shift_edit_can_be_resubmitted`; assert attempted values survive and the corrected submission succeeds. Add DAL cases `name_only_change_does_not_restrict_times`, `partial_time_update_uses_stored_other_bound`, `class_lookup_failure_does_not_update_shift`, `equal_and_inverted_times_rejected`, `matching_hhmm_and_hhmmss_not_false_conflicts`. Retain a meaningful containment rejection assertion; remove incidental copy/format/default tests encountered in the touched suites.

  Core assertions after the owned shift's attempted 08:05 edit is rejected and its name was also edited:
  ```tsx
  expect(screen.getByLabelText(/Jam Mulai/i)).toHaveValue("08:05");
  expect(screen.getByLabelText(/Nama Shift/i)).toHaveValue("Pagi Revisi");
  expect(screen.getByRole("button", { name: /Simpan Perubahan/i })).toBeEnabled();
  ```

- [ ] **Step 2: Run RED on the specific failures.** `npm test -- --coverage.enabled=false tests/crud/shift-time-validation.test.ts tests/components/shift-form.test.tsx`. Record successful/failed ordinary browser controls separately; an expected integrity rejection is not itself a regression test failure.
- [ ] **Step 3: Fix only the observed root paths and specified contract gaps.** Preserve semantic time values and existing opposite bound for partial updates; abort on class-lookup errors. Preserve entered form values after returned errors using existing controlled-form patterns, release the submit guard in `finally`, and keep redirect behavior. Use clear recoverable conflict guidance from spec §8. Do not exempt archived references or add an automatic rescheduling feature. If rename/widen also fails, trace its actual action/DB error and fix that root cause in this same slice rather than suppressing it.
- [ ] **Step 4: Run GREEN and persisted browser readback.** Verify valid rename/unchanged/widen edits save and survive reload; narrowing leaves stored times unchanged and retains attempted input; corrected retry succeeds; a failed lookup never writes. Check mobile and desktop controls/error recovery. Explain the guard and recovery in the shift guide, with no unsupported claim about what the user changed yesterday.
- [ ] **Step 5: Commit the verified slice.** Commit `fix(shift): preserve edit recovery and enforce time containment`.

## Release gate: all tasks and every finding must close with evidence

**Acceptance:** GATE-01. These are release requirements, not completed results.

- [ ] Run `node scripts/verify-financial-contracts.mjs --suite all` on the migrated approved local target; require all case assertions and verified zero owned leftovers. The runner must fail on unsafe targets, failed cleanup, or unexpected SQL/API errors, not emit unconditional `cleanedUp: true`.
- [ ] Run the repository's full `./init.sh` after integration. Record actual lint/test/build output and coverage, not historic 37/496-test results. Do not rerun global gates while delegated edits are still in flight.
- [ ] Build/run the matching production artifact on a registered loopback port. Exercise actual routes and Data API across anon/admin/teacher roles, both teacher views, archived/transfer/secondary cases, 1,001 invoices, worker upgrade/account switch/offline, search/history races, close/manual-adjust/disable-next-period, and shift recovery. Use browser conditions/controlled responses rather than fixed sleeps; inspect real screenshots where visual claims are made; close temporary tabs/services afterward.
- [ ] No item may pass on a copied SQL script alone when its acceptance requires the DAL/UI; no cache pass without an active controller; no truncation pass using only 27 rows; no claim of production or physical-device verification from local Chromium.
- [ ] Run a fresh code review with exact baseline/head and this spec. Fix Critical/Important findings before merge; record remaining limits instead of silently shrinking scope. Do not merge/push/deploy without the applicable authorization and checks.
- [ ] Update `feature_list.json` (`feat-014` only completes when its entire acceptance matrix is proven), `progress.md`, and `session-handoff.md`. Keep prior completed features/history and deferred SEO scope intact.
- [ ] Before rollout, confirm migration inventory and deployment ordering from spec §9; never restore unsafe permissions or remove booked top-ups as a rollback. Production financial/backfill changes require separate approval.

## Plan self-review and handoff

All acceptance IDs map to the task numbers in spec §10. The five Review Focus conditions have explicit owning cases above. Public signatures and `kind` values are shared across Tasks 5/6; summary and minimal-roster return/key/pagination contracts are shared across Task 2 consumers. The owner confirmed that later manual deductions remain effective without recomputing the one-time top-up. Manual disabling via `0`, existing teacher-entry eligibility, and no historical backfill preserve the conservative existing lifecycle. Complete-document approval is still required; no runtime work is marked complete by saving this document.

Recommended execution: **Subagent-driven**, one vertical task and fresh review at a time, with a final whole-branch review. Financial actor boundaries, security-definer SQL, and snapshot money invariants warrant independent review. Native execution remains available if the owner prefers one implementer and a final review. Read this plan together with its spec before choosing execution; do not start implementation merely because this plan exists.
