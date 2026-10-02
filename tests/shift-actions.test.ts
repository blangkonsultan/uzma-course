import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { createShift, updateShift, toggleShiftActive } from "@/app/admin/shift/actions";
import { createClient } from "@/lib/supabase/server";

// Mock next cache/navigation
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Shift Actions (src/app/admin/shift/actions.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupAdminMock = () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    
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
        return {
          insert: mockInsert,
          update: mockUpdate,
        };
      }),
    });
  };

  it("createShift fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    // empty form
    const result = await createShift(formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("createShift succeeds with valid data", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("branch_id", "krian");
    formData.append("name", "Pagi");
    formData.append("start_time", "09:00");
    formData.append("end_time", "12:00");

    await createShift(formData);
    // Since it redirects on success, it throws or finishes (redirect is mocked)
    // We mainly care it doesn't return fieldErrors
  });

  it("updateShift fails on missing fields", async () => {
    setupAdminMock();
    const formData = new FormData();
    const result = await updateShift("shift-1", formData);
    expect(result).toHaveProperty("fieldErrors");
  });

  it("updateShift succeeds", async () => {
    setupAdminMock();
    const formData = new FormData();
    formData.append("name", "Sore");
    formData.append("start_time", "15:00");
    formData.append("end_time", "18:00");

    await updateShift("shift-1", formData);
  });

  it("toggleShiftActive succeeds", async () => {
    setupAdminMock();
    await toggleShiftActive("shift-1", true);
  });
});
