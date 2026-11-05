// scripts/verify-financial-contracts.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { withPostgresConnection } from "./lib/postgres.mjs";
import { assertLocalSeedTarget } from "./lib/seed-target.mjs";
import { loadLocalEnvironment } from "./seed-local-demo.mjs";
import { createFinancialFixtures, assertFinancialFixturesAbsent, assertFinancialManifestAbsent, runPayrollConcurrencyContracts } from "./lib/financial-contract-fixtures.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const SUITE_FILES = {
  "billing-security": path.join(ROOT_DIR, "scripts/sql/billing-security-contracts.sql"),
  "teacher-billing": path.join(ROOT_DIR, "scripts/sql/teacher-billing-contracts.sql"),
  "payroll-minimum": path.join(ROOT_DIR, "scripts/sql/payroll-minimum-contracts.sql"),
};

export async function runFinancialContracts(suites, { concurrencyOnly = false, baseline = false } = {}) {
  if (concurrencyOnly && !suites.includes("payroll-minimum")) throw new Error("--concurrency-only requires --suite payroll-minimum or all.");
  const env = loadLocalEnvironment();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  assertLocalSeedTarget(supabaseUrl);
  const databaseUrl = env.SUPABASE_DB_URL || env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const parsedDb = new URL(databaseUrl);
  
  // Reject if query parameters attempt to override host/port
  if (parsedDb.searchParams.has("host") || parsedDb.searchParams.has("port")) {
    throw new Error("Database URL query parameters cannot override host or port.");
  }
  if (parsedDb.hostname !== "127.0.0.1" && parsedDb.hostname !== "localhost") {
    throw new Error(`Database URL must target local loopback host, got: ${parsedDb.hostname}`);
  }
  if (parsedDb.port !== "54322") {
    throw new Error(`Database URL must target local port 54322, got: ${parsedDb.port}`);
  }

  // Safe redaction of password in connection string for logging
  const sanitizedUrl = new URL(databaseUrl);
  if (sanitizedUrl.password) {
    sanitizedUrl.password = "******";
  }
  if (sanitizedUrl.searchParams.has("password")) {
    sanitizedUrl.searchParams.set("password", "******");
  }
  console.log(`[contracts] Running suites: ${suites.join(", ")} on ${sanitizedUrl.href}`);
  await withPostgresConnection(databaseUrl, async (client) => {
    // Inventory only: this runner NEVER applies migrations, seeds, or resets.
    const required = ["20261104090000", "20261104091000", "20261104092000"];
    if (!baseline) required.push("20261104110000", "20261104111000", "20261105090000");
    if (baseline) console.log("[contracts] Explicit baseline mode: checking original financial migration inventory for RED proof.");
    const migrations = await client.query("SELECT version FROM supabase_migrations.schema_migrations WHERE version=ANY($1::text[])", [required]);
    const present = new Set(migrations.rows.map(({ version }) => version));
    const missing = required.filter((version) => !present.has(version));
    if (missing.length) throw new Error(`Expected financial migrations missing: ${missing.join(", ")}. Apply reviewed migrations separately; the runner never applies them.`);
    const schema = await client.query(`SELECT
      to_regclass('auth.users') IS NOT NULL AND to_regclass('public.payroll_entries') IS NOT NULL
      AND to_regprocedure('public.close_payroll_period(uuid)') IS NOT NULL
      AND to_regprocedure('public.add_payroll_adjustment(uuid,uuid,integer,text)') IS NOT NULL
      AND to_regprocedure('public.generate_due_student_invoices(text)') IS NOT NULL
      AND to_regprocedure('public.record_student_payment(uuid,text,date,text,text)') IS NOT NULL
      AND to_regprocedure('public.get_teacher_overdue_spp(uuid[])') IS NOT NULL
      AND to_regprocedure('public.get_teacher_class_students(uuid[])') IS NOT NULL
      AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='payroll_adjustments' AND column_name='kind')
      expected`);
    if (!schema.rows[0].expected) throw new Error("Expected financial schema/RPCs missing; no fixtures created.");
    // Serialize owned future-month allocation across runner processes.
    await client.query("SELECT pg_advisory_lock(611041100)");
    try {
      for (const suite of concurrencyOnly ? [] : suites) {
        const suiteFile = SUITE_FILES[suite];
        if (!suiteFile) throw new Error(`Unknown suite: ${suite}`);
        console.log(`[contracts] Starting suite: ${suite}...`);
        let ids;
        let independentManifest;
        let manifestError;
        let suiteError;
        const noticePrefix = "qa_financial_manifest:";
        const captureManifest = (notice) => {
          if (!notice.message?.startsWith(noticePrefix)) return;
          try {
            if (independentManifest) throw new Error("Duplicate independent fixture ownership manifest.");
            independentManifest = JSON.parse(notice.message.slice(noticePrefix.length));
          } catch (error) {
            manifestError = error;
          }
        };
        client.on("notice", captureManifest);
        await client.query("BEGIN");
        try {
          await client.query("SET LOCAL statement_timeout='30s'");
          if (suite !== "teacher-billing") ids = await createFinancialFixtures(client);
          await client.query(readFileSync(suiteFile, "utf8"));
          console.log(`[contracts] Suite ${suite} passed assertions.`);
        } catch (error) {
          suiteError = error;
          throw error;
        } finally {
          client.removeListener("notice", captureManifest);
          await client.query("ROLLBACK");
          if (suite === "teacher-billing") {
            if (manifestError) throw manifestError;
            if (!independentManifest) {
              throw new Error(`Teacher suite did not announce its owned ID manifest before writes.${suiteError ? ` Original failure: ${suiteError.message}` : ""}`);
            }
            await assertFinancialManifestAbsent(client, independentManifest);
            console.log("[contracts] Suite teacher-billing: zero independent owned leftovers after rollback.");
          }
          if (ids) {
            await assertFinancialFixturesAbsent(client, ids);
            console.log(`[contracts] Suite ${suite}: zero owned leftovers after rollback.`);
          }
        }
      }
      if (suites.includes("payroll-minimum")) await runPayrollConcurrencyContracts(databaseUrl);
    } finally {
      await client.query("SELECT pg_advisory_unlock(611041100)");
    }
  });
}

// CLI handler
if (process.argv[1] && process.argv[1].endsWith("verify-financial-contracts.mjs")) {
  const suiteArgIndex = process.argv.indexOf("--suite");
  const suiteArg = suiteArgIndex !== -1 ? process.argv[suiteArgIndex + 1] : "all";

  let suitesToRun = [];
  if (suiteArg === "all") {
    suitesToRun = Object.keys(SUITE_FILES);
  } else if (suiteArg in SUITE_FILES) {
    suitesToRun = [suiteArg];
  } else {
    console.error(`Error: invalid --suite ${suiteArg}. Options: billing-security, teacher-billing, payroll-minimum, all`);
    process.exit(1);
  }

  runFinancialContracts(suitesToRun, {
    concurrencyOnly: process.argv.includes("--concurrency-only"),
    baseline: process.argv.includes("--baseline"),
  })
    .then(() => {
      console.log("[contracts] All requested suites passed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[contracts] FAILED:", err.message);
      process.exit(1);
    });
}
