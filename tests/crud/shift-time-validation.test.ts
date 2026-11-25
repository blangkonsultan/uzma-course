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

  it("updateShift rejects start_time >= end_time when one has seconds format", async () => {
    const formData = new FormData();
    formData.append("name", "Shift Pagi");
    formData.append("start_time", "08:00:00");
    formData.append("end_time", "08:00"); // Numeric equality!

    const res = await updateShift("shift-1", formData);
    expect(res?.fieldErrors?.end_time).toBe("Jam selesai harus lebih akhir dari jam mulai.");
  });

  it("updateBranchShift rejects inverted interval with loaded opposite bound", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "shift-1", start_time: "10:00:00", end_time: "12:00:00" },
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    // Setting end_time to 09:00 with existing start_time 10:00:00 should throw
    await expect(
      updateBranchShift("shift-1", {
        end_time: "09:00",
      })
    ).rejects.toThrow("Jam selesai harus lebih akhir dari jam mulai.");
  });

  it("updateShift returns fieldErrors for both start_time and end_time on containment conflict", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            or: vi.fn().mockResolvedValue({
              data: [{ id: "class-1", start_time: "07:00:00", end_time: "08:30:00" }],
              error: null,
            }),
          }),
        }),
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    const formData = new FormData();
    formData.append("name", "Shift Pagi");
    formData.append("start_time", "08:00");
    formData.append("end_time", "09:00");

    const res = await updateShift("shift-1", formData);
    expect(res?.error).toContain("Ada kelas di luar rentang jam baru");
    expect(res?.fieldErrors?.start_time).toBe("Ada kelas yang berada di luar rentang jam baru.");
    expect(res?.fieldErrors?.end_time).toBe("Ada kelas yang berada di luar rentang jam baru.");
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
    ).rejects.toThrow("Ada kelas di luar rentang jam baru");
  });

  it.each([
    { start_time: "25:99", end_time: "09:00", expectedField: "start_time" },
    { start_time: "08:00", end_time: "08:00,id.is.null", expectedField: "end_time" },
    { start_time: "invalid", end_time: "09:00", expectedField: "start_time" },
  ])(
    "createShift and updateShift reject malformed time input ($start_time - $end_time)",
    async ({ start_time, end_time, expectedField }) => {
      const createData = new FormData();
      createData.append("branch_id", "sumokembangsri");
      createData.append("name", "Shift Pagi");
      createData.append("start_time", start_time);
      createData.append("end_time", end_time);

      const createRes = await createShift(createData);
      expect(createRes?.fieldErrors?.[expectedField]).toContain("Format jam");

      const updateData = new FormData();
      updateData.append("name", "Shift Pagi");
      updateData.append("start_time", start_time);
      updateData.append("end_time", end_time);

      const updateRes = await updateShift("shift-1", updateData);
      expect(updateRes?.fieldErrors?.[expectedField]).toContain("Format jam");
      expect(createClient).not.toHaveBeenCalled();
    }
  );

  it("updateBranchShift rejects malformed time strings before querying schedule_classes", async () => {
    const fromMock = vi.fn();
    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as never);

    await expect(
      updateBranchShift("shift-1", {
        start_time: "08:00,id.is.null",
        end_time: "10:00",
      })
    ).rejects.toThrow("Format jam shift tidak valid.");

    expect(fromMock).not.toHaveBeenCalled();
  });

  it("class_lookup_failure_does_not_update_shift", async () => {
    const updateMock = vi.fn();
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: "service unavailable" },
                }),
              }),
            }),
          };
        }
        return { update: updateMock };
      }),
    };
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

    await expect(
      updateBranchShift("shift-1", {
        start_time: "08:00",
        end_time: "10:00",
      })
    ).rejects.toThrow("Gagal memeriksa jadwal kelas shift: service unavailable");

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("name_only_change_does_not_restrict_times", async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn((table: string) => {
      if (table === "branch_shifts") {
        return { update: updateMock };
      }
      throw new Error(`Unexpected table query: ${table}`);
    });
    vi.mocked(createClient).mockResolvedValue({ from: fromMock } as never);

    await expect(
      updateBranchShift("shift-1", { name: "Shift Pagi Baru" })
    ).resolves.toBeUndefined();

    expect(fromMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith("branch_shifts");
    expect(updateMock).toHaveBeenCalledWith({ name: "Shift Pagi Baru" });
    expect(eqMock).toHaveBeenCalledWith("id", "shift-1");
  });

  it("matching_hhmm_and_hhmmss_not_false_conflicts", async () => {
    const orMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const updateEqMock = vi.fn().mockResolvedValue({ error: null });
    const updateMock = vi.fn().mockReturnValue({ eq: updateEqMock });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "schedule_classes") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({ or: orMock }),
            }),
          };
        }
        return { update: updateMock };
      }),
    } as never);

    await expect(
      updateBranchShift("shift-1", {
        name: "Shift Pagi",
        start_time: "08:00:00",
        end_time: "08:30",
      })
    ).resolves.toBeUndefined();

    expect(orMock).toHaveBeenCalledWith("start_time.lt.08:00:00,end_time.gt.08:30");
    expect(updateMock).toHaveBeenCalledWith({
      name: "Shift Pagi",
      start_time: "08:00:00",
      end_time: "08:30",
    });
  });
});
