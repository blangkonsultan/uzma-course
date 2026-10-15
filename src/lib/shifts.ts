import { createClient } from "./supabase/server";

export interface BranchShift {
  id: string;
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getBranchShifts(branchId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("branch_shifts")
    .select("*")
    .order("start_time", { ascending: true });

  if (branchId) {
    query = query.eq("branch_id", branchId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching branch shifts:", error);
    return [];
  }
  return data as BranchShift[];
}

export async function getBranchShiftById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branch_shifts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as BranchShift;
}

export async function insertBranchShift(data: {
  branch_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("branch_shifts").insert(data);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateBranchShift(
  id: string,
  data: {
    name?: string;
    start_time?: string;
    end_time?: string;
    updated_at?: string;
  }
) {
  const supabase = await createClient();

  if (data.start_time || data.end_time) {
    const { data: strandedClasses } = await supabase
      .from("schedule_classes")
      .select("id, start_time, end_time")
      .eq("shift_id", id)
      .or(`start_time.lt.${data.start_time},end_time.gt.${data.end_time}`);

    if (strandedClasses && strandedClasses.length > 0) {
      throw new Error(
        "Jam shift tidak dapat dipersempit karena terdapat kelas yang sudah terjadwal di luar jam baru."
      );
    }
  }

  const { error } = await supabase
    .from("branch_shifts")
    .update(data)
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleBranchShiftActive(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("branch_shifts")
    .update({ 
        is_active: !currentStatus,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
