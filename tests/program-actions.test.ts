import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createProgram, updateProgram, toggleProgramActive } from "@/app/admin/program/actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

describe("Program Actions (src/app/admin/program/actions.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAdminMock = () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ 
        eq: vi.fn().mockResolvedValue({ error: null }) 
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

  it("createProgram fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await createProgram(formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("createProgram succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("name", "Program Test");
    formData.append("initials", "PT");
    formData.append("type", "original");
    formData.append("description", "Desc");
    formData.append("age_range", "7-12");
    
    await createProgram(formData);
  });

  it("updateProgram fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await updateProgram("p-1", formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("updateProgram succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("name", "Program Test Update");
    formData.append("description", "Desc");
    formData.append("age_range", "7-12");
    await updateProgram("p-1", formData);
  });

  it("toggleProgramActive succeeds", async () => {
    setupAdminMock();
    await toggleProgramActive("p-1", true);
  });
});
