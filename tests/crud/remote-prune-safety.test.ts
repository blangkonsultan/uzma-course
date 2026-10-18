import { describe, expect, it, vi } from "vitest";
import {
  REMOTE_PRUNE_CONFIRMATION,
} from "@/../scripts/lib/seed-target.mjs";
import { pruneRemoteOperational } from "@/../scripts/prune-remote-operational.mjs";

type RemoteEnv = Record<string, string | undefined>;
type FakeClient = {
  query: (sql: string) => Promise<{ rows: Array<Record<string, never>> }>;
};

const remoteEnv = (): RemoteEnv => ({
  SEED_REMOTE_SUPABASE_URL: "https://demo-ref.supabase.co",
  SEED_REMOTE_PROJECT_REF: "demo-ref",
  SEED_REMOTE_SERVICE_ROLE_KEY: "remote-service-role-placeholder",
  SEED_REMOTE_DB_URL: "postgresql://postgres:secret@db.example.com:5432/postgres",
});

describe("remote operational prune safety", () => {
  it("refuses remote prune without exact confirmation", async () => {
    const createRemoteBackup = vi.fn();

    await expect(
      pruneRemoteOperational(remoteEnv(), "wrong-confirmation", {
        createRemoteBackup,
      })
    ).rejects.toThrow(/Konfirmasi remote prune/i);

    expect(createRemoteBackup).not.toHaveBeenCalled();
  });

  it("refuses remote prune when the project reference mismatches", async () => {
    await expect(
      pruneRemoteOperational(
        { ...remoteEnv(), SEED_REMOTE_PROJECT_REF: "other-ref" },
        REMOTE_PRUNE_CONFIRMATION
      )
    ).rejects.toThrow(/project reference/i);
  });

  it("refuses remote prune without a direct database URL", async () => {
    const env = remoteEnv();
    delete env.SEED_REMOTE_DB_URL;

    await expect(
      pruneRemoteOperational(env, REMOTE_PRUNE_CONFIRMATION)
    ).rejects.toThrow(/SEED_REMOTE_DB_URL/i);
  });

  it("does not use local application environment variables", async () => {
    await expect(
      pruneRemoteOperational(
        {
          NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
          SUPABASE_SERVICE_ROLE_KEY: "local-service-role-placeholder",
        },
        REMOTE_PRUNE_CONFIRMATION
      )
    ).rejects.toThrow(/SEED_REMOTE_SUPABASE_URL/i);
  });

  it("reports post-commit verification failure without claiming rollback", async () => {
    const report = await pruneRemoteOperational(
      remoteEnv(),
      REMOTE_PRUNE_CONFIRMATION,
      {
        createRemoteBackup: vi.fn().mockResolvedValue({
          path: "/tmp/demo-prune.dump",
          sha256: "backup-hash",
        }),
        withPostgresTransaction: async (
          _url: string,
          callback: (client: FakeClient) => Promise<unknown>
        ): Promise<unknown> =>
          callback({ query: vi.fn().mockResolvedValue({ rows: [] }) }),
        verifyPostCommit: vi.fn().mockRejectedValue(new Error("landing changed")),
      }
    );

    expect(report.committed).toBe(true);
    expect(report.postCommitVerificationPassed).toBe(false);
    expect(report.backup.sha256).toBe("backup-hash");
  });
});
