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

export async function insertScheduleDraft(data: {
  branch_id: string;
  name: string;
  effective_date: string | null;
  status: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_drafts").insert(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateScheduleDraft(id: string, data: {
  name: string;
  effective_date: string | null;
  status: string;
  updated_at: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_drafts")
    .update(data)
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function setScheduleDraftActive(id: string) {
  const supabase = await createClient();
  // Database trigger will archive others
  const { error } = await supabase
    .from("schedule_drafts")
    .update({ 
        status: "active",
        updated_at: new Date().toISOString()
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
