import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getWIBDateBounds } from "./attendances";
import { createAdminClient } from "./supabase/admin";

export interface StudentOverdueSppInfo {
  due_date: string;
  total_amount: number;
  invoice_count: number;
}

export interface TeacherScheduleStudentItem {
  id: string;
  full_name: string;
  student_number: string | null;
  overdue_spp?: StudentOverdueSppInfo | null;
}

export interface TeacherClassItem {
  id: string;
  branch_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  shift_name: string;
  program_name: string;
  variant_name: string;
  students: TeacherScheduleStudentItem[];
  overdue_students_count?: number;
  teaching_log_date?: string;
  teaching_log_status?: "draft" | "submitted" | null;
}

interface RawShift {
  id: string;
  name: string;
}

interface RawVariant {
  id: string;
  name: string;
  programs: {
    id: string;
    name: string;
  } | null;
}

interface RawPlacement {
  student_id: string;
  students: {
    id: string;
    full_name: string;
    student_number: string | null;
  } | null;
}

interface RawClassRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  shift_id: string;
  variant_id: string;
  schedule_drafts: {
    branches: { name: string } | null;
  } | null;
  branch_shifts: RawShift | null;
  program_variants: RawVariant | null;
  schedule_placements: RawPlacement[];
}

function getPreviousSessionDate(dayOfWeek: number) {
  const todayWib = getWIBDateBounds().dateString;
  const date = new Date(`${todayWib}T00:00:00Z`);
  const todayDay = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  const daysBack = (todayDay - dayOfWeek + 7) % 7;
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}
export async function getOverdueSppByStudentIds(
  supabase: SupabaseClient<Database>,
  studentIds: string[]
): Promise<Map<string, StudentOverdueSppInfo>> {
  const overdueMap = new Map<string, StudentOverdueSppInfo>();
  if (studentIds.length === 0) return overdueMap;

  const todayWib = getWIBDateBounds().dateString;
  const { data: invoices, error: invoiceError } = await supabase
    .from("student_invoices")
    .select("student_id, due_date, total_amount")
    .in("student_id", studentIds)
    .eq("status", "unpaid")
    .lt("due_date", todayWib);

  if (invoiceError) {
    console.warn("Gagal membaca status SPP jatuh tempo:", invoiceError.message);
    return overdueMap;
  }

  for (const inv of invoices || []) {
    const existing = overdueMap.get(inv.student_id);
    const amount = Number(inv.total_amount) || 0;
    if (!existing) {
      overdueMap.set(inv.student_id, {
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

  return overdueMap;
}

export async function getTeacherActiveSchedule(teacherId: string) {
  const supabase = createAdminClient();

  // Fetch classes assigned to this teacher in any active draft
  const { data: classes } = await supabase
    .from("schedule_classes")
    .select(`
      id,
      day_of_week,
      start_time,
      end_time,
      shift_id,
      variant_id,
      schedule_drafts!inner(
        status,
        branches(name)
      ),
      branch_shifts (
        id,
        name
      ),
      program_variants (
        id,
        name,
        programs (
          id,
          name
        )
      ),
      schedule_placements (
        student_id,
        students (
          id,
          full_name,
          student_number
        )
      )
    `)
    .eq("schedule_drafts.status", "active")
    .eq("teacher_id", teacherId)
    .order("day_of_week")
    .order("start_time");

  const rawClasses = (classes || []) as unknown as RawClassRow[];

  const formattedClasses: TeacherClassItem[] = rawClasses.map((c) => {
    const shiftData = c.branch_shifts;
    const variantData = c.program_variants;
    const placements = c.schedule_placements || [];
    const branchName = c.schedule_drafts?.branches?.name || "Cabang";

    const students = placements
      .map((p) => p.students)
      .filter((s): s is NonNullable<typeof s> => s !== null)
      .map((s) => ({
        id: s.id,
        full_name: s.full_name,
        student_number: s.student_number || null,
      }));

    return {
      id: c.id,
      branch_name: branchName,
      day_of_week: c.day_of_week,
      start_time: c.start_time,
      end_time: c.end_time,
      shift_name: shiftData?.name || "-",
      program_name: variantData?.programs?.name || "Program",
      variant_name: variantData?.name || "-",
      students,
    };
  });

  const classIds = formattedClasses.map((item) => item.id);
  const allStudentIds = Array.from(
    new Set(
      formattedClasses.flatMap((cls) => cls.students.map((st) => st.id))
    )
  );
  const teachingLogDates = Array.from(
    new Set(formattedClasses.map((item) => getPreviousSessionDate(item.day_of_week)))
  );
  const sessionByClassDate = new Map<string, "draft" | "submitted">();

  if (classIds.length > 0) {
    const { data: teachingSessions } = await supabase
      .from("teaching_sessions")
      .select("schedule_class_id, session_date, status")
      .eq("teacher_id", teacherId)
      .in("schedule_class_id", classIds)
      .in("session_date", teachingLogDates);

    (teachingSessions || []).forEach((session) => {
      sessionByClassDate.set(
        `${session.schedule_class_id}:${session.session_date}`,
        session.status as "draft" | "submitted"
      );
    });
  }

  const overdueByStudent = await getOverdueSppByStudentIds(supabase, allStudentIds);

  const classesWithEnrichment = formattedClasses.map((item) => {
    const teachingLogDate = getPreviousSessionDate(item.day_of_week);
    const enrichedStudents: TeacherScheduleStudentItem[] = item.students.map((st) => ({
      ...st,
      overdue_spp: overdueByStudent.get(st.id) ?? null,
    }));
    const overdueCount = enrichedStudents.filter((st) => Boolean(st.overdue_spp)).length;

    return {
      ...item,
      students: enrichedStudents,
      overdue_students_count: overdueCount,
      teaching_log_date: teachingLogDate,
      teaching_log_status:
        sessionByClassDate.get(`${item.id}:${teachingLogDate}`) ?? null,
    };
  });

  return {
    classes: classesWithEnrichment,
  };
}
