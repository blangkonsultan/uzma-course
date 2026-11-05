# Financial Safety and Automatic Minimum-Income Top-up — Design Specification

- **Date:** 2026-11-04
- **Status:** Implemented and locally verified on 2026-11-05. Production migration/deployment and branch publication are separate, unperformed operations.
- **Tracker:** `feat-014` (completed local remediation of existing payroll, billing, PWA, search, and shift workflows).
- **Reviewed application revision:** `9a982cea2db0e618d67949a10e0d8b9836ec5d52`; review range `cede286..9a982ce`.
- **Plan:** [Implementation plan](../plans/2026-11-04-financial-safety-and-minimum-income.md).
- **Existing references:** [Payroll design](2026-10-16-payroll-guru-design.md), [business formula](../../rumus-gaji-guru.md), [teacher debt design](2026-10-30-teacher-overdue-spp-indicator-design.md), [UI contract](../../../DESIGN.md).

**Execution record:** The acceptance matrix and exercised limits are recorded in the current [progress log](../../../progress.md). The observation ledger below preserves the pre-implementation findings; its “remaining proof” column is historical, not the current completion state. Recorded migrations retain their creation bytes; corrections shipped forward in `20261104110000`, `20261104111000` and `20261105090000`, applied locally through Supabase CLI only.

## 1. Owner decisions, scope, and non-goals

The owner requires an automatic minimum-income subsidy for teachers, usually new teachers whose pupil load is still small. They chose **Approach 1: modify the PostgreSQL `close_payroll_period(uuid)` RPC through a new version-controlled migration**. The RPC must create a separately identifiable positive adjustment when the admin closes a period. Do not implement application-level calls that partially close/pay/top-up a period across multiple transactions.

The existing per-teacher `minimum_income` setting controls eligibility; setting it to `0` disables future top-ups. The owner described disabling the subsidy after several periods, but did not specify an automatic expiry date or number of periods. **Do not invent a scheduler, tenure rule, expiry counter, or new enable switch.** Admin deactivation is the selected interpretation.

This specification also covers every distinct review finding: anonymous billing RPCs, excessive teacher financial reads, protected response caches, archived-class enrichment, inconsistent branch authorization, incomplete overdue totals, both search races, and the reported shift-edit failure. The former minimum-income copy finding is resolved by implementing the required business behavior plus truthful estimate/statement wording, not by reverting the label alone.

Non-goals: automatic bank transfers, retroactive recalculation of closed/paid history, morning-specific allowance allocation, attendance proration, new teacher payment/WhatsApp controls, redesign of accounting or scheduling, SEO work, production data resets, and manual schema edits. Work in independently reviewable vertical slices under one coordinated plan; do not claim unrelated slices fixed by one passing suite.

## 2. Evidence ledger: observation is not completion

| ID | Finding / origin | Evidence already observed | Remaining proof required |
| --- | --- | --- | --- |
| SEC-01 | Anonymous billing mutation; pre-existing, P1 | A local anonymous `record_student_payment` request returned HTTP 200, created a receipt, and changed an owned temporary invoice to `paid`. Effective grants and null-UID guards were inspected. | Demonstrate denied generation and payment through the real Data API after migration; authenticated admin still succeeds; no unauthorized rows or attribution. |
| SEC-02 | Teacher raw invoice/payment scope; pre-existing, P1 | An authenticated local teacher read 14 invoice rows, 11 outside current student/program pairs. Invoice/payment SELECT policies are branch-wide. | Verify raw invoice/payment denial, own-class summary access, cross-teacher/program denial, primary/secondary branch consistency, and unchanged admin access. |
| CACHE-01 | Shared protected HTML/RSC caches; pre-existing policy, new debt payload, P1 risk | Source-backed exposure. The local worker remained installing with no active controller. | **Not reproduced end-to-end.** Use a matching production build, active worker, two accounts, cache upgrade, offline and delayed-network checks. |
| DEBT-01 | Current debt via archived teaching cards; introduced, P1 | An authenticated same-branch query against an owned archived class returned a current overdue amount of Rp175,000. | This was copied database-query logic, not an invocation of the actual DAL or browser route. Prove historical card remains readable but contains no live debt. |
| SEARCH-01 | Earlier navigation overwrites newer draft; introduced, P2 | Real production-mode browser: draft `XY` reverted to `X` after the earlier RSC request completed. | Deterministic browser/component regressions including Enter and dropdown application of the newer draft. |
| SEARCH-02 | Pending search overrides Back/Forward; introduced, P2 | Browser observation showed an abandoned timer changing the restored URL. The setup used fixed waits and did not establish every intermediate committed history entry. | Repeat with condition-controlled committed history and delayed responses; verify both Back and Forward. |
| DEBT-02 | Branch-transfer schedule/card mismatch; introduced, P2 | Separate service-role and authenticated invoice queries returned Rp200,000 and no invoice for a transferred dummy pupil. | These were not both actual application screens. Prove equal summaries on schedule and teaching card using the same authorized RPC. |
| DEBT-03 | Overdue truncation at API cap; introduced, P2 | One unpaginated query; `supabase/config.toml` has `max_rows = 1000`. The attempted probe only had 27 invoices. | **Not reproduced with a qualifying large dataset.** Test 1,001 overdue invoices and summary pagination boundaries against the actual DAL/browser. |
| PAY-01 | Missing automatic guarantee / misleading minimum wording | Browser displayed a current estimate of Rp403,000 beside configured minimum Rp450,000. This was not evidence of a bank transfer or a paid statement. Owner subsequently required the top-up. | Close a dummy period through admin UI; read an automatic Rp47,000 adjustment, total Rp450,000, and unchanged historical snapshots. |
| SHIFT-01 | Reported edit failure | Browser narrowing 08:00–08:30 to 08:05–08:30 was correctly rejected because existing classes began at 08:00. Submitted values reset after the rejected form action. | Do not conclude all editing works. Prove ordinary rename, unchanged bounds, widening, legitimate rejection, retained edits/retry, and database-error handling. |

Earlier blanket claims that all cases were fully reproduced are superseded by this evidence ledger. A clean Git tree is not proof that database fixtures were removed: earlier failed setup attempts may have left owned dummy records. Inventory those without broad deletion; every new smoke must track its own record IDs, inspect every error, clean up in `finally`, and verify cleanup.

## 3. Global invariants

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

## 4. Billing authorization and one summary boundary

### 4.1 Admin-only mutation RPCs

Replace both billing function definitions in a new migration without changing their public arguments or successful return shapes:

- `public.generate_due_student_invoices(p_branch_id text DEFAULT NULL) RETURNS SETOF public.student_invoices`.
- `public.record_student_payment(p_invoice_id uuid, p_payment_method text, p_payment_date date DEFAULT CURRENT_DATE, p_payment_reference text DEFAULT NULL, p_notes text DEFAULT NULL) RETURNS public.student_payments`.

Before reads, locks, numbering, or writes: reject `auth.uid() IS NULL OR NOT public.is_admin()` with SQLSTATE `42501`. Revoke EXECUTE from PUBLIC and `anon`, grant only intended roles, and test effective privileges rather than migration text. Do not regard a null UID as trusted automation, including a service-role request without an authenticated admin actor. Existing local fixture SQL already establishes an admin claim; preserve that authorized use. Payment attribution is the verified admin UID, never the first available admin. Preserve successful numbering, idempotent generation, full-payment semantics, and row locking; receipt sequencing redesign is not part of this change.

### 4.2 Teacher raw reads and authorized summaries

Remove the broad teacher SELECT policies on `student_invoices` and `student_payments`; retain admin policies, legitimate admin/service DAL access, and teacher write denial. The financial-summary payload contains only current authorized **aggregates**, not raw invoice rows, notes, receipt details, or guardian contacts. This is not a new API-wide restriction on existing non-financial student/guardian permissions; those permissions are outside this remediation. Do not add a broader student-row policy to make a summary or roster render.

Create `public.get_teacher_overdue_spp(p_class_ids uuid[]) RETURNS TABLE(class_id uuid, student_id uuid, program_id uuid, due_date date, total_amount bigint, invoice_count bigint)`:

1. Require a non-null authenticated UID whose profile role is `guru`; anonymous, admin, and UID-less service calls to this teacher-specific RPC are denied with `42501`.
2. Use `SECURITY DEFINER` with a fixed empty search path and fully qualified objects, since raw financial RLS deliberately denies teacher reads. Revoke PUBLIC/anon EXECUTE; grant authenticated execution. Never accept a caller-supplied teacher ID.
3. Derive eligible pairs from the intersection of requested classes, `schedule_classes.teacher_id = auth.uid()`, `schedule_drafts.status = 'active'`, placements, and the class variant's program. Deduplicate requested classes/placements before joining invoices so repeated IDs or placements cannot multiply money.
4. Return no rows for unowned/non-active classes or unmatched programs. An archived requested class returns no live balances even when that pupil is taught in another current class.
5. Match unpaid invoices with `due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date`. Sum all matching invoice amounts, count all invoices, and take the earliest due date **inside PostgreSQL before response limiting**.
6. Invoice branch snapshots do not override verified current class/student/program authorization. The same rule applies to transferred pupils and primary/secondary assigned classes. Do not grant whole-branch access to solve the mismatch.
7. Return one row per class/student/program. An authorized pupil with no overdue invoice has no result row; DAL/UI continue to map this to `overdue_spp: null` without falsely claiming payment confirmation.

Create a separate minimal historical/current roster RPC, `public.get_teacher_class_students(p_class_ids uuid[]) RETURNS TABLE(class_id uuid, student_id uuid, full_name text, student_number text)`. Require the same authenticated-guru actor boundary and hardened security-definer execution as the financial RPC, but authorize the requested class by ownership **regardless of draft status**, preserving historical cards at primary and secondary branches. Return only distinct placed student IDs, names, and student numbers; no financial data or guardian fields. Financial authorization remains active-class-only in `get_teacher_overdue_spp`. This avoids expanding direct `students` table access merely to read an archived secondary-branch card.

### 4.3 DAL cutover and row-cap completeness

Create `src/lib/teacher-billing.ts` as the single summary adapter. It owns `StudentOverdueSppInfo` and:

`getTeacherOverdueSppByClass(supabase: SupabaseClient<Database>, classIds: readonly string[]): Promise<Map<string, StudentOverdueSppInfo>>`.

Map keys are exactly `${class_id}:${student_id}:${program_id}`. Consume the generated RPC return type; represent amounts/counts as exact safe integers supported by the application's existing number-based rupiah UI, and fail the enrichment rather than silently round an unsafe value.

Fetch summary pages with deterministic `class_id`, `student_id`, `program_id` ordering and `.range(start, start + 999)` until a page contains fewer than 1,000 rows. This also covers more than 1,000 **summary groups**, not just more than 1,000 source invoices. Empty class arrays skip the request. A failed page must not produce a partial aggregate; use the existing logged, non-blocking enrichment failure behavior for the entire result.

Create `src/lib/teacher-roster.ts`, exporting `TeacherRosterStudent` with `{ id: string; full_name: string; student_number: string | null }` and `getTeacherClassStudents(supabase: SupabaseClient<Database>, classIds: readonly string[]): Promise<Map<string, TeacherRosterStudent[]>>`. Map keys are class IDs. Read the roster RPC using generated types, deterministic `class_id` / `student_id` ordering, and the same 1,000-row page boundary; do not silently truncate a roster. Empty input returns an empty map; a roster-read error remains an explicit data-read failure, not a successful empty class.

Both `getTeacherActiveSchedule(teacherId)` and `getTeacherScheduleClassForLog(teacherId, scheduleClassId)` use the cookie-authenticated roster and financial adapters. Replace their nested `students` roster dependencies with the minimal roster RPC so assigned secondary-branch and archived cards are not emptied by primary-branch RLS. Select/type the draft status in teaching-log DAL and skip the financial RPC for non-active cards while retaining their roster/session readback. Move every type/import/caller and remove `getOverdueSppByStudentAndProgram` plus `getOverdueSppByStudentIds`; no compatibility alias. Keep existing UI `overdue_spp` / class-count shapes.

## 5. Protected PWA responses and upgrade safety

Choose **NetworkOnly protected responses**, not account-partitioned caching. Protected `/guru`, `/admin`, `/api`, `/login`, and `/logout` paths must match before HTML, RSC/prefetch, and `defaultCache` rules, independent of headers, query string, account, or navigation mode. Public pages/static assets and the generic offline fallback remain available. A protected offline navigation must never replay cached personal content.

Use new public-only runtime cache names `uzma-public-pages-v3` and `uzma-public-rsc-v3`. On activation, delete old mixed-response `uzma-pages-v2` and `uzma-rsc-v2`, together with already-recognized unsafe legacy response caches (`others`, names containing `rsc-prefetch`, `uzma-pages-cache`, or `uzma-rsc-cache`). Preserve safe static precaches and **all IndexedDB databases/attendance records**. Never use `indexedDB.deleteDatabase`, broad storage clearing, or logout-time queue deletion as a cache fix.

Build matching assets and generated `public/sw.js` together. If the worker cannot activate, inspect install/asset/network errors and correct the local build artifact mismatch before testing. Do not edit out precaching or mock a controller and call that production-worker proof. The two-account test must verify a real controller, real CacheStorage contents, logout/login, offline navigation, delayed-network fallback, and same-path RSC/prefetch. Record before/after account-specific content and queue preservation, not only strategy names.

## 6. Search draft and navigation lifecycle

Keep URL generation restricted to `/admin/spp` plus `URLSearchParams`. The component owns independent editable filters, last acknowledged URL filters, a monotonically increasing edit version, pending debounce metadata, and component-originated navigation snapshots. Do not infer freshness from text equality alone: returning from `AB` to `A` is a newer edit even if it equals an earlier committed value.

- Each local edit increments the version and updates the visible draft synchronously. A timer captures its version and current combined filters; it can navigate only if still valid.
- Acknowledging an earlier component-originated navigation updates committed state but cannot overwrite newer drafts or cancel their valid timer.
- Enter/dropdowns invalidate the pending timer and apply the latest combined draft exactly once, including edits made while an earlier response was in flight.
- Back/Forward (`popstate`) immediately invalidates queued work and adopts the restored URL/filter state before 300 ms can elapse. Other external URL/filter changes also invalidate abandoned work; subsequent stale acknowledgments cannot resurrect it.
- Unmount invalidates queued work and removes listeners. Preserve input identity/focus; do not remount the billing page by query key, switch to deferred input alone, or rely on `router.push()` returning a promise.

Use the installed Next 16 App Router APIs documented in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`; no `next/router` event API. UI controls and summary rendering otherwise remain unchanged.

## 7. Automatic minimum-income adjustment at closing

### 7.1 Contract and arithmetic

The owner-approved implementation is an in-transaction change to `close_payroll_period(uuid)`. A database RPC is not a PostgreSQL trigger; do not add unrelated trigger-based payroll generation.

For each teacher already eligible for a payroll entry under the existing close rule (`role = guru` and active profile OR positive earned session fees), capture current allowances and minimum once. Preserve this roster rule; an inactive teacher with no earned fees must not acquire an entry solely because a minimum remains configured. An active teacher with zero earnings remains eligible, as in the current closing roster. No new attendance or minimum-service condition is invented.

```text
base_at_close       = fee_sessions_total + fixed_allowances_total
minimum_at_close    = minimum_income_snapshot
automatic_topup     = minimum_at_close > 0 ? max(0, minimum_at_close - base_at_close) : 0
adjustments_total   = SUM(all stored manual + automatic adjustment amounts for this teacher/period)
total_amount        = base_at_close + adjustments_total
```

Manual adjustment creation remains a closed-before-paid operation, so normal close has no manual adjustments to net against the initial subsidy. **Owner-confirmed policy: “Potongan tetap berlaku.”** Existing supported manual adjustments after closing remain additive/subtractive: a later negative manual adjustment may reduce final pay below the original minimum; do not silently cancel that deduction by creating/recomputing another top-up. A later bonus does not reduce the already-booked subsidy. This is a one-time closing guarantee, not a continuously rebalanced floor.

| Base at close | Configured minimum | Automatic row | Total immediately after close |
| ---: | ---: | ---: | ---: |
| Rp403,000 | Rp450,000 | Rp47,000 | Rp450,000 |
| Rp450,000 | Rp450,000 | None | Rp450,000 |
| Rp500,000 | Rp450,000 | None | Rp500,000 |
| Rp403,000 | Rp0 / unset | None | Rp403,000 |
| Rp0, active eligible teacher | Rp450,000 | Rp450,000 | Rp450,000 |

### 7.2 Ledger identity, transaction, and snapshots

Add `payroll_adjustments.kind text NOT NULL DEFAULT 'manual'`, restricted to `manual` and `minimum_income_topup`. Existing rows become `manual`; never infer kind from reason text. Add a partial unique index on `(period_id, teacher_id) WHERE kind = 'minimum_income_topup'`, and require a positive amount for that kind. No zero top-up row. The reason is exactly **`Top-up Garansi Gaji Minimum`**; `created_by` is the authenticated closing admin. Preserve the existing manual RPC's parameters and signed amounts; it explicitly creates `kind = 'manual'`.

Inside the existing period row lock / admin guard / open-only transaction: capture fee and profile snapshots, insert each required automatic row using those captured values (not a fresh profile read), calculate totals including that row exactly once, and finally transition the period to `closed`. Any failure rolls back session lines, entries, adjustments, and close status together. A repeated/concurrent close must produce one successful close and one explicit domain rejection, never duplicate money. Do not suppress an unexpected duplicate with an unexamined `ON CONFLICT DO NOTHING`.

The normal application exposes no edit/delete/reclassify operation for automatic rows. Revoke direct `INSERT`, `UPDATE`, and `DELETE` on `payroll_adjustments` from PUBLIC, `anon`, and `authenticated`; teacher/admin SELECT remains policy-scoped. Make only the two adjustment-writing RPCs, `close_payroll_period` and `add_payroll_adjustment`, explicitly `SECURITY DEFINER` with a fixed empty search path, fully qualified objects, non-null authenticated admin guards, and no PUBLIC/anon EXECUTE. Preserve their signatures and period locks; the manual RPC always inserts `kind = 'manual'` into an existing closed-before-paid entry. This makes automatic-row creation exclusive to closing rather than relying on caller-controlled reason text or a forgeable table insert. `mark_payroll_period_paid` need not change security mode. Trusted owner/service maintenance is distinct from the ordinary authenticated API and must not be exposed as a bypass.

Profile changes after close never alter that period's minimum, allowances, top-up, or totals. Setting minimum to `0` affects only subsequent closings. No automatic backfill/reclose of existing closed/paid periods; pre-rollout statements retain their original amounts and old rows remain manual. `paid` behavior and manual bank confirmation are unchanged.

### 7.3 UI and documentation truthfulness

Open `/guru/honor` stays an earned-fee/allowance estimate without a booked adjustment. Show **`Gaji minimum terkonfigurasi`** and explain **`Top-up dihitung otomatis saat admin menutup periode.`** Do not imply an open estimate was already paid or topped up.

For newly closed/paid entries, expose the actual typed automatic adjustment in existing admin and teacher adjustment lists, with its exact reason and an **`Otomatis`** indicator. Display the snapshotted minimum as **`Gaji minimum periode ini`**. Do not force historic totals up to that label or fabricate a missing historic automatic row. Existing manual addition controls cannot select `kind`. Admin profile help explains **`Isi 0 untuk menonaktifkan top-up pada penutupan periode berikutnya.`**

Update both guides, manual QA, the payroll design, and the relevant harness domain note when implementation actually changes the runtime contract. The old metadata-only non-goal is superseded by this owner decision, but remains an accurate description of unmodified application code until this work ships. The old morning-only business example does not authorize a new morning/allowance allocation engine; this guarantee uses the configured teacher-wide monthly minimum and current fixed-allowance sum.

## 8. Shift edit investigation and safe recovery

Do not remove the existing class-containment guard or silently move class times. Correctly rejecting 08:05–08:30 when a class starts at 08:00 is an expected outcome, not proof of a generic edit bug or proof that every edit works.

Reproduce rename-only, unchanged bounds, widening, and blocked narrowing through the real admin form, action, DAL, and persisted readback using an owned dummy shift/class. Compare `HH:mm` / `HH:mm:ss` semantically. For partial DAL updates, read the stored opposite boundary before validating; never interpolate `undefined` into a filter. A failed class-bound lookup must abort, not proceed with the update. Preserve existing referenced-class scope; do not silently exempt archived rows without an agreed scheduling policy.

On a returned validation/database error, retain the entered name/times and show a recoverable error linked to relevant fields; the observed uncontrolled-form reset must not discard the attempted edit. Explain blocked narrowing: **`Ada kelas di luar rentang jam baru. Sesuaikan jadwal kelas terlebih dahulu, lalu simpan ulang.`** Release the submission guard in `finally`; preserve Next redirect semantics and the existing centralized admin boundary. Successful valid edits must persist and return normal success feedback. Document the original user's precise failure as unresolved until the ordinary-edit controls and actual error path have been exercised; do not attribute their attempt to narrowing without their exact inputs.

## 9. Verification, rollout, and completion

1. Add a local-only behavioral database contract runner using installed `pg`/`dotenv`; transactions roll back by default. Commit owned fixtures only when real HTTP/browser/concurrency proof requires it, with ID manifests, checked errors, `finally` cleanup, and zero-leftovers assertions. No hard-coded keys, arbitrary production URLs, broad fixture deletion, or automatic migrations/resets by the runner.
2. Existing source-string migration tests and copied cache-predicate tests do not establish security. Retire them when replacing their coverage; do not re-pin source text. Preserve meaningful existing tests and add deterministic regressions only for the consumer-visible boundaries in this spec.
3. Before exported-symbol cutovers, inspect LSP references and migrate all callers/types/fixtures together. Generate database types after local migrations; no hand-written parallel RPC types or compatibility shims.
4. Required pre/post smoke evidence: anon/guru/admin financial API calls; archived/transfer primary-and-secondary teacher UI; 1,001-invoice and paginated-group totals; stale RSC/search history; actual worker upgrade and two-account privacy with IndexedDB preservation; close/read/manual-adjust/disable-next-period payroll; shift persisted readback and rejected-edit recovery.
5. Apply the billing guard migration first. Ship the teacher-summary migration and DAL cutover as one compatible slice; revoke raw financial reads only with the new reader ready. Deploy matching worker build/assets. Apply payroll ledger migration and typed UI as a compatible release. No migration creates top-ups for already closed/paid periods.
6. A schema-only rollback must not delete booked automatic adjustments or restore insecure grants/caches. Prefer a reviewed forward correction; once real close transactions use `kind`, preserve their amounts and history. Record rollout ordering and ownership before production deployment.
7. Run the full `./init.sh` gate after integration, plus the actual local database/browser smokes. Record viewport evidence and verification limits. A passing mock suite, inactive worker, small invoice dataset, or source-only review cannot close the corresponding acceptance item.
8. Obtain a fresh implementation review over the actual base/head and fix substantive findings before merge. Update `feature_list.json`, `progress.md`, and `session-handoff.md` with executed evidence, not planned checks.

## 10. Acceptance / plan traceability

| Acceptance ID | Required observable result | Owning plan task |
| --- | --- | --- |
| SEC-01 | Anonymous/guru mutation denied without writes; verified admin generates/pays with correct attribution. | Task 1 |
| SEC-02 | Teacher raw invoice/payment API cannot expose rows; only authorized class/program summaries are readable; admin remains functional. | Task 2 |
| DEBT-01 | Archived card stays readable; no live financial enrichment in RPC, DAL, HTML, or RSC. | Task 2 |
| DEBT-02 | Actual schedule/card agree for transferred and secondary-branch pupils without unrestricted service-role debt reads. | Task 2 |
| DEBT-03 | Complete totals/earliest date/count at 1,001 source invoices and across summary page boundaries. | Task 2 |
| CACHE-01 | Active upgraded worker never replays another account's protected HTML/RSC; old unsafe caches gone; queued attendance unchanged. | Task 3 |
| SEARCH-01 | Later draft, focus, and latest Enter/dropdown filters survive earlier navigation settlement. | Task 4 |
| SEARCH-02 | Back/Forward restores committed filters and no abandoned timer or later stale acknowledgment overwrites them. | Task 4 |
| PAY-01 | Atomic one-time typed top-up, boundary/no-minimum cases, admin attribution, concurrent/retry safety, rollback, and future disabling. | Task 5 |
| PAY-02 | Admin/teacher statements show the persisted automatic line and honest open/history labels; manual adjustments are not double-counted. | Task 6 |
| SHIFT-01 | Ordinary valid edits persist; blocked narrowing preserves stored data and entered values; lookup errors fail closed and retry works. | Task 7 |
| GATE-01 | Real local database/browser evidence, full project gate, review, documentation, and restartable state. | Release gate |
