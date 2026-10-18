import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import {
  ENROLLMENT_FIXTURES,
  GURU_FIXTURES,
  STUDENT_FIXTURES,
  renderFixtureSql,
  validateFixtureDefinition,
} from "./lib/demo-fixture.mjs";
import { assertLocalSeedTarget, getLocalDatabaseUrl } from "./lib/seed-target.mjs";
import { createGuruUsers, deleteCreatedUsers } from "./lib/local-auth.mjs";
import { withPostgresTransaction } from "./lib/postgres.mjs";

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const CLEANUP_SQL_PATH = path.join(ROOT_DIR, "scripts/sql/operational-cleanup.sql");
const INVARIANTS_SQL_PATH = path.join(ROOT_DIR, "scripts/sql/local-demo-invariants.sql");
const MANIFEST_PATH = path.join(ROOT_DIR, "supabase/seed-credentials.local.json");

function requireEnvironmentValue(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} wajib diisi.`);
  return value;
}
/**
 * @param {Record<string, string | undefined>} baseEnv
 * @param {string} envFilePath
 * @returns {Record<string, string | undefined>}
 */
export function loadLocalEnvironment(
  baseEnv = process.env,
  envFilePath = path.join(ROOT_DIR, ".env.local")
) {
  let fileEnv = {};
  try {
    fileEnv = dotenv.parse(readFileSync(envFilePath, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return { ...fileEnv, ...baseEnv };
}

function createDefaultAdminClient(env) {
  const url = requireEnvironmentValue(env, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnvironmentValue(env, "SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createPasswordSource(env) {
  const configuredPassword = env.SEED_GURU_PASSWORD?.trim();
  if (configuredPassword) return { password: configuredPassword };
  return {};
}

function writeCredentialManifest(manifest) {
  mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  return MANIFEST_PATH;
}

function buildDependencies(env, overrides) {
  return {
    createAdminClient: overrides.createAdminClient || (() => createDefaultAdminClient(env)),
    withPostgresTransaction: overrides.withPostgresTransaction || withPostgresTransaction,
    cleanupSql: overrides.cleanupSql || readFileSync(CLEANUP_SQL_PATH, "utf8"),
    fixtureSql: overrides.fixtureSql || renderFixtureSql(),
    invariantsSql: overrides.invariantsSql || readFileSync(INVARIANTS_SQL_PATH, "utf8"),
    writeManifest: overrides.writeManifest || writeCredentialManifest,
  };
}
/**
 * @param {Record<string, string | undefined>} [env]
 * @param {Record<string, any>} [overrides]
 */
export async function seedLocalDemo(env = process.env, overrides = {}) {
  const resolvedEnv = env === process.env ? loadLocalEnvironment() : env;
  validateFixtureDefinition();
  assertLocalSeedTarget(requireEnvironmentValue(resolvedEnv, "NEXT_PUBLIC_SUPABASE_URL"));
  const databaseUrl = getLocalDatabaseUrl(resolvedEnv);
  const dependencies = buildDependencies(resolvedEnv, overrides);
  const adminClient = dependencies.createAdminClient();
  let createdUsers = [];

  await dependencies.withPostgresTransaction(databaseUrl, async (client) => {
    await client.query(dependencies.cleanupSql);
    const result = await client.query(
      "SELECT id FROM public.profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1"
    );
    if (!result.rows[0]?.id) {
      throw new Error("Tidak ada akun admin lokal untuk membuat fixture payroll/SPP.");
    }
  });

  try {
    createdUsers = await createGuruUsers(
      adminClient,
      GURU_FIXTURES,
      createPasswordSource(resolvedEnv)
    );

    await dependencies.withPostgresTransaction(databaseUrl, async (client) => {
      await client.query(dependencies.fixtureSql);
      await client.query(dependencies.invariantsSql);
    });

    const manifestPath = await dependencies.writeManifest({
      generatedAt: new Date().toISOString(),
      target: "local",
      users: createdUsers,
    });

    return {
      target: "local",
      gurus: GURU_FIXTURES.length,
      students: STUDENT_FIXTURES.length,
      enrollments: ENROLLMENT_FIXTURES.length,
      manifestPath,
    };
  } catch (error) {
    if (createdUsers.length > 0) {
      await deleteCreatedUsers(
        adminClient,
        createdUsers.map((user) => user.id)
      );
    }
    throw error;
  }
}

const entrypoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (entrypoint === import.meta.url) {
  seedLocalDemo()
    .then((report) => {
      console.log(JSON.stringify(report));
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
