import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types";

export async function getBranches(includeInactive = false): Promise<Branch[]> {
  const supabase = await createClient();
  let query = supabase.from("branches").select("*").order("name");
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getBranchById(id: string): Promise<Branch | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("*").eq("id", id).single();
  return data;
}
