import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { ADMIN_FIXTURE, GURU_FIXTURES } from "@/../scripts/lib/demo-fixture.mjs";
import { createGuruUsers, ensureAdminUser } from "@/../scripts/lib/local-auth.mjs";
import {
  loadLocalEnvironment,
  seedLocalDemo,
} from "@/../scripts/seed-local-demo.mjs";

function createTempEnvFile(contents: string) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "uzma-seed-env-"));
  const filePath = path.join(directory, ".env.local");
  writeFileSync(filePath, contents);
  return { directory, filePath };
}
type FakeClient = {
  query: (
    sql: string,
    values?: unknown[]
  ) => Promise<{ rows: Array<{ id?: string }> }>;
};

describe("local demo seeder Auth lifecycle", () => {
  it("loads the local env file while preserving explicit shell values", () => {
    const temp = createTempEnvFile(
      "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321\nFROM_FILE=yes\n"
    );

    try {
      const loaded = loadLocalEnvironment(
        { FROM_SHELL: "yes" },
        temp.filePath
      );

      expect(loaded.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
      expect(loaded.FROM_FILE).toBe("yes");
      expect(loaded.FROM_SHELL).toBe("yes");
    } finally {
      rmSync(temp.directory, { recursive: true, force: true });
    }
  });
  it("creates confirmed guru users from fixture definitions", async () => {
    const createUser = vi.fn(async ({ email, user_metadata }) => ({
      data: {
        user: {
          id: `id-${email}`,
          email,
          user_metadata,
        },
      },
      error: null,
    }));
    const adminClient = {
      auth: { admin: { createUser, deleteUser: vi.fn() } },
    };

    const users = await createGuruUsers(adminClient, GURU_FIXTURES, {
      password: "local-only-password",
    });

    expect(users).toHaveLength(7);
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: GURU_FIXTURES[0].email,
        password: "local-only-password",
        email_confirm: true,
        user_metadata: expect.objectContaining({ role: "guru" }),
      })
    );
  });

  it("creates or updates the local admin fixture without trusting role metadata", async () => {
    const createUser = vi.fn(async ({ email, user_metadata }) => ({
      data: {
        user: {
          id: `id-${email}`,
          email,
          user_metadata,
        },
      },
      error: null,
    }));
    const adminClient = {
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
          createUser,
          updateUserById: vi.fn(),
        },
      },
    };

    const user = await ensureAdminUser(adminClient, ADMIN_FIXTURE, {
      password: "local-admin-password",
    });

    expect(user).toMatchObject({
      email: ADMIN_FIXTURE.email,
      fullName: ADMIN_FIXTURE.fullName,
      password: "local-admin-password",
      created: true,
    });
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: ADMIN_FIXTURE.email,
        password: "local-admin-password",
        email_confirm: true,
        user_metadata: expect.objectContaining({ role: "admin" }),
      })
    );
  });

  it("deletes only users created by the current run after partial failure", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    const adminClient = {
      auth: {
        admin: {
          createUser: vi
            .fn()
            .mockResolvedValueOnce({ data: { user: { id: "created-1" } }, error: null })
            .mockRejectedValueOnce(new Error("Auth unavailable")),
          deleteUser,
        },
      },
    };

    await expect(
      createGuruUsers(adminClient, GURU_FIXTURES.slice(0, 2), {
        password: "local-only-password",
      })
    ).rejects.toThrow("Auth unavailable");

    expect(deleteUser).toHaveBeenCalledTimes(1);
    expect(deleteUser).toHaveBeenCalledWith("created-1");
  });

  it("does not write a credential manifest when fixture SQL fails", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    const createUser = vi.fn(async ({ email }) => ({
      data: { user: { id: `id-${email}`, email } },
      error: null,
    }));
    const writeManifest = vi.fn();
    let transactionCount = 0;

    await expect(
      seedLocalDemo(
        {
          NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
          NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: "unused",
          SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
          SUPABASE_DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
        },
        {
          createAdminClient: () => ({ auth: { admin: { createUser, deleteUser } } }),
          ensureAdminUser: vi.fn().mockResolvedValue({
            id: "admin-id",
            email: ADMIN_FIXTURE.email,
            fullName: ADMIN_FIXTURE.fullName,
            password: "local-admin-password",
            created: true,
          }),
          withPostgresTransaction: async (
            _url: string,
            callback: (client: FakeClient) => Promise<unknown>
          ): Promise<unknown> => {
            transactionCount += 1;
            if (transactionCount === 1) {
              return callback({
                query: vi.fn(async () => ({ rows: [{ id: "admin-id" }] })),
              });
            }
            return callback({
              query: vi.fn(async () => {
                throw new Error("fixture SQL failed");
              }),
            });
          },
          cleanupSql: "cleanup SQL",
          fixtureSql: "fixture SQL",
          writeManifest,
        }
      )
    ).rejects.toThrow("fixture SQL failed");

    expect(writeManifest).not.toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalledTimes(8);
  });

  it("rejects local seeding when the target guard fails", async () => {
    const createAdminClient = vi.fn();

    await expect(
      seedLocalDemo(
        {
          NEXT_PUBLIC_SUPABASE_URL: "https://prod.example.com",
          SUPABASE_DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
          SUPABASE_SERVICE_ROLE_KEY: "local-service-role",
        },
        { createAdminClient }
      )
    ).rejects.toThrow(/local/i);

    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
