
import { createClient } from "@/lib/supabase/server";

export async function getActiveGuruCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "guru")
    .eq("is_active", true);
  return count ?? 0;
}

export async function getActiveStudents() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, branch_id, student_programs(program_id)")
    .eq("is_active", true);
  return data ?? [];
}

export async function getActiveGuruAndMuridForBirthdays(branchId?: string, isAdmin: boolean = false) {
  const supabase = await createClient();
  
  let guruQuery = supabase.from("profiles").select("id, full_name, birth_date, role, branches(name)").eq("is_active", true).not("birth_date", "is", null);
  let muridQuery = supabase.from("students").select("id, full_name, birth_date, branches(name)").eq("is_active", true).not("birth_date", "is", null);

  if (!isAdmin && branchId) {
    guruQuery = guruQuery.eq("branch_id", branchId);
    muridQuery = muridQuery.eq("branch_id", branchId);
  }

  const [{ data: gurus }, { data: murids }] = await Promise.all([guruQuery, muridQuery]);
  return { gurus, murids };
}
