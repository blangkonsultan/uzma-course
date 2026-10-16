import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TeachingLogForm } from "@/components/guru/teaching-log-form";
import type {
  TeacherScheduleClassForLog,
  TeachingSessionWithStudents,
} from "@/lib/teaching-logs";

const routerMock = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
}));

vi.mock("@/app/guru/mengajar/actions", () => ({
  saveTeachingSession: vi.fn(),
  submitTeachingSession: vi.fn(),
}));

import {
  saveTeachingSession,
  submitTeachingSession,
} from "@/app/guru/mengajar/actions";

const classInfo: TeacherScheduleClassForLog = {
  id: "class-1",
  day_of_week: 3,
  start_time: "09:00:00",
  end_time: "09:30:00",
  branch_name: "Cabang Sumokembangsri",
  shift_name: "Pagi",
  program_name: "Les Baca AHE",
  variant_name: "Reguler",
  teacher_fee: 3000,
  students: [
    { id: "student-1", full_name: "Murid Satu", student_number: "01001" },
    { id: "student-2", full_name: "Murid Dua", student_number: "01002" },
  ],
};

const submittedSession: TeachingSessionWithStudents = {
  id: "session-1",
  schedule_class_id: "class-1",
  teacher_id: "teacher-1",
  branch_id: "sumokembangsri",
  shift_id: "shift-1",
  variant_id: "variant-1",
  session_date: "2026-10-14",
  scheduled_start_time: "09:00:00",
  scheduled_end_time: "09:30:00",
  status: "submitted",
  submitted_at: "2026-10-14T03:00:00.000Z",
  created_at: "2026-10-14T02:00:00.000Z",
  updated_at: "2026-10-14T03:00:00.000Z",
  students: [
    {
      id: "row-1",
      session_id: "session-1",
      student_id: "student-1",
      attendance_status: "present",
      achievement: "Membaca suku kata",
      teacher_note: "Bagus",
      teacher_fee_snapshot: 3000,
      created_at: "2026-10-14T02:00:00.000Z",
      updated_at: "2026-10-14T02:00:00.000Z",
    },
    {
      id: "row-2",
      session_id: "session-1",
      student_id: "student-2",
      attendance_status: "absent",
      achievement: null,
      teacher_note: "Izin",
      teacher_fee_snapshot: 3000,
      created_at: "2026-10-14T02:00:00.000Z",
      updated_at: "2026-10-14T02:00:00.000Z",
    },
  ],
};

describe("TeachingLogForm", () => {
  it("renders one editable card per placed student", () => {
    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={null}
      />
    );

    expect(screen.getByText("Murid Satu")).toBeDefined();
    expect(screen.getByText("Murid Dua")).toBeDefined();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("allows selecting a historical session date", () => {
    routerMock.push.mockClear();
    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={null}
      />
    );

    fireEvent.change(screen.getByLabelText("Tanggal sesi"), {
      target: { value: "2026-10-07" },
    });

    expect(routerMock.push).toHaveBeenCalledWith(
      "/guru/mengajar/class-1?date=2026-10-07"
    );
  });

  it("keeps entered notes when draft save returns an error", async () => {
    vi.mocked(saveTeachingSession).mockResolvedValueOnce({
      error: "Gagal menyimpan kartu mengajar: jaringan bermasalah",
    });

    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={null}
      />
    );

    const noteInput = screen.getByLabelText("Catatan guru - Murid Satu");
    fireEvent.change(noteInput, { target: { value: "Latihan ulang besok" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Simpan Draft" }));
    });

    expect(screen.getByText(/jaringan bermasalah/i)).toBeDefined();
    expect((noteInput as HTMLTextAreaElement).value).toBe("Latihan ulang besok");
  });

  it("renders submitted sessions read-only", () => {
    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={submittedSession}
      />
    );

    expect(screen.getByText("Submitted")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Kirim Kartu" })).toBeNull();
    expect(screen.getAllByRole("combobox")[0].hasAttribute("disabled")).toBe(true);
    expect(screen.getByDisplayValue("Bagus").hasAttribute("readonly")).toBe(true);
  });

  it("submits a saved draft and locks the form", async () => {
    vi.mocked(saveTeachingSession).mockResolvedValue({
      data: { ...submittedSession, status: "draft", submitted_at: null },
    });
    vi.mocked(submitTeachingSession).mockResolvedValueOnce({
      data: submittedSession,
    });

    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={null}
      />
    );

    const statuses = screen.getAllByRole("combobox");
    fireEvent.change(statuses[0], { target: { value: "present" } });
    fireEvent.change(statuses[1], { target: { value: "absent" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Simpan Draft" }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Kirim Kartu" }));
    });

    expect(submitTeachingSession).toHaveBeenCalledWith("session-1");
    expect(screen.getByText("Submitted")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Kirim Kartu" })).toBeNull();
  });
  it("saves in-memory edits before submitting an existing draft", async () => {
    const draftSession = {
      ...submittedSession,
      status: "draft" as const,
      submitted_at: null,
    };
    vi.mocked(saveTeachingSession).mockResolvedValueOnce({
      data: draftSession,
    });
    vi.mocked(submitTeachingSession).mockResolvedValueOnce({
      data: submittedSession,
    });

    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={draftSession}
      />
    );

    fireEvent.change(screen.getByLabelText("Catatan guru - Murid Satu"), {
      target: { value: "Catatan terbaru sebelum submit" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Kirim Kartu" }));
    });

    expect(saveTeachingSession).toHaveBeenCalledWith(
      expect.objectContaining({
        students: expect.arrayContaining([
          expect.objectContaining({
            student_id: "student-1",
            teacher_note: "Catatan terbaru sebelum submit",
          }),
        ]),
      })
    );
    expect(submitTeachingSession).toHaveBeenCalledWith("session-1");
  });
  it("can save and submit a new card from the submit action", async () => {
    vi.mocked(saveTeachingSession).mockResolvedValueOnce({
      data: { ...submittedSession, status: "draft", submitted_at: null },
    });
    vi.mocked(submitTeachingSession).mockResolvedValueOnce({
      data: submittedSession,
    });

    render(
      <TeachingLogForm
        classInfo={classInfo}
        sessionDate="2026-10-14"
        session={null}
      />
    );

    const statuses = screen.getAllByRole("combobox");
    fireEvent.change(statuses[0], { target: { value: "present" } });
    fireEvent.change(statuses[1], { target: { value: "absent" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Kirim Kartu" }));
    });

    expect(saveTeachingSession).toHaveBeenCalled();
    expect(submitTeachingSession).toHaveBeenCalledWith("session-1");
    expect(screen.getByText("Submitted")).toBeDefined();
  });
});
