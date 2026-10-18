# Demo Data Reset and Remote Prune Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route development to the local Supabase stack, create a deterministic local demo fixture for guru/murid/payroll/SPP, and add a separately guarded remote operational-data prune with no remote fixture insertion.

**Architecture:** A local Node orchestrator uses Supabase Auth Admin API for seven dummy guru accounts and a direct PostgreSQL transaction for cleanup, fixture insertion, payroll/SPP function calls, and invariant checks. A separate remote prune command loads an ignored remote environment file, creates a timestamped backup, validates the approved project reference, and executes only an explicit operational delete transaction. Landing data, master landing dependencies, and administrator accounts are never in the delete set.

**Tech Stack:** Next.js 16, Node.js `.mjs` scripts, React 19 application runtime, `@supabase/supabase-js`, `dotenv`, direct PostgreSQL client (`pg`), PostgreSQL dump tooling through the local Docker toolchain, Vitest, Docker Supabase local stack.

**Spec:** `docs/superpowers/specs/2026-10-18-demo-data-reset-and-prune-design.md`

## Global Constraints

- `.env.local` must point to Supabase local by default; `.env.production` remains remote.
- Remote execution is prune-only and opt-in; it must never insert dummy fixture data.
- The remote prune must preserve `landing_content`, `programs`, `program_variants`, `branches`, `program-logos`, and administrator accounts.
- The local fixture contains seven dummy gurus, including one active guru with `minimum_income = NULL`.
- The local fixture contains 24 students, multi-program enrollments, nominal and percentage discounts, and open/closed/paid payroll states.
- The payroll minimum-income formula is unchanged; `NULL` means no minimum-income rule and is not a payroll floor.
- Historical migrations must not be edited.
- Credential manifests are local-only, ignored, and never committed.
- Remote pruning requires a direct PostgreSQL URL and a successful backup before any write.
- Do not run `TRUNCATE public.* CASCADE`.
- Excel import is outside this change.

## Review Focus

- A local-looking command must reject every remote URL before opening a write connection; test the local guard with a production URL and a malformed URL.
- A remote-looking command must reject missing project reference, missing confirmation, and missing direct PostgreSQL URL; test each failure before any database call.
- Auth creation can partially succeed; test cleanup of only users created by the current run and ensure the credential manifest is not written on failure.
- Payroll/SPP snapshots depend on database auth context; test the admin-subject session setup and verify `NULL` minimum income becomes a zero snapshot without changing totals.
- Remote post-commit verification cannot roll back a committed transaction; test that a verification failure preserves the backup reference and emits a non-zero failure result rather than claiming success.

---

### Task 1: Local Environment and Target Safety

**Files:**
- Modify: `.env.local.example`
- Modify: `supabase/.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/lib/seed-target.mjs`
- Test: `tests/crud/demo-seeder-safety.test.ts`

**Interfaces:**
- `assertLocalSeedTarget(url: string): void` throws for non-local or malformed URLs.
- `assertRemotePruneTarget(input: { url: string; projectRef: string; expectedProjectRef: string; confirmation: string }): void` throws unless the URL is remote, the project reference matches, and the exact confirmation is supplied.
- `getLocalDatabaseUrl(env: NodeJS.ProcessEnv): string` returns `SUPABASE_DB_URL` or throws with an actionable missing-variable error.
- `validateRemotePruneEnvironment(env: NodeJS.ProcessEnv): { url: string; projectRef: string; serviceRoleKey: string; databaseUrl: string }` validates all required remote variables without logging their values.
- `REMOTE_PRUNE_CONFIRMATION` is a fixed non-secret confirmation phrase exported by the target module and used by the CLI/tests.

- [ ] **Step 1: Write failing target-guard tests**

Add tests named:

- `rejects a remote URL for local seeding`;
- `accepts the local API URL and local aliases`;
- `rejects remote prune without the expected project reference`;
- `rejects remote prune without exact confirmation`;
- `rejects a remote prune environment without a direct database URL`.

Assert thrown error classes/messages identify the unsafe condition and never expose key values.

- [ ] **Step 2: Run the safety tests and verify they fail**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-seeder-safety.test.ts
```

Expected: FAIL because the target guard module and exported contracts do not exist.

- [ ] **Step 3: Implement target guards**

Create `scripts/lib/seed-target.mjs` with URL parsing that accepts `http://127.0.0.1:54321` and `http://localhost:54321` for local mode, rejects non-HTTP or remote hosts, and compares the remote project reference exactly. Keep the confirmation phrase in code as a non-secret safety token; never log environment values.

Add `pg@8.23.1` as a pinned runtime dependency because both local fixture and remote prune need one transactional PostgreSQL client. Add `seed:local` and `prune:remote` script entries that point to the future orchestrators but do not make remote the default command.

- [ ] **Step 4: Document local environment variables**

Update `.env.local.example` with local endpoint placeholders and `SUPABASE_DB_URL`. Add `seed-credentials*.local.json` to `supabase/.gitignore`.

Update the ignored workstation `.env.local` without printing secrets:

- preserve the current remote file outside the default dev environment;
- set `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`;
- copy the local `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from `supabase/.temp/start-secrets/supabase_edge_runtime_uzma-course/env/docker.env` into the corresponding variables;
- set `SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

Do not modify `.env.production`. Verify only the configured host and variable presence; never print key values.

- [ ] **Step 5: Run safety tests**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-seeder-safety.test.ts
```

Expected: PASS with all target and environment safety assertions.

- [ ] **Step 6: Commit the environment contract**

```bash
git add .env.local.example supabase/.gitignore package.json package-lock.json scripts/lib/seed-target.mjs tests/crud/demo-seeder-safety.test.ts
git commit -m "build(seed): add local environment safety contract"
```

Do not stage `.env.local`, `.env.remote.local`, or any credential manifest.

### Task 2: Deterministic Fixture Definitions and SQL Helpers

**Files:**
- Create: `scripts/lib/demo-fixture.mjs`
- Create: `scripts/sql/local-demo-fixture.sql`
- Create: `scripts/sql/local-demo-invariants.sql`
- Create: `scripts/sql/operational-cleanup.sql`
- Test: `tests/crud/demo-fixture.test.ts`

**Interfaces:**
- `GURU_FIXTURES`: seven guru definitions with stable email keys, active flags, branch assignments, JSON allowance items, and nullable `minimum_income`.
- `STUDENT_FIXTURES`: 24 student definitions with branch, active state, and lifecycle status.
- `FIXTURE_EXPECTATIONS`: numeric expectations for guru count, student count, multi-program minimums, discount categories, and payroll periods.
- `validateFixtureDefinition(): void` throws when fixture invariants are violated before any database connection is opened.
- `renderFixtureSql(): string` returns the parameterized SQL payload used by the local orchestrator.

- [ ] **Step 1: Write failing fixture contract tests**

Add tests named:

- `defines exactly seven gurus including one nullable minimum income`;
- `defines 24 students across both branches`;
- `defines multi-program and three-program enrollment cases`;
- `defines none, nominal, and percentage discount enrollment cases`;
- `defines active/inactive payroll inclusion cases`.

Assert the exact seven-guru/24-student counts and the agreed values (`NULL`, 50,000, 75,000, 10, 15, 20).

- [ ] **Step 2: Run fixture tests and verify failure**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-fixture.test.ts
```

Expected: FAIL because fixture definitions do not exist.

- [ ] **Step 3: Implement fixture definitions**

Create stable demo keys for guru emails and student numbers. Define:

- Guru 01–07 exactly as the spec describes;
- 24 students with 18 active students, two `cuti`, two `lulus`, and two inactive `keluar` cases;
- at least eight active students with two or more programs and one with three;
- at least six enrollment records in each discount category;
- exact allowance arrays and nullable minimum-income semantics.

Keep the definitions pure and independent of Supabase clients so the contract tests cannot pass through mocks alone.

- [ ] **Step 4: Implement cleanup and fixture SQL**

`operational-cleanup.sql` must delete in foreign-key-safe order and preserve the landing/master/admin allowlist. It must remove non-admin `auth.users` only after dependent payroll, scheduling, teaching-log, billing, student, and profile-junction rows are cleared.

`local-demo-fixture.sql` must:

- use preserved `branches`, `programs`, and `program_variants`;
- insert local shifts, drafts, classes, placements, students, enrollments, and teaching sessions;
- resolve guru IDs by stable demo email rather than hardcoded generated UUIDs;
- set `request.jwt.claim.sub` to the preserved local admin ID before invoking admin-only payroll/SPP functions;
- create paid, closed, and open payroll periods;
- generate invoices through `generate_due_student_invoices`;
- record selected payments through `record_student_payment`;
- retain at least one cancelled invoice.

`local-demo-invariants.sql` must return explicit boolean/count results for every acceptance invariant, including Guru 07 `minimum_income IS NULL`, payable attendance behavior, and payment/receipt consistency.

- [ ] **Step 5: Run fixture definition tests**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-fixture.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit fixture definitions**

```bash
git add scripts/lib/demo-fixture.mjs scripts/sql/local-demo-fixture.sql scripts/sql/local-demo-invariants.sql scripts/sql/operational-cleanup.sql tests/crud/demo-fixture.test.ts
git commit -m "feat(seed): define local demo fixture invariants"
```

### Task 3: Local Auth Lifecycle and Seed Orchestrator

**Files:**
- Create: `scripts/lib/local-auth.mjs`
- Create: `scripts/lib/postgres.mjs`
- Create: `scripts/seed-local-demo.mjs`
- Test: `tests/crud/local-demo-seeder.test.ts`

**Interfaces:**
- `createGuruUsers(adminClient, guruFixtures, passwordSource): Promise<CreatedGuruUser[]>` creates confirmed local users with guru metadata and returns IDs plus manifest-safe metadata.
- `deleteCreatedUsers(adminClient, userIds: string[]): Promise<void>` deletes only IDs created by the current run.
- `withPostgresTransaction(databaseUrl, callback): Promise<T>` opens a `pg` client, starts `BEGIN`, commits on success, and rolls back on failure.
- `seedLocalDemo(env: NodeJS.ProcessEnv): Promise<SeedReport>` performs target validation, cleanup, auth creation, fixture population, invariant checks, and manifest output.
- `SeedReport` contains counts and a credential-manifest path but never contains secret values in console output.

- [ ] **Step 1: Write failing auth/orchestrator tests**

Add tests named:

- `creates confirmed guru users from fixture definitions`;
- `deletes only users created by the current run after partial failure`;
- `does not write credential manifest when fixture SQL fails`;
- `rejects local seeding when the target guard fails`;
- `does not log passwords or service-role keys`.

Mock only the Auth Admin API and PostgreSQL transaction boundary. Assert public behavior, not internal call copies.

- [ ] **Step 2: Run local seeder tests and verify failure**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/local-demo-seeder.test.ts
```

Expected: FAIL because the lifecycle/orchestrator modules do not exist.

- [ ] **Step 3: Implement PostgreSQL transaction helper**

Create `scripts/lib/postgres.mjs` using the pinned `pg` dependency. Ensure every transaction uses `BEGIN`, `COMMIT`, and `ROLLBACK`, closes the client in `finally`, and converts database errors into messages without connection strings or secrets.

- [ ] **Step 4: Implement local Auth lifecycle**

Use the existing Supabase JS Admin API against the local URL. Create users with confirmed email and guru metadata. Generate a password from `SEED_GURU_PASSWORD` when explicitly supplied; otherwise generate a random local password and store it only in the ignored manifest. On partial failure, delete only IDs created in that invocation.

- [ ] **Step 5: Implement `seedLocalDemo()`**

The orchestrator must:

1. load `.env.local`;
2. call `validateFixtureDefinition()`;
3. call `assertLocalSeedTarget()`;
4. verify a local admin exists;
5. run cleanup SQL in a transaction;
6. create seven guru users;
7. run fixture SQL and invariant SQL in a second transaction;
8. write `supabase/seed-credentials.local.json` only after all invariants pass;
9. return a sanitized `SeedReport`.

The command must fail closed if the local URL, DB URL, or admin profile is missing.

- [ ] **Step 6: Run focused tests**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-seeder-safety.test.ts tests/crud/demo-fixture.test.ts tests/crud/local-demo-seeder.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run the real local seed**

With Docker Supabase running, execute:

```bash
npm run seed:local
```

Expected: sanitized report showing seven guru users, 24 students, multi-program enrollments, discount categories, three payroll periods, and paid/unpaid/cancelled SPP states. The command must not print any key or password.

- [ ] **Step 8: Query local invariants**

Run the orchestrator's verification mode or the equivalent SQL report and confirm every result in `local-demo-invariants.sql` passes. Inspect the ignored credential manifest locally without copying its values into chat or tracked files.

- [ ] **Step 9: Commit local seeder**

```bash
git add scripts/lib/local-auth.mjs scripts/lib/postgres.mjs scripts/seed-local-demo.mjs tests/crud/local-demo-seeder.test.ts
git commit -m "feat(seed): add local demo data seeder"
```

### Task 4: Remote Backup-Gated Operational Prune

**Files:**
- Create: `scripts/lib/remote-backup.mjs`
- Create: `scripts/prune-remote-operational.mjs`
- Create: `scripts/sql/remote-operational-prune.sql`
- Create: `scripts/sql/remote-prune-invariants.sql`
- Test: `tests/crud/remote-prune-safety.test.ts`

**Interfaces:**
- `createRemoteBackup(databaseUrl, outputDirectory): Promise<{ path: string; sha256: string }>` creates a timestamped backup outside the repository and returns its path/hash.
- `pruneRemoteOperational(env: NodeJS.ProcessEnv, confirmation: string): Promise<RemotePruneReport>` performs target validation, backup, transactional prune, postconditions, and sanitized reporting.
- `RemotePruneReport` contains backup path/hash, before/after counts, preserved-data checks, and `postCommitVerificationPassed`.

- [ ] **Step 1: Write failing remote safety tests**

Add tests named:

- `refuses remote prune without exact confirmation`;
- `refuses remote prune when the project reference mismatches`;
- `refuses remote prune without direct database URL`;
- `does not load .env.local for remote execution`;
- `reports post-commit verification failure without claiming rollback`.

- [ ] **Step 2: Run safety tests and verify failure**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/remote-prune-safety.test.ts
```

Expected: FAIL because the remote backup/prune modules do not exist.

- [ ] **Step 3: Implement backup helper**

Create a timestamped data backup outside the repository. Use the local PostgreSQL toolchain or an explicitly configured `PG_DUMP_BIN`; fail if the tool is unavailable. Hash the resulting backup and never stage it in Git.

- [ ] **Step 4: Implement remote prune transaction**

The command must:

1. load only `.env.remote.local`;
2. validate URL, project ref, confirmation, service-role key, and direct DB URL;
3. create the backup before opening a write transaction;
4. snapshot landing/master/admin data;
5. run `remote-operational-prune.sql` with the explicit target set;
6. delete non-admin Auth rows only after all dependent operational rows are removed;
7. assert preserved rows and admin IDs are unchanged before commit;
8. commit only after in-transaction checks pass;
9. re-query after commit and report post-commit verification separately.

The SQL must not contain insert statements for guru, murid, payroll, schedule, invoice, payment, or other fixture rows.

- [ ] **Step 5: Run remote safety tests**

Run:

```bash
npx vitest run --coverage.enabled=false tests/crud/remote-prune-safety.test.ts
```

Expected: PASS without contacting the remote database.

- [ ] **Step 6: Execute remote prune only after backup preflight**

Validate `.env.remote.local` and backup destination. Then run:

```bash
npm run prune:remote -- --confirm <exact-confirmation>
```

Expected: no fixture insertion, preserved landing/admin checks pass, and the report contains a backup path/hash. Stop if the remote direct DB URL or backup command is unavailable.

- [ ] **Step 7: Commit remote prune**

```bash
git add scripts/lib/remote-backup.mjs scripts/prune-remote-operational.mjs scripts/sql/remote-operational-prune.sql scripts/sql/remote-prune-invariants.sql tests/crud/remote-prune-safety.test.ts
git commit -m "feat(seed): add backup-gated remote operational prune"
```

### Task 5: Integrated Verification and Continuity Artifacts

**Files:**
- Modify: `progress.md`
- Modify: `session-handoff.md`
- Modify: `feature_list.json` only if the repository feature tracker requires a new completed maintenance item

**Interfaces:**
- No new application API. This task records observed seed/prune reports and verification evidence.

- [ ] **Step 1: Run focused tests after both commands exist**

```bash
npx vitest run --coverage.enabled=false tests/crud/demo-seeder-safety.test.ts tests/crud/demo-fixture.test.ts tests/crud/local-demo-seeder.test.ts tests/crud/remote-prune-safety.test.ts
```

Expected: all focused suites pass.

- [ ] **Step 2: Run the full harness**

```bash
./init.sh
```

Expected: lint passes with zero errors/warnings, all Vitest suites pass, and the production Webpack build completes successfully.

- [ ] **Step 3: Run authenticated local browser smoke**

With `.env.local` pointing to local Supabase and the local dev server running, verify at 360px, 375px, and 1280px:

- `/login` accepts the preserved local admin;
- a dummy guru can access `/guru` and its teaching/payroll views;
- `/admin/payroll` shows open/closed/paid periods and Guru 07's no-minimum case;
- `/admin/spp` shows multi-program invoices and both discount types;
- the public landing page still renders preserved landing data;
- no document horizontal overflow or browser errors occur.

- [ ] **Step 4: Record evidence**

Update `progress.md` and `session-handoff.md` with exact commands, counts, backup path/hash, local/remote target reports, and any deferred Excel-import note. Do not record credentials or secret values.

- [ ] **Step 5: Final repository verification and commit**

```bash
git status --short --branch
git add progress.md session-handoff.md
git commit -m "docs(seed): record local fixture and prune verification"
```

Expected: no credential manifest, environment secret, backup, or generated local artifact is tracked.

## Execution Order

Tasks are sequential because each stage consumes the previous stage's interfaces:

1. Task 1 — environment and guards;
2. Task 2 — fixture definitions and SQL;
3. Task 3 — local Auth lifecycle and seeder;
4. Task 4 — remote backup/prune;
5. Task 5 — full verification and continuity documentation.

Run local seeding and browser verification before any remote prune command. Remote prune is never part of ordinary automated tests.
