import { describe, it, expect, vi, beforeEach } from "vitest";
import { insertGuruProfile, updateGuruProfile } from "@/lib/gurus";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Guru Provisioning & Junction Synchronization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes newly created Auth user if profile upsert fails during insertGuruProfile", async () => {
    const deleteUserMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    const mockAdminClient = {
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue({
            data: { user: { id: "new-user-123" } },
            error: null,
          }),
          deleteUser: deleteUserMock,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            upsert: vi.fn().mockResolvedValue({
              error: { message: "Database connection failed" },
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createAdminClient).mockReturnValue(mockAdminClient as never);

    await expect(
      insertGuruProfile({
        email: "guru@example.com",
        password: "password123",
        fullName: "Bu Siti",
        phone: "0812345678",
      })
    ).rejects.toThrow("Gagal mengisi data profil");

    // Compensating rollback MUST delete the created auth user
    expect(deleteUserMock).toHaveBeenCalledWith("new-user-123");
  });

  it("throws and propagates error when profile_branches insertion fails during updateGuruProfile", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }),
          };
        }
        if (table === "profile_branches") {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
            insert: vi.fn().mockResolvedValue({
              error: { message: "Foreign key violation on branch_id" },
            }),
          };
        }
        return {};
      }),
    };

    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateGuruProfile("guru-1", {
        fullName: "Pak Budi",
        branchIds: ["invalid-branch"],
        isActive: true,
      })
    ).rejects.toThrow("Gagal menetapkan cabang penugasan guru");
  });
});
