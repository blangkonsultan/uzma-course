import { createClient } from "@/lib/supabase/server";
import type { Program } from "@/types";

export async function getPrograms(includeInactive = false): Promise<Program[]> {
  const supabase = await createClient();
  let query = supabase.from("programs").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("programs").select("*").eq("id", id).single();
  return data;
}
