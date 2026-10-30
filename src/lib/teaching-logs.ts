import { createClient } from "@/lib/supabase/server";
import { getWIBDateBounds } from "@/lib/attendances";
import type { Database } from "@/types/database";
import type { StudentOverdueSppInfo } from "./teacher-schedule";
export type TeachingAttendanceStatus =
  | "present"
  | "absent"
  | "excused"
  | "cancelled";

export type TeachingSessionStudentInput = {
  student_id: string;
  attendance_status: TeachingAttendanceStatus | null;
  achievement: string | null;
  teacher_note: string | null;
};

export type SaveTeacherTeachingSessionInput = {
  schedule_class_id: string;
  session_date: string;
  students: TeachingSessionStudentInput[];
};

export type TeachingSessionRow =
  Database["public"]["Tables"]["teaching_sessions"]["Row"];
export type TeachingSessionStudentRow =
  Database["public"]["Tables"]["teaching_session_students"]["Row"];

export interface TeacherScheduleStudent {
  id: string;
  full_name: string;
  student_number: string | null;
  overdue_spp?: StudentOverdueSppInfo | null;
}

export interface TeacherScheduleClassForLog {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  branch_name: string;
  shift_name: string;
  program_name: string;
  variant_name: string;
  teacher_fee: number;
  students: TeacherScheduleStudent[];
}

export interface TeachingSessionWithStudents extends TeachingSessionRow {
  students: TeachingSessionStudentRow[];
}

const VALID_TEACHING_ATTENDANCE_STATUS: Record<TeachingAttendanceStatus, true> = {
  present: true,
  absent: true,
  excused: true,
  cancelled: true,
};

export function validateTeachingSessionInput(
  input: SaveTeacherTeachingSessionInput,
  expectedDayOfWeek: number,
  todayWib: string,
  mode: "draft" | "submit" = "draft"
): { error?: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.session_date)) {
    return { error: "Format tanggal sesi tidak valid." };
  }

  if (input.session_date > todayWib) {
    return { error: "Tanggal sesi tidak boleh berada di masa depan." };
  }

  const sessionDate = new Date(`${input.session_date}T00:00:00Z`);
  if (Number.isNaN(sessionDate.getTime())) {
    return { error: "Format tanggal sesi tidak valid." };
  }

  const isoDay = sessionDate.getUTCDay() === 0 ? 7 : sessionDate.getUTCDay();
  if (isoDay !== expectedDayOfWeek) {
    return { error: "Tanggal sesi tidak sesuai hari jadwal kelas." };
  }

  const seenStudentIds = new Set<string>();
  for (const student of input.students) {
    if (seenStudentIds.has(student.student_id)) {
      return { error: "Daftar murid tidak boleh berisi duplikat." };
    }
    seenStudentIds.add(student.student_id);

    const status = student.attendance_status as string | null;
    if (status !== null && !(status in VALID_TEACHING_ATTENDANCE_STATUS)) {
      return { error: "Status kehadiran murid tidak valid." };
    }
    if (mode === "submit" && status === null) {
      return { error: "Status semua murid wajib diisi sebelum mengirim kartu." };
    }
  }

  return {};
}

export async function getTeacherScheduleClassForLog(
  teacherId: string,
  scheduleClassId: string
): Promise<TeacherScheduleClassForLog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_classes")
    .select(
      `
        id,
        day_of_week,
        start_time,
        end_time,
        schedule_drafts!inner(status, branches(name)),
        branch_shifts(id, name),
        program_variants(id, name, teacher_fee, programs(id, name)),
        schedule_placements(student_id, students(id, full_name, student_number))
      `
    )
    .eq("id", scheduleClassId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca jadwal kelas: ${error.message}`);
  }
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    schedule_drafts: { branches: { name: string } | null } | null;
    branch_shifts: { name: string } | null;
    program_variants: {
      name: string;
      teacher_fee: number;
      programs: { name: string } | null;
    } | null;
    schedule_placements: Array<{
      students: TeacherScheduleStudent | null;
    }>;
  };

  const rawStudents = (row.schedule_placements || [])
    .map((placement) => placement.students)
    .filter((student): student is TeacherScheduleStudent => student !== null);

  const studentIds = rawStudents.map((s) => s.id);
  const overdueByStudent = new Map<string, StudentOverdueSppInfo>();

  if (studentIds.length > 0) {
    const todayWib = getWIBDateBounds().dateString;
    const { data: invoices, error: invoiceError } = await supabase
      .from("student_invoices")
      .select("student_id, due_date, total_amount")
      .in("student_id", studentIds)
      .eq("status", "unpaid")
      .lt("due_date", todayWib);

    if (invoiceError) {
      console.warn("Gagal membaca status SPP jatuh tempo kelas mengajar:", invoiceError.message);
    } else if (invoices) {
      for (const inv of invoices) {
        const existing = overdueByStudent.get(inv.student_id);
        const amount = Number(inv.total_amount) || 0;
        if (!existing) {
          overdueByStudent.set(inv.student_id, {
            due_date: inv.due_date,
            total_amount: amount,
            invoice_count: 1,
          });
        } else {
          existing.total_amount += amount;
          existing.invoice_count += 1;
          if (inv.due_date < existing.due_date) {
            existing.due_date = inv.due_date;
          }
        }
      }
    }
  }

  const enrichedStudents: TeacherScheduleStudent[] = rawStudents.map((s) => ({
    ...s,
    overdue_spp: overdueByStudent.get(s.id) ?? null,
  }));

  return {
    id: row.id,
    day_of_week: row.day_of_week,
    start_time: row.start_time,
    end_time: row.end_time,
    branch_name: row.schedule_drafts?.branches?.name || "Cabang",
    shift_name: row.branch_shifts?.name || "-",
    program_name: row.program_variants?.programs?.name || "Program",
    variant_name: row.program_variants?.name || "-",
    teacher_fee: row.program_variants?.teacher_fee || 0,
    students: enrichedStudents,
  };
}

export async function getTeacherTeachingSession(
  teacherId: string,
  scheduleClassId: string,
  sessionDate: string
): Promise<TeachingSessionWithStudents | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teaching_sessions")
    .select("*, teaching_session_students(*)")
    .eq("teacher_id", teacherId)
    .eq("schedule_class_id", scheduleClassId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca kartu mengajar: ${error.message}`);
  }
  if (!data) return null;

  const row = data as unknown as TeachingSessionRow & {
    teaching_session_students: TeachingSessionStudentRow[];
  };
  return {
    ...row,
    students: row.teaching_session_students || [],
  };
}

export async function saveTeacherTeachingSession(
  _teacherId: string,
  input: SaveTeacherTeachingSessionInput
): Promise<TeachingSessionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_teaching_session", {
    p_schedule_class_id: input.schedule_class_id,
    p_session_date: input.session_date,
    p_students: input.students,
  });

  if (error) {
    throw new Error(`Gagal menyimpan kartu mengajar: ${error.message}`);
  }
  return data as TeachingSessionRow;
}

export async function submitTeacherTeachingSession(
  _teacherId: string,
  sessionId: string
): Promise<TeachingSessionRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_teaching_session", {
    p_session_id: sessionId,
  });

  if (error) {
    throw new Error(`Gagal mengirim kartu mengajar: ${error.message}`);
  }
  return data as TeachingSessionRow;
}

export function getTodayTeachingLogDate() {
  return getWIBDateBounds().dateString;
}
