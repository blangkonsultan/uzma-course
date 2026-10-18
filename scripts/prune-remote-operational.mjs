import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import {
  assertRemotePruneTarget,
  validateRemotePruneEnvironment,
} from "./lib/seed-target.mjs";
import { createRemoteBackup } from "./lib/remote-backup.mjs";
import { withPostgresConnection, withPostgresTransaction } from "./lib/postgres.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PRUNE_SQL_PATH = path.join(ROOT_DIR, "scripts/sql/remote-operational-prune.sql");
const INVARIANTS_SQL_PATH = path.join(ROOT_DIR, "scripts/sql/remote-prune-invariants.sql");
const DEFAULT_REMOTE_ENV_PATH = path.join(ROOT_DIR, ".env.remote.local");

const PRESERVED_SNAPSHOT_SQL = `
SELECT
  md5(COALESCE((
    SELECT string_agg(section || ':' || content::text, '|' ORDER BY section)
    FROM public.landing_content
  ), '')) AS landing_hash,
  COALESCE((
    SELECT string_agg(id::text, ',' ORDER BY id)
    FROM public.profiles
    WHERE role = 'admin'
  ), '') AS admin_ids,
  (SELECT COUNT(*)::text FROM public.programs) AS program_count,
  (SELECT COUNT(*)::text FROM public.program_variants) AS variant_count,
  (SELECT COUNT(*)::text FROM public.branches) AS branch_count,
  (SELECT COUNT(*)::text FROM storage.objects WHERE bucket_id = 'program-logos') AS program_logo_count
`;

const OPERATIONAL_COUNT_SQL = `
SELECT
  (SELECT COUNT(*) FROM public.profiles WHERE role <> 'admin') AS non_admin_profiles,
  (SELECT COUNT(*) FROM public.students) AS students,
  (SELECT COUNT(*) FROM public.student_programs) AS student_programs,
  (SELECT COUNT(*) FROM public.branch_shifts) AS branch_shifts,
  (SELECT COUNT(*) FROM public.schedule_drafts) AS schedule_drafts,
  (SELECT COUNT(*) FROM public.teaching_sessions) AS teaching_sessions,
  (SELECT COUNT(*) FROM public.payroll_periods) AS payroll_periods,
  (SELECT COUNT(*) FROM public.student_invoices) AS student_invoices
`;

export function loadRemoteEnvironment(envFilePath = DEFAULT_REMOTE_ENV_PATH) {
  try {
    return dotenv.parse(readFileSync(envFilePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`File remote environment tidak ditemukan: ${envFilePath}`);
    }
    throw error;
  }
}

async function capturePreservedSnapshot(client) {
  const result = await client.query(PRESERVED_SNAPSHOT_SQL);
  return result.rows[0] || {};
}

function assertPreservedSnapshot(before, after) {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error("Snapshot landing/master/admin berubah selama remote prune.");
  }
}

async function verifyPostCommit(databaseUrl, expectedSnapshot) {
  return withPostgresConnection(databaseUrl, async (client) => {
    const currentSnapshot = await capturePreservedSnapshot(client);
    assertPreservedSnapshot(expectedSnapshot, currentSnapshot);
    const result = await client.query(OPERATIONAL_COUNT_SQL);
    const counts = result.rows[0] || {};
    const residual = Object.entries(counts).filter(([, value]) => Number(value) > 0);
    if (residual.length > 0) {
      throw new Error("Data operasional remote masih tersisa setelah commit.");
    }
    return true;
  });
}

export async function pruneRemoteOperational(
  env,
  confirmation,
  overrides = {}
) {
  const config = validateRemotePruneEnvironment(env);
  assertRemotePruneTarget({
    url: config.url,
    projectRef: config.projectRef,
    expectedProjectRef: config.projectRef,
    confirmation,
  });

  const dependencies = {
    createRemoteBackup: overrides.createRemoteBackup || createRemoteBackup,
    withPostgresTransaction: overrides.withPostgresTransaction || withPostgresTransaction,
    pruneSql: overrides.pruneSql || readFileSync(PRUNE_SQL_PATH, "utf8"),
    invariantsSql: overrides.invariantsSql || readFileSync(INVARIANTS_SQL_PATH, "utf8"),
    capturePreservedSnapshot: overrides.capturePreservedSnapshot || capturePreservedSnapshot,
    verifyPostCommit: overrides.verifyPostCommit || verifyPostCommit,
  };
  const backup = await dependencies.createRemoteBackup(
    config.databaseUrl,
    env.SEED_BACKUP_DIR
  );

  let preservedSnapshot;
  await dependencies.withPostgresTransaction(config.databaseUrl, async (client) => {
    const before = await dependencies.capturePreservedSnapshot(client);
    await client.query(dependencies.pruneSql);
    const after = await dependencies.capturePreservedSnapshot(client);
    assertPreservedSnapshot(before, after);
    await client.query(dependencies.invariantsSql);
    preservedSnapshot = before;
  });

  let postCommitVerificationPassed = true;
  let postCommitError = null;
  try {
    await dependencies.verifyPostCommit(config.databaseUrl, preservedSnapshot);
  } catch (error) {
    postCommitVerificationPassed = false;
    postCommitError = error instanceof Error ? error.message : String(error);
  }

  return {
    committed: true,
    postCommitVerificationPassed,
    postCommitError,
    backup,
  };
}

const entrypoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entrypoint === import.meta.url) {
  const remoteEnv = loadRemoteEnvironment();
  const confirmationIndex = process.argv.indexOf("--confirm");
  const confirmation = confirmationIndex >= 0 ? process.argv[confirmationIndex + 1] : "";

  pruneRemoteOperational(remoteEnv, confirmation || remoteEnv.SEED_REMOTE_CONFIRMATION || "")
    .then((report) => {
      console.log(JSON.stringify(report));
      if (!report.postCommitVerificationPassed) process.exitCode = 1;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
