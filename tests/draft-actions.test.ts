import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createDraft, updateDraft, setDraftActive } from "@/app/admin/draft/actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

describe("Draft Actions (src/app/admin/draft/actions.ts)", () => {
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

  it("createDraft fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await createDraft(formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("createDraft succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("branch_id", "krian");
    formData.append("name", "Draf A");
    await createDraft(formData);
  });

  it("updateDraft fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await updateDraft("d-1", formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("updateDraft succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("name", "Draf B");
    await updateDraft("d-1", formData);
  });

  it("setDraftActive succeeds", async () => {
    setupAdminMock();
    await setDraftActive("d-1", "krian");
  });
});
