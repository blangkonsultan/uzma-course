import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/types";
import type { BranchShift } from "@/lib/shifts";

export interface BranchWithDistance extends Branch {
  distanceMeters?: number | null;
}

/**
 * Mengambil seluruh cabang yang secara resmi ditugaskan ke guru tertentu.
 * Strategi cerdas & resilient:
 * 1. Query tabel junction profile_branches (jika tabel sudah aktif).
 * 2. Cek profile.branch_id (homebase utama).
 * 3. Cek seluruh cabang tempat guru dialokasikan mengajar (schedule_classes -> draft -> branch_id).
 * Menggabungkan ketiganya tanpa duplikasi, sehingga guru multi-cabang selalu terdeteksi.
 */
export async function getTeacherAssignedBranches(teacherId: string): Promise<Branch[]> {
  const supabase = await createClient();

  const assignedBranchSet = new Set<string>();

  // 1. Cek tabel junction profile_branches (jika ada)
  try {
    const { data: assignments } = await supabase
      .from("profile_branches")
      .select("branch_id")
      .eq("profile_id", teacherId);

    if (assignments && assignments.length > 0) {
      assignments.forEach((a) => assignedBranchSet.add(a.branch_id));
    }
  } catch {
    // Tabel belum di-migrate, lanjutkan ke fallback
  }

  // 2. Cek profile.branch_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("branch_id")
    .eq("id", teacherId)
    .single();

  if (profile?.branch_id) {
    assignedBranchSet.add(profile.branch_id);
  }

  // 3. Cek cabang-cabang tempat guru memiliki alokasi sesi mengajar di draf aktif
  try {
    const { data: classes } = await supabase
      .from("schedule_classes")
      .select("schedule_drafts ( branch_id, status )")
      .eq("teacher_id", teacherId);

    if (classes && classes.length > 0) {
      classes.forEach((c) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const draft = c.schedule_drafts as any;
        if (draft?.branch_id) {
          assignedBranchSet.add(draft.branch_id);
        }
      });
    }
  } catch {
    // Ignore error
  }

  const assignedBranchIds = Array.from(assignedBranchSet);

  if (assignedBranchIds.length === 0) {
    return [];
  }

  // 4. Fetch data lengkap cabang
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
