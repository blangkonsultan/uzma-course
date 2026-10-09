import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types";
import type { BranchShift } from "@/lib/shifts";

export interface BranchWithDistance extends Branch {
  distanceMeters?: number | null;
}

/**
 * Mengambil seluruh cabang yang secara resmi ditugaskan ke guru tertentu via tabel junction profile_branches.
 * Jika profile_branches kosong, fallback ke profile.branch_id untuk backward compatibility.
 */
export async function getTeacherAssignedBranches(teacherId: string): Promise<Branch[]> {
  const supabase = await createClient();

  // 1. Query junction table
  const { data: assignments } = await supabase
    .from("profile_branches")
    .select("branch_id, is_primary")
    .eq("profile_id", teacherId)
    .order("is_primary", { ascending: false });

  let assignedBranchIds: string[] = [];

  if (assignments && assignments.length > 0) {
    assignedBranchIds = assignments.map((a) => a.branch_id);
  } else {
    // Fallback: check profile.branch_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("branch_id")
      .eq("id", teacherId)
      .single();

    if (profile?.branch_id) {
      assignedBranchIds = [profile.branch_id];
    }
  }

  if (assignedBranchIds.length === 0) {
    return [];
  }

  // 2. Fetch full branch records
  const { data: branches } = await supabase
    .from("branches")
    .select("*")
    .in("id", assignedBranchIds)
    .eq("is_active", true)
    .order("name");

  return branches || [];
}

/**
 * Mengambil map shift aktif yang dikelompokkan berdasarkan branch_id
 */
export async function getBranchShiftsMap(branchIds: string[]): Promise<Record<string, BranchShift[]>> {
  if (branchIds.length === 0) return {};

  const supabase = await createClient();
  const { data: shifts } = await supabase
    .from("branch_shifts")
    .select("*")
    .in("branch_id", branchIds)
    .eq("is_active", true)
    .order("start_time");

  const map: Record<string, BranchShift[]> = {};
  branchIds.forEach((bId) => {
    map[bId] = [];
  });

  (shifts || []).forEach((s) => {
    if (!map[s.branch_id]) {
      map[s.branch_id] = [];
    }
    map[s.branch_id].push(s);
  });

  return map;
}
