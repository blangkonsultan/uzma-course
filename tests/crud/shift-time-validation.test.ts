import { describe, it, expect, vi, beforeEach } from "vitest";
import { createShift, updateShift } from "@/app/admin/shift/actions";
import { updateBranchShift } from "@/lib/shifts";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Shift Time Range Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createShift rejects start_time >= end_time", async () => {
    const formData = new FormData();
    formData.append("branch_id", "sumokembangsri");
    formData.append("name", "Shift Sore");
    formData.append("start_time", "17:00");
    formData.append("end_time", "09:00"); // Inverted!

    const res = await createShift(formData);
    expect(res?.fieldErrors?.end_time).toBe("Jam selesai harus lebih akhir dari jam mulai.");
  });

  it("updateShift rejects start_time >= end_time", async () => {
    const formData = new FormData();
    formData.append("name", "Shift Pagi");
    formData.append("start_time", "12:00");
    formData.append("end_time", "12:00"); // Equal!

    const res = await updateShift("shift-1", formData);
    expect(res?.fieldErrors?.end_time).toBe("Jam selesai harus lebih akhir dari jam mulai.");
  });

  it("updateBranchShift rejects narrowing shift hours when existing classes are stranded", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockResolvedValue({
              data: [{ id: "class-1", start_time: "10:00:00", end_time: "11:00:00" }],
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateBranchShift("shift-1", {
        start_time: "09:00",
        end_time: "10:00", // Narrowed so 10:00-11:00 class is stranded!
      })
    ).rejects.toThrow("Jam shift tidak dapat dipersempit");
  });
});
