import { describe, expect, it } from "vitest";
import {
  REMOTE_PRUNE_CONFIRMATION,
  assertLocalSeedTarget,
  assertRemotePruneTarget,
  getLocalDatabaseUrl,
  validateRemotePruneEnvironment,
} from "@/../scripts/lib/seed-target.mjs";

describe("demo seeder target guards", () => {
  it("rejects a remote URL for local seeding", () => {
    expect(() =>
      assertLocalSeedTarget("https://tnqudnltxblfbbgzkcwb.supabase.co")
    ).toThrow(/local/i);
  });

  it("accepts local Supabase API URLs", () => {
    expect(() => assertLocalSeedTarget("http://127.0.0.1:54321")).not.toThrow();
    expect(() => assertLocalSeedTarget("http://localhost:54321")).not.toThrow();
  });

  it("rejects remote prune when the project reference does not match", () => {
    expect(() =>
      assertRemotePruneTarget({
        url: "https://demo-ref.supabase.co",
        projectRef: "other-ref",
        expectedProjectRef: "demo-ref",
        confirmation: REMOTE_PRUNE_CONFIRMATION,
      })
    ).toThrow(/project reference/i);
  });

  it("rejects remote prune without exact confirmation", () => {
    expect(() =>
      assertRemotePruneTarget({
        url: "https://demo-ref.supabase.co",
        projectRef: "demo-ref",
        expectedProjectRef: "demo-ref",
        confirmation: "wrong-confirmation",
      })
    ).toThrow(/Konfirmasi remote/i);
  });

  it("rejects remote prune without a direct database URL", () => {
    expect(() =>
      validateRemotePruneEnvironment({
        SEED_REMOTE_SUPABASE_URL: "https://demo-ref.supabase.co",
        SEED_REMOTE_PROJECT_REF: "demo-ref",
        SEED_REMOTE_SERVICE_ROLE_KEY: "service-role-placeholder",
      })
    ).toThrow(/SEED_REMOTE_DB_URL/i);
  });

  it("returns the configured local database URL", () => {
    expect(
      getLocalDatabaseUrl({
        SUPABASE_DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      })
    ).toBe("postgresql://postgres:postgres@127.0.0.1:54322/postgres");
  });
});
