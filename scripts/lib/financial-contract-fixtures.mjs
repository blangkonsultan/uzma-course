import { readFileSync } from "node:fs";
import { withPostgresConnection } from "./postgres.mjs";

const FIXTURE_SQL = readFileSync(new URL("../sql/owned-financial-fixtures.sql", import.meta.url), "utf8");
const ACTOR_KEYS = ["admin", "guru", "equal", "above", "disabled", "no_income", "inactive", "inactive_earned", "missing"];
const PERIOD_KEYS = ["period", "next_period", "legacy_period", "failure_period"];

export async function createFinancialFixtures(client) {
  await client.query(FIXTURE_SQL);
  const { rows } = await client.query("SELECT key,id FROM pg_temp.qa_financial_ids");
  return Object.fromEntries(rows.map(({ key, id }) => [key, id]));
}

// Standalone suites announce their own exact ownership keys before persistent writes.
// Identifiers are restricted here; all announced values remain SQL parameters.
export async function assertFinancialManifestAbsent(client, manifest) {
  const auditColumns = new Map([
    ["auth.users", "id"], ["public.profiles", "id"], ["public.branches", "id"],
    ["public.programs", "id"], ["public.program_variants", "id"], ["public.branch_shifts", "id"],
    ["public.schedule_drafts", "id"], ["public.schedule_classes", "id"], ["public.students", "id"],
    ["public.profile_branches", "profile_id"], ["public.schedule_placements", "class_id"],
    ["public.student_invoices", "student_id"], ["public.student_payments", "student_id"],
  ]);
  if (!Array.isArray(manifest) || manifest.length !== auditColumns.size) {
    throw new Error("Independent financial manifest must contain every owned table audit descriptor.");
  }
  const seen = new Set();
  const leftovers = [];
  for (const descriptor of manifest) {
    const { table, column, ids } = descriptor;
    if (auditColumns.get(table) !== column || seen.has(table)
      || !Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string" && id.length > 0)) {
      throw new Error("Independent financial manifest contains an invalid or duplicate ownership descriptor.");
    }
    seen.add(table);
    const { rows } = await client.query(`SELECT count(*)::integer n FROM ${table} WHERE ${column}::text=ANY($1::text[])`, [ids]);
    if (rows[0].n !== 0) leftovers.push({ table, column, count: rows[0].n });
  }
  if (leftovers.length) throw new Error(`Independent financial fixture leftovers: ${JSON.stringify(leftovers)}`);
}

export async function assertFinancialFixturesAbsent(client, ids) {
  const actors = ACTOR_KEYS.map((key) => ids[key]);
  const periods = PERIOD_KEYS.map((key) => ids[key]);
  const { rows } = await client.query(`
    SELECT 'auth.users' entity,count(*)::integer n FROM auth.users WHERE id=ANY($1::uuid[])
    UNION ALL SELECT 'profiles',count(*)::integer FROM public.profiles WHERE id=ANY($1::uuid[])
    UNION ALL SELECT 'branches',count(*)::integer FROM public.branches WHERE id=$2
    UNION ALL SELECT 'programs',count(*)::integer FROM public.programs WHERE id=$3
    UNION ALL SELECT 'variants',count(*)::integer FROM public.program_variants WHERE program_id=$3
    UNION ALL SELECT 'students',count(*)::integer FROM public.students WHERE id=$4 OR branch_id=$2
    UNION ALL SELECT 'student_programs',count(*)::integer FROM public.student_programs WHERE student_id=$4 OR program_id=$3
    UNION ALL SELECT 'invoices',count(*)::integer FROM public.student_invoices WHERE student_id=$4 OR branch_id=$2
    UNION ALL SELECT 'payments',count(*)::integer FROM public.student_payments WHERE student_id=$4
    UNION ALL SELECT 'shifts',count(*)::integer FROM public.branch_shifts WHERE branch_id=$2
    UNION ALL SELECT 'drafts',count(*)::integer FROM public.schedule_drafts WHERE branch_id=$2
    UNION ALL SELECT 'classes',count(*)::integer FROM public.schedule_classes WHERE teacher_id=ANY($1::uuid[])
    UNION ALL SELECT 'placements',count(*)::integer FROM public.schedule_placements WHERE student_id=$4
    UNION ALL SELECT 'sessions',count(*)::integer FROM public.teaching_sessions WHERE branch_id=$2
    UNION ALL SELECT 'session_students',count(*)::integer FROM public.teaching_session_students WHERE student_id=$4
    UNION ALL SELECT 'periods',count(*)::integer FROM public.payroll_periods WHERE id=ANY($5::uuid[])
    UNION ALL SELECT 'entries',count(*)::integer FROM public.payroll_entries WHERE period_id=ANY($5::uuid[]) OR teacher_id=ANY($1::uuid[])
    UNION ALL SELECT 'adjustments',count(*)::integer FROM public.payroll_adjustments WHERE period_id=ANY($5::uuid[]) OR teacher_id=ANY($1::uuid[])
    UNION ALL SELECT 'session_lines',count(*)::integer FROM public.payroll_session_lines WHERE period_id=ANY($5::uuid[]) OR teacher_id=ANY($1::uuid[])
  `, [actors, `qa-${ids.branch}`, ids.program, ids.student, periods]);
  const leftovers = rows.filter(({ n }) => n !== 0);
  if (leftovers.length) throw new Error(`Owned financial fixture leftovers: ${JSON.stringify(leftovers)}`);
}

async function cleanupFinancialFixtures(client, ids) {
  await client.query("BEGIN");
  try {
    const periods = PERIOD_KEYS.map((key) => ids[key]);
    for (const table of ["payroll_adjustments", "payroll_entries", "payroll_session_lines"]) {
      await client.query(`DELETE FROM public.${table} WHERE period_id=ANY($1::uuid[])`, [periods]);
    }
    await client.query("DELETE FROM public.payroll_periods WHERE id=ANY($1::uuid[])", [periods]);
    await client.query("DELETE FROM public.student_payments WHERE student_id=$1", [ids.student]);
    await client.query("DELETE FROM public.student_invoices WHERE student_id=$1", [ids.student]);
    await client.query("DELETE FROM public.teaching_session_students WHERE student_id=$1", [ids.student]);
    await client.query("DELETE FROM public.teaching_sessions WHERE branch_id=$1", [`qa-${ids.branch}`]);
    await client.query("DELETE FROM public.schedule_placements WHERE student_id=$1", [ids.student]);
    await client.query("DELETE FROM public.schedule_classes WHERE draft_id=$1", [ids.draft]);
    await client.query("DELETE FROM public.schedule_drafts WHERE id=$1", [ids.draft]);
    await client.query("DELETE FROM public.branch_shifts WHERE id=$1", [ids.shift]);
    await client.query("DELETE FROM public.student_programs WHERE student_id=$1", [ids.student]);
    await client.query("DELETE FROM public.students WHERE id=$1", [ids.student]);
    await client.query("DELETE FROM auth.users WHERE id=ANY($1::uuid[])", [ACTOR_KEYS.map((key) => ids[key])]);
    await client.query("DELETE FROM public.program_variants WHERE id=$1", [ids.variant]);
    await client.query("DELETE FROM public.programs WHERE id=$1", [ids.program]);
    await client.query("DELETE FROM public.branches WHERE id=$1", [`qa-${ids.branch}`]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  await assertFinancialFixturesAbsent(client, ids);
}

const requireContract = (condition, name) => { if (!condition) throw new Error(name); };

async function adminTransaction(client, admin) {
  await client.query("BEGIN");
  await client.query("SET LOCAL statement_timeout='15s'");
  await client.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role','authenticated',true)", [admin]);
  await client.query("SET LOCAL ROLE authenticated");
}

async function waitUntilBlocked(observer, blockedPid, blockerPid, name) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const { rows } = await observer.query("SELECT $2::integer=ANY(pg_blocking_pids($1::integer)) blocked", [blockedPid, blockerPid]);
    if (rows[0].blocked) return;
    const delay = Promise.withResolvers();
    setTimeout(delay.resolve, 20);
    await delay.promise;
  }
  throw new Error(`${name}: no observed real database lock contention`);
}

async function withCommittedFixtures(databaseUrl, scenario) {
  await withPostgresConnection(databaseUrl, async (owner) => {
    let ids;
    try {
      await owner.query("BEGIN");
      ids = await createFinancialFixtures(owner);
      await owner.query("COMMIT");
      console.log(`[contracts] Committed owned concurrency fixture manifest: ${JSON.stringify(ids)}`);
      await scenario(owner, ids);
    } finally {
      await owner.query("ROLLBACK");
      if (ids) {
        await cleanupFinancialFixtures(owner, ids);
        console.log("[contracts] Committed concurrency fixtures: zero leftovers verified.");
      }
    }
  });
}

export async function runPayrollConcurrencyContracts(databaseUrl) {
  await withCommittedFixtures(databaseUrl, async (first, ids) => {
    await withPostgresConnection(databaseUrl, async (second) => {
      let pending;
      try {
        const firstPid = (await first.query("SELECT pg_backend_pid() pid")).rows[0].pid;
        const secondPid = (await second.query("SELECT pg_backend_pid() pid")).rows[0].pid;
        await adminTransaction(first, ids.admin);
        await first.query("SELECT id FROM public.payroll_periods WHERE id=$1 FOR UPDATE", [ids.period]);
        await adminTransaction(second, ids.admin);
        pending = second.query("SELECT public.close_payroll_period($1)", [ids.period]).then(() => ({ code: "00000" }), (error) => error);
        await waitUntilBlocked(first, secondPid, firstPid, "concurrent_close");
        await first.query("SELECT public.close_payroll_period($1)", [ids.period]);
        await first.query("COMMIT");
        const rejected = await pending;
        requireContract(rejected.code === "P0001" && rejected.message === "Periode payroll sudah tidak terbuka.", `concurrent_close: expected explicit P0001 domain rejection, got ${rejected.code}`);
        await second.query("ROLLBACK");
        const { rows } = await first.query("SELECT amount,created_by FROM public.payroll_adjustments WHERE period_id=$1 AND teacher_id=$2 AND kind='minimum_income_topup'", [ids.period, ids.guru]);
        requireContract(rows.length === 1 && rows[0].amount === 47000 && rows[0].created_by === ids.admin, "concurrent_close: exactly one attributed Rp47000 topup");
        console.log("[contracts] concurrent_close: two connections, observed period-lock wait, one close and one domain rejection.");
      } finally {
        await first.query("ROLLBACK");
        if (pending) await pending;
        await second.query("ROLLBACK");
      }
    });
  });
  await withCommittedFixtures(databaseUrl, async (observer, ids) => {
    await withPostgresConnection(databaseUrl, async (closer) => {
      let pending;
      try {
        const blockerPid = (await observer.query("SELECT pg_backend_pid() pid")).rows[0].pid;
        const closerPid = (await closer.query("SELECT pg_backend_pid() pid")).rows[0].pid;
        await observer.query("BEGIN");
        await observer.query("SET LOCAL statement_timeout='15s'");
        // INSERT into the adjustment ledger is the first write after profile capture.
        // SHARE permits reading but blocks that INSERT, without a test-only production hook.
        await observer.query("LOCK TABLE public.payroll_adjustments IN SHARE MODE");
        await adminTransaction(closer, ids.admin);
        pending = closer.query("SELECT public.close_payroll_period($1)", [ids.period]).then(() => null, (error) => error);
        await waitUntilBlocked(observer, closerPid, blockerPid, "captured_profile_snapshot");
        await observer.query("UPDATE public.profiles SET minimum_income=900000,allowances='[{\"name\":\"Concurrent changed allowance\",\"amount\":800000}]'::jsonb WHERE id=$1", [ids.guru]);
        await observer.query("COMMIT");
        const error = await pending;
        if (error) throw error;
        await closer.query("COMMIT");
        const { rows } = await observer.query(`SELECT pe.*,pa.amount topup FROM public.payroll_entries pe
          JOIN public.payroll_adjustments pa USING(period_id,teacher_id)
          WHERE pe.period_id=$1 AND pe.teacher_id=$2 AND pa.kind='minimum_income_topup'`, [ids.period, ids.guru]);
        requireContract(rows.length === 1 && rows[0].fee_sessions_total === 3000 && rows[0].fixed_allowances_total === 400000 && rows[0].minimum_income_snapshot === 450000 && rows[0].topup === 47000 && rows[0].total_amount === 450000 && rows[0].allowances_snapshot[0].amount === 400000, "captured_profile_snapshot: close must use one original profile snapshot despite concurrent committed edit");
        const profile = (await observer.query("SELECT minimum_income FROM public.profiles WHERE id=$1", [ids.guru])).rows[0];
        requireContract(profile.minimum_income === 900000, "captured_profile_snapshot: concurrent profile edit must actually commit");
        console.log("[contracts] captured_profile_snapshot: observed ledger-insert lock wait, concurrent profile edit committed, original close snapshots retained.");
      } finally {
        await observer.query("ROLLBACK");
        if (pending) await pending;
        await closer.query("ROLLBACK");
      }
    });
  });
}
