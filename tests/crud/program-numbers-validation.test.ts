import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProgram, updateProgram } from "@/app/admin/program/actions";
vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "admin-1" }, profile: { role: "admin" } }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("Program Numbers Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createProgram rejects variant with zero or negative duration, frequency, or system", async () => {
    const formData = new FormData();
    formData.append("initials", "AHE");
    formData.append("name", "Anak Hebat");
    formData.append("type", "original");
    formData.append(
      "variants_json",
      JSON.stringify([
        {
          name: "Varian 1",
          duration: 30,
          frequency: 3,
          system: 0, // Capacity 0 is invalid!
        },
      ])
    );

    const res = await createProgram(formData);
    expect(res?.fieldErrors?.variants).toBe(
      "Durasi, frekuensi, dan kapasitas murid (sistem) harus berupa angka positif (> 0)."
    );
  });

  it("updateProgram rejects variant with zero or negative duration, frequency, or system", async () => {
    const formData = new FormData();
    formData.append("initials", "AHE");
    formData.append("name", "Anak Hebat");
    formData.append("type", "original");
    formData.append(
      "variants_json",
      JSON.stringify([
        {
          id: "var-1",
          name: "Varian 1",
          duration: -10, // Negative duration is invalid!
          frequency: 3,
          system: 2,
        },
      ])
    );

    const res = await updateProgram("prog-1", formData);
    expect(res?.fieldErrors?.variants).toBe(
      "Durasi, frekuensi, dan kapasitas murid (sistem) harus berupa angka positif (> 0)."
    );
  });
});
