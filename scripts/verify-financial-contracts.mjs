// scripts/verify-financial-contracts.mjs
import { readFileSync } from "node:fs";
import path from "node:path";
import { withPostgresConnection } from "./lib/postgres.mjs";
import { assertLocalSeedTarget } from "./lib/seed-target.mjs";
import { loadLocalEnvironment } from "./seed-local-demo.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const SUITE_FILES = {
  "billing-security": path.join(ROOT_DIR, "scripts/sql/billing-security-contracts.sql"),
  "teacher-billing": path.join(ROOT_DIR, "scripts/sql/teacher-billing-contracts.sql"),
  "payroll-minimum": path.join(ROOT_DIR, "scripts/sql/payroll-minimum-contracts.sql"),
};

export async function runFinancialContracts(suites) {
  const env = loadLocalEnvironment();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  assertLocalSeedTarget(supabaseUrl);
  const databaseUrl = env.SUPABASE_DB_URL || env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const parsedDb = new URL(databaseUrl);
  if (parsedDb.hostname !== "127.0.0.1" && parsedDb.hostname !== "localhost") {
    throw new Error(`Database URL must target local loopback host, got: ${parsedDb.hostname}`);
  }
  if (parsedDb.port !== "54322") {
    throw new Error(`Database URL must target local port 54322, got: ${parsedDb.port}`);
  }

  console.log(`[contracts] Running suites: ${suites.join(", ")} on ${databaseUrl.replace(/:[^:@]+@/, ":***@")}`);

  await withPostgresConnection(databaseUrl, async (client) => {
    for (const suite of suites) {
      const suiteFile = SUITE_FILES[suite];
      if (!suiteFile) {
        throw new Error(`Unknown suite: ${suite}`);
      }
      console.log(`[contracts] Starting suite: ${suite}...`);
      const sql = readFileSync(suiteFile, "utf8");

      // Execute inside a transaction that always rolls back to preserve database state
      await client.query("BEGIN");
      try {
        await client.query(sql);
        console.log(`[contracts] Suite ${suite} passed assertions.`);
      } finally {
        await client.query("ROLLBACK");
      }
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

  runFinancialContracts(suitesToRun)
    .then(() => {
      console.log("[contracts] All requested suites passed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[contracts] FAILED:", err.message);
      process.exit(1);
    });
}
