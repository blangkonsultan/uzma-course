import { describe, expect, it } from "vitest";
import {
  validateTeachingSessionInput,
  type SaveTeacherTeachingSessionInput,
} from "@/lib/teaching-logs";

const baseInput: SaveTeacherTeachingSessionInput = {
  schedule_class_id: "class-1",
  session_date: "2026-10-14",
  students: [
    {
      student_id: "student-1",
      attendance_status: "present",
      achievement: "Membaca suku kata",
      teacher_note: "Perlu latihan mandiri.",
    },
  ],
};

describe("Teaching Log input validation", () => {
  it("accepts a matching past WIB date for a draft", () => {
    expect(
      validateTeachingSessionInput(baseInput, 3, "2026-10-15", "draft")
    ).toEqual({});
  });

  it("rejects a future WIB date", () => {
    const result = validateTeachingSessionInput(
      { ...baseInput, session_date: "2026-10-16" },
      3,
      "2026-10-15",
      "draft"
    );

    expect(result).toEqual({
      error: "Tanggal sesi tidak boleh berada di masa depan.",
    });
  });

  it("rejects a weekday mismatch", () => {
    const result = validateTeachingSessionInput(
      { ...baseInput, session_date: "2026-10-13" },
      3,
      "2026-10-15",
      "draft"
    );

    expect(result).toEqual({
      error: "Tanggal sesi tidak sesuai hari jadwal kelas.",
    });
  });

  it("rejects duplicate student IDs", () => {
    const result = validateTeachingSessionInput(
      {
        ...baseInput,
        students: [baseInput.students[0], { ...baseInput.students[0] }],
      },
      3,
      "2026-10-15",
      "draft"
    );

    expect(result).toEqual({
      error: "Daftar murid tidak boleh berisi duplikat.",
    });
  });

  it("rejects malformed attendance statuses", () => {
    const result = validateTeachingSessionInput(
      {
        ...baseInput,
        students: [{ ...baseInput.students[0], attendance_status: "late" as never }],
      },
      3,
      "2026-10-15",
      "draft"
    );

    expect(result).toEqual({
      error: "Status kehadiran murid tidak valid.",
    });
  });

  it("allows incomplete status in drafts but requires all statuses on submit", () => {
    const draftInput = {
      ...baseInput,
      students: [{ ...baseInput.students[0], attendance_status: null }],
    };

    expect(
      validateTeachingSessionInput(draftInput, 3, "2026-10-15", "draft")
    ).toEqual({});
    expect(
      validateTeachingSessionInput(draftInput, 3, "2026-10-15", "submit")
    ).toEqual({
      error: "Status semua murid wajib diisi sebelum mengirim kartu.",
    });
  });
});
