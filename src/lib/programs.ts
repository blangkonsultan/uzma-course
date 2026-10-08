import { createClient } from "@/lib/supabase/server";
import type { Program } from "@/types";
import type { Database } from "@/types/database";

type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];
type VariantInsert = Database["public"]["Tables"]["program_variants"]["Insert"];

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

export async function insertProgram(
  programData: ProgramInsert,
  variantsToInsert: VariantInsert[]
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .insert(programData)
    .select("id")
    .single();

  if (error) {
    return { error };
  }

  if (variantsToInsert.length > 0) {
    const variantsWithId = variantsToInsert.map((v) => ({
      ...v,
      program_id: data.id,
    })) as VariantInsert[];
    const { error: variantError } = await supabase
      .from("program_variants")
      .insert(variantsWithId);
    
    if (variantError) {
      return { error: variantError };
    }
  }

  return { data };
}

export async function updateProgramData(
  id: string,
  programData: ProgramUpdate,
  variantsToUpsert: VariantInsert[],
  activeVariantIds: string[]
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("programs")
    .update(programData)
    .eq("id", id);

  if (error) {
    return { error };
  }

  if (variantsToUpsert.length > 0) {
    const { error: variantError } = await supabase
      .from("program_variants")
      .upsert(variantsToUpsert);
      
    if (variantError) {
      return { error: variantError };
    }
  }

  if (activeVariantIds.length > 0) {
    await supabase
      .from("program_variants")
      .delete()
      .eq("program_id", id)
      .not("id", "in", `(${activeVariantIds.join(",")})`);
  } else {
    await supabase.from("program_variants").delete().eq("program_id", id);
  }

  return { success: true };
}

export async function updateProgramStatus(id: string, newStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("programs")
    .update({
      is_active: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error };
  }

  return { success: true };
}
