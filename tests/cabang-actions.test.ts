import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createBranch, updateBranch, toggleBranchActive } from "@/app/admin/cabang/actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

describe("Cabang Actions (src/app/admin/cabang/actions.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAdminMock = () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ 
        eq: vi.fn().mockReturnValue({ 
            eq: vi.fn().mockResolvedValue({ error: null }) 
        }) 
    });
    
    (createClient as unknown as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockImplementation((table) => {
        if (table === "profiles") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { role: "admin" } })
              })
            })
          };
        }
        return { insert: mockInsert, update: mockUpdate };
      }),
    });
  };

  it("createBranch fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await createBranch(formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("createBranch succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("id", "test-branch");
    formData.append("name", "Cabang Test");
    formData.append("address", "Jalan Test");
    await createBranch(formData);
  });

  it("updateBranch fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await updateBranch("test-branch", formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("updateBranch succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("name", "Cabang Test Updated");
    formData.append("address", "Jalan Test Updated");
    await updateBranch("test-branch", formData);
  });

  it("toggleBranchActive succeeds", async () => {
    setupAdminMock();
    await toggleBranchActive("test-branch", true);
  });
});
