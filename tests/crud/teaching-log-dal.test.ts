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

function mockOrderedRange(range: ReturnType<typeof vi.fn>) {
  const chain = {
    order: vi.fn(),
    range,
  };
  chain.order.mockReturnValue(chain);
  return chain;
}

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
      schedule_drafts: { status: "archived", branches: { name: "Cabang" } },
      branch_shifts: { name: "Pagi" },
      program_variants: {
        name: "Reguler historis nonaktif",
        teacher_fee: 3000,
        programs: { id: "prog-1", name: "AHE historis nonaktif" },
      },
    };

    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue({ data: archivedClass, error: null }),
    };

    const rpc = vi.fn().mockImplementation((fn: string) => {
      if (fn === "get_teacher_class_students") {
        return mockOrderedRange(
          vi.fn().mockResolvedValue({
            data: [{ class_id: "class-1", student_id: "student-1", full_name: "Murid", student_number: "01001" }],
            error: null,
          })
        );
      }
      throw new Error(`Unexpected RPC: ${fn}`);
    });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => query),
      rpc,
    } as never);

    const result = await getTeacherScheduleClassForLog("teacher-1", "class-1");

    expect(result?.branch_name).toBe("Cabang");
    expect(result).toMatchObject({
      program_name: "AHE historis nonaktif",
      variant_name: "Reguler historis nonaktif",
      teacher_fee: 3000,
    });
    expect(result?.students[0].full_name).toBe("Murid");
    expect(result?.students[0].overdue_spp).toBeNull();
    // Archived draft must NOT call overdue SPP RPC
    expect(rpc).not.toHaveBeenCalledWith("get_teacher_overdue_spp", expect.anything());
  });

  it("attaches overdue SPP details to class students when overdue invoices exist in active draft", async () => {
    const rawClassData = {
      id: "class-1",
      day_of_week: 3,
      start_time: "09:00:00",
      end_time: "09:30:00",
      schedule_drafts: { status: "active", branches: { name: "Cabang" } },
      branch_shifts: { name: "Pagi" },
      program_variants: {
        name: "Reguler",
        teacher_fee: 3000,
        programs: { id: "prog-1", name: "AHE" },
      },
    };

    const classQuery = {
      select: vi.fn(() => classQuery),
      eq: vi.fn(() => classQuery),
      maybeSingle: vi.fn().mockResolvedValue({ data: rawClassData, error: null }),
    };

    const rpc = vi.fn().mockImplementation((fn: string) => {
      if (fn === "get_teacher_class_students") {
        return mockOrderedRange(
          vi.fn().mockResolvedValue({
            data: [
              { class_id: "class-1", student_id: "student-1", full_name: "Murid Satu", student_number: "01001" },
              { class_id: "class-1", student_id: "student-2", full_name: "Murid Dua", student_number: "01002" },
            ],
            error: null,
          })
        );
      }
      if (fn === "get_teacher_overdue_spp") {
        return mockOrderedRange(
          vi.fn().mockResolvedValue({
            data: [
              {
                class_id: "class-1",
                student_id: "student-1",
                program_id: "prog-1",
                due_date: "2026-09-10",
                total_amount: 350000,
                invoice_count: 2,
              },
            ],
            error: null,
          })
        );
      }
      throw new Error(`Unexpected RPC: ${fn}`);
    });

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => classQuery),
      rpc,
    } as never);

    const result = await getTeacherScheduleClassForLog("teacher-1", "class-1");

    expect(result).not.toBeNull();
    expect(result?.students[0].overdue_spp).toEqual({
      due_date: "2026-09-10",
      total_amount: 350000,
      invoice_count: 2,
    });
    expect(result?.students[1].overdue_spp).toBeNull();
  });

  it("rejects an unreadable historical roster instead of showing an empty teaching card", async () => {
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: "class-1", day_of_week: 3, start_time: "09:00:00", end_time: "09:30:00",
          schedule_drafts: { status: "archived", branches: { name: "Cabang Sekunder" } },
          branch_shifts: { name: "Pagi" },
          program_variants: {
            name: "Reguler historis", teacher_fee: 3000,
            programs: { id: "prog-1", name: "AHE historis" },
          },
        },
        error: null,
      }),
    };
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => query),
      rpc: vi.fn(() =>
        mockOrderedRange(
          vi.fn().mockResolvedValue({ data: null, error: { message: "historical roster denied" } })
        )
      ),
    } as never);

    await expect(getTeacherScheduleClassForLog("teacher-1", "class-1")).rejects.toThrow(
      "Gagal membaca daftar murid kelas: historical roster denied"
    );
  });
});
