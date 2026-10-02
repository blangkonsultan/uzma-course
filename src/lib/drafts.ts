import { createClient } from "./supabase/server";

export interface ScheduleDraft {
  id: string;
  branch_id: string;
  name: string;
  effective_date: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export async function getScheduleDrafts(branchId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("schedule_drafts")
    .select("*")
    .order("effective_date", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching schedule drafts:", error);
    return [];
  }
  return data as ScheduleDraft[];
}

export async function getScheduleDraftById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_drafts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as ScheduleDraft;
}
