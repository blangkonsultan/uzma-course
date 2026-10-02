import { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveGuruCount(supabase: SupabaseClient) {
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "guru")
    .eq("is_active", true);
  return count ?? 0;
}

export async function getActiveStudents(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("students")
    .select("id, branch_id, student_programs(program_id)")
    .eq("is_active", true);
  return data ?? [];
}
