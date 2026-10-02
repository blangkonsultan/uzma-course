import { createClient } from "./supabase/server";

export async function getBoardData(draftId: string) {
  const supabase = await createClient();

  // 1. Get draft
  const { data: draft, error: draftErr } = await supabase
    .from("schedule_drafts")
    .select("*")
    .eq("id", draftId)
    .single();

  if (draftErr || !draft) {
    throw new Error("Draft not found");
  }

  const branchId = draft.branch_id;

  // 2. Get shifts
  const { data: shifts } = await supabase
    .from("branch_shifts")
    .select("*")
    .eq("branch_id", branchId)
    .eq("is_active", true)
    .order("start_time");

  // 3. Get teachers (profiles)
  const { data: teachers } = await supabase
    .from("profiles")
    .select("*, profile_programs(program_id)")
    .eq("branch_id", branchId)
    .eq("role", "guru")
    .eq("is_active", true);

  // 4. Get program variants (for capacity and teacher assignment)
  const { data: variants } = await supabase
    .from("program_variants")
    .select("*, programs(*)")
    .eq("is_active", true);

  // 5. Get students and their enrollments
  const { data: students } = await supabase
    .from("students")
    .select("*, student_programs(program_id, variant_id)")
    .eq("branch_id", branchId)
    .eq("is_active", true);

  // 6. Get existing classes and placements for this draft
  const { data: classes } = await supabase
    .from("schedule_classes")
    .select("*, schedule_placements(*)")
    .eq("draft_id", draftId);

  return {
    draft,
    shifts: shifts || [],
    teachers: teachers || [],
    variants: variants || [],
    students: students || [],
    classes: classes || [],
  };
}
