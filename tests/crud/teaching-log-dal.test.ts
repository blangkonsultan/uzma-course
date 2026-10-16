import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import {
  getTeacherScheduleClassForLog,
  getTeacherTeachingSession,
  saveTeacherTeachingSession,
  submitTeacherTeachingSession,
} from "@/lib/teaching-logs";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const input = {
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

describe("Teaching Log DAL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps draft-save RPC errors to an explicit domain error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "duplicate session" },
    });
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);

    await expect(saveTeacherTeachingSession("teacher-1", input)).rejects.toThrow(
      "Gagal menyimpan kartu mengajar: duplicate session"
    );
  });

  it("maps submit RPC errors to an explicit domain error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "already submitted" },
    });
    vi.mocked(createClient).mockResolvedValue({ rpc } as never);

    await expect(
      submitTeacherTeachingSession("teacher-1", "session-1")
    ).rejects.toThrow("Gagal mengirim kartu mengajar: already submitted");
  });

  it("returns null when a teacher has no saved session for the date", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => query) } as never);

    await expect(
      getTeacherTeachingSession("teacher-1", "class-1", "2026-10-14")
    ).resolves.toBeNull();
  });

  it("returns null when the class is not owned by the teacher", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => query) } as never);

    await expect(
      getTeacherScheduleClassForLog("teacher-1", "other-class")
    ).resolves.toBeNull();
  });
  it("keeps submitted history readable when the source draft is archived", async () => {
    const archivedClass = {
      id: "class-1",
      day_of_week: 3,
      start_time: "09:00:00",
      end_time: "09:30:00",
      schedule_drafts: { branches: { name: "Cabang" } },
      branch_shifts: { name: "Pagi" },
      program_variants: {
        name: "Reguler",
        teacher_fee: 3000,
        programs: { name: "AHE" },
      },
      schedule_placements: [
        { students: { id: "student-1", full_name: "Murid", student_number: "01001" } },
      ],
    };
    const archivedDraftFilter = {
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn((field: string) =>
        field === "schedule_drafts.status" ? archivedDraftFilter : query
      ),
      maybeSingle: vi.fn().mockResolvedValue({ data: archivedClass, error: null }),
    };
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn(() => query) } as never);

    const result = await getTeacherScheduleClassForLog("teacher-1", "class-1");

    expect(result?.branch_name).toBe("Cabang");
  });
});
