# Demo Data Reset and Production Prune Design

**Date:** 2026-10-18  
**Status:** Draft for review  
**Scope:** Local demo fixture reset/reseed, explicit production operational-data prune, and development Supabase environment routing.

## Goal

Provide a repeatable, fail-closed workflow that:

1. Points the repository's development runtime to the local Supabase Docker stack.
2. Rebuilds a realistic local operational fixture for guru, murid, schedules, teaching logs, payroll, and SPP.
3. Covers multi-program students, nominal and percentage on-time SPP discounts, varied guru allowances, nullable minimum-income thresholds, inactive gurus, and payroll/SPP states.
4. Prunes remote operational data without inserting dummy data.
5. Preserves public landing data and administrator accounts in the remote project.
6. Leaves real-data Excel import as a separate future scope.

## Non-goals

- No remote insertion of dummy guru, murid, payroll, schedule, or SPP data.
- No Excel import implementation in this change.
- No change to the payroll minimum-income formula. `NULL` means no minimum-income rule; it is not converted into a payroll floor.
- No changes to landing content, program/business rules, or production application behavior.
- No edits to already-applied historical migrations.

## Confirmed decisions

- Local Supabase is the only default development target.
- `.env.local` points to local Supabase; `.env.production` remains remote.
- Remote execution is prune-only and opt-in.
- Remote pruning preserves landing data and administrator accounts.
- `branch_shifts` is operational data: it is rebuilt locally and pruned remotely.
- Local fixture contains seven dummy guru accounts, including one active guru with `minimum_income = NULL`.
- Credential output is local-only and ignored by Git.
- Existing admin accounts are preserved; the local seeder fails if no local admin exists rather than inventing or replacing one.

## Runtime topology

```text
npm run dev
  -> .env.local
  -> http://127.0.0.1:54321 (Supabase local API)
  -> PostgreSQL 127.0.0.1:54322

npm run seed:local
  -> .env.local + local PostgreSQL URL
  -> local Auth Admin API + local SQL transaction

npm run prune:remote
  -> explicit remote env file + direct remote PostgreSQL URL
  -> backup + remote SQL transaction
  -> no fixture insertion
```

The existing application clients already read `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. No application client abstraction changes are required.

## Environment contract

### `.env.local` (ignored, development default)

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

`SUPABASE_DB_URL` is consumed only by the seeder. The Next.js runtime uses the first three variables.

### `.env.local.example` (tracked documentation)

Document the local endpoints and placeholder values only. Never put a real key, password, or database URL in this file.

### `.env.production` (ignored, production configuration)

Remain remote. Do not replace it with local values.

### `.env.production.local` (ignored, optional)

May point a local `next start` smoke run at Supabase local. It is not required for `npm run dev`.

### `.env.remote.local` (ignored, prune-only)

```env
SEED_REMOTE_SUPABASE_URL=<approved-remote-url>
SEED_REMOTE_SERVICE_ROLE_KEY=<remote-service-role-key>
SEED_REMOTE_DB_URL=<approved-remote-postgres-url>
SEED_REMOTE_PROJECT_REF=<approved-project-ref>
```

This file is loaded only by `npm run prune:remote`. The remote command must reject `.env.local`, a local URL, a missing project reference, or a missing direct PostgreSQL URL.

### Generated local credential manifest

```text
supabase/seed-credentials.local.json
```

The manifest contains only local dummy-account credentials and fixture metadata. Add `seed-credentials*.local.json` to `supabase/.gitignore`. It must never be committed or copied into production configuration.

## Data retention boundaries

### Remote data preserved

- `public.landing_content`
- `public.programs`
- `public.program_variants`
- `public.branches`
- Storage bucket `program-logos` and its objects
- `auth.users` rows linked to administrator profiles
- `public.profiles` rows with `role = 'admin'`
- administrator rows in `public.profile_branches`
- administrator rows in `public.profile_programs`

The public landing page reads `landing_content` and active `programs` with `program_variants`. Program logos are public Storage assets. Static files under `public/images` are not database rows and are untouched.

### Local reset and remote prune targets

The explicit operational target set is:

- non-admin `auth.users` and their profile-dependent rows
- `profile_branches` and `profile_programs` for non-admin users
- `students`
- `student_programs`
- `branch_shifts`
- `schedule_placements`
- `schedule_classes`
- `schedule_drafts`
- `teacher_attendances`
- `teaching_session_students`
- `teaching_sessions`
- `payroll_adjustments`
- `payroll_entries`
- `payroll_session_lines`
- `payroll_periods`
- `student_payments`
- `student_invoices`

The implementation must use an explicit dependency-safe order. It must not run `TRUNCATE public.* CASCADE`, which could accidentally remove preserved landing/master data.

## Seeder architecture

### Local entrypoint

`npm run seed:local` invokes a Node orchestrator that uses:

- the existing `@supabase/supabase-js` dependency for Auth Admin API operations;
- a direct PostgreSQL client for transactional SQL;
- a PostgreSQL dump/client tool only where required for database verification or backup checks.

The orchestrator is responsible for target validation, auth lifecycle, SQL transaction execution, credential manifest output, and invariant checks. The SQL fixture is kept in a focused file under `scripts/sql/` and is not embedded in a historical migration.

### Remote entrypoint

`npm run prune:remote` performs backup and explicit operational deletion only. It does not create Auth users, profiles, or fixture rows. Remote auth deletion is part of the direct database transaction so the preserved-admin check and the operational delete are atomic.

The remote command requires a separate confirmation flag and a project-ref match. It aborts before any write if backup, target validation, or direct PostgreSQL connectivity fails.

## Local fixture matrix

### Guru accounts

Create seven local guru accounts through the Auth Admin API. The auth trigger creates the corresponding profiles; the SQL transaction then fills business fields.

| Guru | Status | Branch assignment | Allowances | Minimum income | Required case |
|---|---|---|---|---:|---|
| 01 | Active | One branch | Transport + presence | 1,500,000 | Present sessions |
| 02 | Active | One branch | None | 1,200,000 | Present, absent, excused |
| 03 | Active | Two branches | Education + transport | 2,000,000 | Sessions in both branches |
| 04 | Inactive | One branch | Presence | 1,000,000 | Present session; included in payroll because fee exists |
| 05 | Inactive | One branch | Transport | 1,300,000 | No session; excluded from generated payroll entry |
| 06 | Active | One branch | All four allowance categories | 2,500,000 | Positive and negative adjustments |
| 07 | Active | One branch | Optional transport | `NULL` | No minimum-income rule |

For Guru 07, `profiles.minimum_income` is `NULL`. The payroll snapshot becomes `0` through the existing `COALESCE` behavior, while the total remains fees plus allowances plus adjustments.

### Students and enrollments

Create 24 students across the two preserved branches:

 - 18 students with `students.is_active = TRUE` and at least one active enrollment;
 - 2 students with `students.is_active = TRUE` whose only enrollment status is `cuti`;
 - 2 students with `students.is_active = TRUE` whose only enrollment status is `lulus`;
 - 2 students with `students.is_active = FALSE` whose only enrollment status is `keluar`;
 - at least eight of the active students enrolled in two or more programs;
 - at least one active student enrolled in three programs.

Active enrollments cover AHE, ASE, BEE, and MAPEL variants. SPP amounts derive from explicit fixture values aligned with the preserved variants.

Discount distribution must include at least six enrollment records in each category:

 - `none` with value `0`;
 - `nominal` with values `50,000` and `75,000`;
 - `percentage` with values `10`, `15`, and `20`.

The invoice generator, not duplicated JavaScript arithmetic, determines `discount_amount` and `total_amount`.

### Schedule and teaching logs

Create local shifts, one active schedule draft per branch, classes connected to preserved variants, and placements within each variant's capacity. Create submitted sessions with present, absent, excused, and cancelled student attendance. Session dates remain within their payroll month and satisfy the schedule day-of-week rule.

### Payroll

Create three local periods:

- one historical `paid` period;
- one historical `closed` period with adjustment data;
- one current `open` period.

Use the existing payroll functions after the teaching sessions exist. Expected behavior:

- present attendance contributes the teacher fee;
- non-present attendance contributes zero payable amount;
- inactive Guru 04 appears because it has payable session data;
- inactive Guru 05 has no generated entry;
- Guru 07 has a zero minimum-income snapshot but remains payable from normal components;
- adjustments affect closed-period totals only.

### SPP

Use the existing invoice generator for active enrollments. Convert a subset of generated invoices through the existing payment function and leave other invoices unpaid. Keep at least one cancelled invoice. Paid invoices must have a payment and receipt; unpaid invoices must not have a payment.

## Transaction and failure behavior

### Local

1. Validate local URL and local database host.
2. Verify an administrator profile exists.
3. Run the operational cleanup transaction.
4. Create seven Auth users.
5. If Auth creation partially fails, delete only the users created by the current run and stop.
6. Run the fixture population transaction.
7. Configure the database session with the preserved admin subject when invoking admin-only functions.
8. Run invariants before committing the population transaction.
9. Write the credential manifest only after all checks pass.

A rerun is safe because the cleanup phase removes all non-admin operational data first.

### Remote

1. Validate remote project reference and reject local URLs.
2. Create a timestamped data backup outside the repository.
3. Snapshot preserved landing/master/admin counts and hashes.
4. Begin one explicit SQL transaction.
5. Remove only the remote operational target set.
6. Assert no non-admin profile/auth row remains.
7. Assert preserved landing/master/admin snapshots are unchanged.
8. Commit only after all assertions pass.
9. Re-query through service role after commit and record a prune report.

No remote dummy data or credential manifest is created. If preflight, backup, or in-transaction assertions fail, the transaction is rolled back and no remote write commits. A post-commit verification failure cannot roll back the database; it must fail the command, preserve the backup reference, and produce an operator-visible alert.

## Verification

### Local database invariants

- Seven guru profiles exist.
- At least one guru has `minimum_income IS NULL`.
- At least one multi-program student exists, including one three-program student.
- Nominal and percentage discounts both exist.
- Invoice totals equal the database discount calculation.
- Paid invoices have exactly one payment and receipt.
- Payroll has open, closed, and paid periods.
- Payroll lines reflect submitted sessions and attendance payable rules.
- Admin profile remains available.
- Credential manifest exists only after successful completion.

### Remote invariants

- `landing_content` snapshot is unchanged.
- `programs`, `program_variants`, and `branches` remain available.
- `program-logos` objects remain available.
- Administrator IDs and profiles remain unchanged.
- Operational target tables contain no residual data.
- No dummy fixture rows are inserted.

### Application checks

After implementation:

- run the focused seeder/pruner tests;
- run `./init.sh`;
- run local browser smoke at 360px, 375px, and 1280px;
- verify `/login`, `/guru`, `/admin/payroll`, and `/admin/spp` against local data;
- verify the public landing page still renders against preserved data;
- do not run remote prune as part of ordinary automated tests.

## Acceptance criteria

The change is complete only when:

1. Development Next.js uses Supabase local by default.
2. `npm run seed:local` creates the complete seven-guru/24-student fixture and passes all invariants.
3. Guru 07 has `minimum_income = NULL` and is visible in the expected payroll scenario.
4. Local payroll and SPP flows use existing database functions and display their generated results.
5. `npm run prune:remote` is fail-closed, backup-gated, prune-only, and preserves landing/admin data.
6. Remote fixture insertion is absent from the implementation.
7. Credential manifests are ignored and never committed.
8. Excel import remains explicitly outside this change.
9. Lint, tests, production build, and local browser smoke pass.
