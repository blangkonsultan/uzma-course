import { createClient } from "@/lib/supabase/server";
import type { Program } from "@/types";

export async function getPrograms(includeInactive = false): Promise<Program[]> {
  const supabase = await createClient();
  let query = supabase.from("programs").select("*, program_variants(*)").order("sort_order", { ascending: true });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("*, program_variants(*)").eq("id", id).single();
  if (data?.program_variants) {
    data.program_variants.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }
  return data;
}

export async function getProgramEnrollmentStats(id: string): Promise<{ studentCount: number; teacherCount: number }> {
  const supabase = await createClient();
  const [studentCountRes, teacherCountRes] = await Promise.all([
    supabase
      .from("student_programs")
      .select("*", { count: "exact", head: true })
      .eq("program_id", id),
    supabase
      .from("profile_programs")
      .select("*", { count: "exact", head: true })
      .eq("program_id", id),
  ]);
  return {
    studentCount: studentCountRes.count ?? 0,
    teacherCount: teacherCountRes.count ?? 0,
  };
}
