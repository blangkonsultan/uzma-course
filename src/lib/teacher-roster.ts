import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface TeacherRosterStudent {
  id: string;
  full_name: string;
  student_number: string | null;
}

export async function getTeacherClassStudents(
  supabase: SupabaseClient<Database>,
  classIds: readonly string[]
): Promise<Map<string, TeacherRosterStudent[]>> {
  const result = new Map<string, TeacherRosterStudent[]>();
  if (!classIds || classIds.length === 0) {
    return result;
  }

  const PAGE_SIZE = 1000;
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .rpc("get_teacher_class_students", {
        p_class_ids: classIds as string[],
      })
      .order("class_id", { ascending: true })
      .order("student_id", { ascending: true })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Gagal membaca daftar murid kelas: ${error.message}`);
    }

    const rows = data || [];
    for (const row of rows) {
      const existing = result.get(row.class_id) || [];
      existing.push({
        id: row.student_id,
        full_name: row.full_name,
        student_number: row.student_number || null,
      });
      result.set(row.class_id, existing);
    }

    if (rows.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      start += PAGE_SIZE;
    }
  }

  return result;
}
