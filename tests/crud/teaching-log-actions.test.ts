import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireGuruAction } from "@/lib/auth";
import {
  getTeacherScheduleClassForLog,
  saveTeacherTeachingSession,
  validateTeachingSessionInput,
} from "@/lib/teaching-logs";
import {
  saveTeachingSession,
  submitTeachingSession,
} from "@/app/guru/mengajar/actions";

vi.mock("@/lib/auth", () => ({
  requireGuruAction: vi.fn(),
}));

vi.mock("@/lib/teaching-logs", () => ({
  getTeacherScheduleClassForLog: vi.fn(),
  saveTeacherTeachingSession: vi.fn(),
  submitTeacherTeachingSession: vi.fn(),
  validateTeachingSessionInput: vi.fn(),
}));

const validInput = {
  schedule_class_id: "class-1",
  session_date: "2026-10-14",
  students: [
    {
      student_id: "student-1",
      attendance_status: "present" as const,
      achievement: "Capaian",
      teacher_note: "Catatan",
    },
  ],
};

describe("Teaching Log guru actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed draft input before calling the DAL", async () => {
    vi.mocked(requireGuruAction).mockResolvedValue({
      user: { id: "teacher-1" },
      profile: { id: "teacher-1", role: "guru" },
    } as never);
    vi.mocked(getTeacherScheduleClassForLog).mockResolvedValue({
      day_of_week: 3,
    } as never);
    vi.mocked(validateTeachingSessionInput).mockReturnValue({
      error: "Tanggal sesi tidak boleh berada di masa depan.",
    });

    const result = await saveTeachingSession({
      ...validInput,
      session_date: "2026-10-16",
    });

    expect(result).toEqual({
      error: "Tanggal sesi tidak boleh berada di masa depan.",
    });
    expect(saveTeacherTeachingSession).not.toHaveBeenCalled();
  });

  it("propagates guru authorization failures", async () => {
    vi.mocked(requireGuruAction).mockRejectedValueOnce(
      new Error("Hanya guru yang memiliki izin untuk operasi ini.")
    );

    await expect(submitTeachingSession("session-1")).rejects.toThrow("Hanya guru");
  });
});
