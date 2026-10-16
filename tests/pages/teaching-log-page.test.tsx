import { describe, expect, it, vi } from "vitest";
import { requireGuruPage } from "@/lib/auth";
import {
  getTeacherScheduleClassForLog,
  getTeacherTeachingSession,
} from "@/lib/teaching-logs";
import TeachingLogPage from "@/app/guru/mengajar/[id]/page";

vi.mock("@/lib/auth", () => ({
  requireGuruPage: vi.fn(),
}));

vi.mock("@/lib/teaching-logs", () => ({
  getTeacherScheduleClassForLog: vi.fn(),
  getTeacherTeachingSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("Teaching Log route access", () => {
  it("does not expose another teacher's class", async () => {
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: { id: "teacher-1", role: "guru" },
    } as never);
    vi.mocked(getTeacherScheduleClassForLog).mockResolvedValue(null);

    await expect(
      TeachingLogPage({
        params: Promise.resolve({ id: "other-class" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getTeacherTeachingSession).not.toHaveBeenCalled();
  });
});
