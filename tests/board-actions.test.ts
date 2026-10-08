import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  createScheduleClass, 
  createSchedulePlacement,
  removeScheduleClass,
  removeSchedulePlacement
} from "@/app/admin/draft/board-actions";

vi.mock("@/lib/auth", () => ({
  requireAdminAction: vi.fn().mockResolvedValue({ user: { id: "user-123" }, profile: { role: "admin" } })
}));

vi.mock("@/lib/board", () => ({
  insertScheduleClass: vi.fn().mockResolvedValue({ id: "inserted-id" }),
  insertSchedulePlacement: vi.fn().mockResolvedValue({ id: "inserted-id" }),
  deleteScheduleClass: vi.fn().mockResolvedValue({ error: null }),
  deleteSchedulePlacement: vi.fn().mockResolvedValue({ error: null }),
  getScheduleClassById: vi.fn().mockResolvedValue({ id: "class-1" }),
  verifyScheduleClass: vi.fn().mockResolvedValue({ id: "class-1", start_time: "08:00", end_time: "09:00" })
}));

describe("Board Actions (src/app/admin/draft/board-actions.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createScheduleClass succeeds", async () => {
    const result = await createScheduleClass({
      draft_id: "d1",
      shift_id: "s1",
      day_of_week: 1,
      teacher_id: "t1",
      variant_id: "v1",
      start_time: "09:00",
      end_time: "10:00"
    });
    expect(result).toHaveProperty("id", "inserted-id");
  });

  it("createSchedulePlacement succeeds", async () => {
    const result = await createSchedulePlacement({
      class_id: "c1",
      student_id: "st1",
    });
    expect(result).toHaveProperty("id", "inserted-id");
  });

  it("removeScheduleClass succeeds", async () => {
    await expect(removeScheduleClass("c1")).resolves.not.toThrow();
  });

  it("removeSchedulePlacement succeeds", async () => {
    await expect(removeSchedulePlacement("p1")).resolves.not.toThrow();
  });
});
