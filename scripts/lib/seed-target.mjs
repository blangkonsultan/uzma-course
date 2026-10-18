export const REMOTE_PRUNE_CONFIRMATION = "PRUNE_REMOTE_OPERATIONAL_DATA";

function parseUrl(value, label) {
  try {
    return new URL(value);
  } catch {
    throw new Error(`${label} harus berupa URL yang valid.`);
  }
}

function requiredEnv(env, name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`${name} wajib diisi.`);
  }
  return value;
}

function isLocalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function assertLocalSeedTarget(url) {
  const parsed = parseUrl(url, "NEXT_PUBLIC_SUPABASE_URL");
  if (!isLocalHost(parsed.hostname) || parsed.port !== "54321") {
    throw new Error(
      "Local seed hanya boleh menggunakan Supabase API lokal pada port 54321."
    );
  }
}

export function assertRemotePruneTarget({
  url,
  projectRef,
  expectedProjectRef,
  confirmation,
}) {
  const parsed = parseUrl(url, "SEED_REMOTE_SUPABASE_URL");
  const expectedHostname = `${expectedProjectRef}.supabase.co`;

  if (parsed.protocol !== "https:") {
    throw new Error("Remote prune hanya boleh menggunakan URL HTTPS.");
  }
  if (isLocalHost(parsed.hostname)) {
    throw new Error("Remote prune menolak target Supabase lokal.");
  }
  if (projectRef !== expectedProjectRef || parsed.hostname !== expectedHostname) {
    throw new Error("Project reference remote tidak cocok dengan target URL.");
  }
  if (confirmation !== REMOTE_PRUNE_CONFIRMATION) {
    throw new Error("Konfirmasi remote prune tidak cocok.");
  }
}

export function getLocalDatabaseUrl(env) {
  return requiredEnv(env, "SUPABASE_DB_URL");
}

export function validateRemotePruneEnvironment(env) {
  const url = requiredEnv(env, "SEED_REMOTE_SUPABASE_URL");
  const projectRef = requiredEnv(env, "SEED_REMOTE_PROJECT_REF");
  const serviceRoleKey = requiredEnv(env, "SEED_REMOTE_SERVICE_ROLE_KEY");
  const databaseUrl = requiredEnv(env, "SEED_REMOTE_DB_URL");
  const parsedApiUrl = parseUrl(url, "SEED_REMOTE_SUPABASE_URL");
  const parsedDatabaseUrl = parseUrl(databaseUrl, "SEED_REMOTE_DB_URL");

  if (isLocalHost(parsedApiUrl.hostname) || isLocalHost(parsedDatabaseUrl.hostname)) {
    throw new Error("Remote prune menolak environment dengan host lokal.");
  }

  return { url, projectRef, serviceRoleKey, databaseUrl };
}
