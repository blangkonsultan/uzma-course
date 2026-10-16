"use client";

import { useState, useTransition } from "react";
import { CalendarDays, CheckCircle2, Clock, MapPin, Send, Save } from "lucide-react";
import { saveTeachingSession, submitTeachingSession } from "@/app/guru/mengajar/actions";
import type {
  TeacherScheduleClassForLog,
  TeachingAttendanceStatus,
  TeachingSessionWithStudents,
  TeachingSessionStudentInput,
} from "@/lib/teaching-logs";

interface TeachingLogFormProps {
  classInfo: TeacherScheduleClassForLog;
  sessionDate: string;
  session: TeachingSessionWithStudents | null;
}

type StudentDraft = TeachingSessionStudentInput & {
  name: string;
  studentNumber: string | null;
  feeSnapshot: number;
};

const STATUS_OPTIONS: Array<{ value: TeachingAttendanceStatus; label: string }> = [
  { value: "present", label: "Hadir" },
  { value: "absent", label: "Tidak Hadir" },
  { value: "excused", label: "Izin" },
  { value: "cancelled", label: "Cancel" },
];

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function TeachingLogForm({
  classInfo,
  sessionDate,
  session,
}: TeachingLogFormProps) {
  const [students, setStudents] = useState<StudentDraft[]>(() =>
    classInfo.students.map((student) => {
      const saved = session?.students.find((row) => row.student_id === student.id);
      return {
        student_id: student.id,
        name: student.full_name,
        studentNumber: student.student_number,
        attendance_status: (saved?.attendance_status as TeachingAttendanceStatus | null) ?? null,
        achievement: saved?.achievement ?? null,
        teacher_note: saved?.teacher_note ?? null,
        feeSnapshot: saved?.teacher_fee_snapshot ?? classInfo.teacher_fee,
      };
    })
  );
  const [sessionId, setSessionId] = useState<string | null>(session?.id ?? null);
  const [isSubmitted, setIsSubmitted] = useState(session?.status === "submitted");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateStudent = (
    studentId: string,
    field: "attendance_status" | "achievement" | "teacher_note",
    value: string | null
  ) => {
    setStudents((current) =>
      current.map((student) =>
        student.student_id === studentId
          ? { ...student, [field]: value }
          : student
      )
    );
  };

  const buildInput = () => ({
    schedule_class_id: classInfo.id,
    session_date: sessionDate,
    students: students.map((student) => ({
      student_id: student.student_id,
      attendance_status: student.attendance_status,
      achievement: student.achievement,
      teacher_note: student.teacher_note,
    })),
  });

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveTeachingSession(buildInput());
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.data?.id) setSessionId(result.data.id);
      setSuccess("Draft kartu mengajar tersimpan.");
    });
  };

  const handleSubmit = () => {
    if (!sessionId) {
      setError("Simpan draft terlebih dahulu sebelum mengirim kartu.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await submitTeachingSession(sessionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsSubmitted(true);
      setSuccess("Kartu mengajar berhasil dikirim.");
    });
  };

  return (
    <form
      className="space-y-4 pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSubmitted) handleSave();
      }}
    >
      <div className="rounded-2xl bg-primary-700 p-4 text-white shadow-md sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-100">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{classInfo.branch_name}</span>
            </div>
            <h1 className="mt-2 text-lg font-bold leading-tight">Kartu Mengajar</h1>
            <p className="mt-1 text-xs text-primary-100">
              {classInfo.program_name} · {classInfo.variant_name}
            </p>
          </div>
          {isSubmitted && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold text-emerald-50">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Submitted
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-primary-100">
          <div className="rounded-xl bg-white/10 p-2.5">
            <div className="flex items-center gap-1 font-semibold">
              <CalendarDays className="h-3.5 w-3.5" />
              Tanggal
            </div>
            <input
              aria-label="Tanggal sesi"
              className="mt-1 w-full bg-transparent text-base font-bold text-white outline-none sm:text-sm"
              type="date"
              value={sessionDate}
              readOnly
              disabled={isSubmitted}
            />
          </div>
          <div className="rounded-xl bg-white/10 p-2.5">
            <div className="flex items-center gap-1 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              Jam
            </div>
            <p className="mt-1 font-bold text-white">
              {formatTime(classInfo.start_time)}–{formatTime(classInfo.end_time)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="space-y-3">
        {students.map((student) => (
          <section
            key={student.student_id}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-800">{student.name}</h2>
                {student.studentNumber && (
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {student.studentNumber}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right text-[11px] text-slate-500">
                <span className="block font-semibold">Fee Snapshot</span>
                <span className="font-bold text-slate-700">
                  Rp {student.feeSnapshot.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-700"
                htmlFor={`status-${student.student_id}`}
              >
                Status Kehadiran - {student.name}
              </label>
              <select
                id={`status-${student.student_id}`}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-sm"
                value={student.attendance_status ?? ""}
                disabled={isSubmitted || isPending}
                onChange={(event) =>
                  updateStudent(
                    student.student_id,
                    "attendance_status",
                    event.target.value || null
                  )
                }
              >
                <option value="">Pilih status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-700"
                htmlFor={`achievement-${student.student_id}`}
              >
                Capaian - {student.name}
              </label>
              <textarea
                id={`achievement-${student.student_id}`}
                aria-label={`Capaian - ${student.name}`}
                className="min-h-20 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-base text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-sm"
                value={student.achievement ?? ""}
                readOnly={isSubmitted}
                disabled={isPending}
                onChange={(event) =>
                  updateStudent(student.student_id, "achievement", event.target.value || null)
                }
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-semibold text-slate-700"
                htmlFor={`note-${student.student_id}`}
              >
                Catatan guru - {student.name}
              </label>
              <textarea
                id={`note-${student.student_id}`}
                aria-label={`Catatan guru - ${student.name}`}
                className="min-h-20 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-base text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:text-sm"
                value={student.teacher_note ?? ""}
                readOnly={isSubmitted}
                disabled={isPending}
                onChange={(event) =>
                  updateStudent(student.student_id, "teacher_note", event.target.value || null)
                }
              />
            </div>
          </section>
        ))}
      </div>

      {!isSubmitted && (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-2 border-t border-slate-200 bg-slate-50/95 px-1 pb-1 pt-3 backdrop-blur sm:flex-row">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button
            type="button"
            disabled={isPending || !sessionId}
            onClick={handleSubmit}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-3 text-sm font-bold text-primary-700 shadow-sm transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Kirim Kartu
          </button>
        </div>
      )}
    </form>
  );
}
