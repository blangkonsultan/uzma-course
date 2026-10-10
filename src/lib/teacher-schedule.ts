import { createAdminClient } from "./supabase/admin";

export interface TeacherClassItem {
  id: string;
  branch_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  shift_name: string;
  program_name: string;
  variant_name: string;
  students: {
    id: string;
    full_name: string;
    student_number: string | null;
  }[];
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

  return {
    classes: formattedClasses,
  };
}
