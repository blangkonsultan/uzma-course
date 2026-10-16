import { describe, expect, it, vi } from "vitest";
import { requireGuruPage } from "@/lib/auth";
import {
  getTeacherScheduleClassForLog,
  getTeacherTeachingSession,
} from "@/lib/teaching-logs";
import type { TeacherScheduleClassForLog } from "@/lib/teaching-logs";
import TeachingLogPage from "@/app/guru/mengajar/[id]/page";

vi.mock("@/lib/auth", () => ({
  requireGuruPage: vi.fn(),
}));

vi.mock("@/lib/teaching-logs", () => ({
  getTeacherScheduleClassForLog: vi.fn(),
  getTeacherTeachingSession: vi.fn(),
  getTodayTeachingLogDate: vi.fn(() => "2026-10-15"),
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
  it("falls back to a safe date for an invalid query date", async () => {
    const classInfo: TeacherScheduleClassForLog = {
      id: "class-1",
      day_of_week: 3,
      start_time: "09:00:00",
      end_time: "09:30:00",
      branch_name: "Cabang",
      shift_name: "Pagi",
      program_name: "AHE",
      variant_name: "Reguler",
      teacher_fee: 3000,
      students: [],
    };
    vi.mocked(requireGuruPage).mockResolvedValue({
      profile: { id: "teacher-1", role: "guru" },
    } as never);
    vi.mocked(getTeacherScheduleClassForLog).mockResolvedValue(classInfo);
    vi.mocked(getTeacherTeachingSession).mockResolvedValue(null);

    await expect(
      TeachingLogPage({
        params: Promise.resolve({ id: "class-1" }),
        searchParams: Promise.resolve({ date: "invalid" }),
      })
    ).resolves.toBeDefined();
    expect(getTeacherTeachingSession).toHaveBeenCalledWith(
      "teacher-1",
      "class-1",
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
    );
  });
});
