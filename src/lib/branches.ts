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

export interface BranchWithStats extends Branch {
  guruCount: number;
  muridCount: number;
}

export async function getPaginatedBranchesWithStats(params: {
  search: string;
  status: string;
  page: number;
  pageSize: number;
}): Promise<{ branches: BranchWithStats[]; totalItems: number; totalPages: number }> {
  const supabase = await createClient();
  let query = supabase.from("branches").select("*", { count: "exact" });

  if (params.status === "active") {
    query = query.eq("is_active", true);
  } else if (params.status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  const [
    { data: branchList, count },
    { data: activeGurus },
    { data: activeStudents },
  ] = await Promise.all([
    query.order("name", { ascending: true }).range(from, to),
    supabase.from("profiles").select("branch_id").eq("role", "guru").eq("is_active", true),
    supabase.from("students").select("branch_id").eq("is_active", true),
  ]);

  const guruCountMap: Record<string, number> = {};
  (activeGurus || []).forEach((g) => {
    if (g.branch_id) {
      guruCountMap[g.branch_id] = (guruCountMap[g.branch_id] || 0) + 1;
    }
  });

  const muridCountMap: Record<string, number> = {};
  (activeStudents || []).forEach((s) => {
    if (s.branch_id) {
      muridCountMap[s.branch_id] = (muridCountMap[s.branch_id] || 0) + 1;
    }
  });

  const branchesWithStats = (branchList || []).map((branch) => ({
    ...branch,
    guruCount: guruCountMap[branch.id] || 0,
    muridCount: muridCountMap[branch.id] || 0,
  }));

  const totalItems = count ?? 0;
  const totalPages = Math.ceil(totalItems / params.pageSize);

  return { branches: branchesWithStats, totalItems, totalPages };
}

export async function getBranchDetailData(id: string) {
  const supabase = await createClient();
  const [branch, guruCountRes, studentCountRes] = await Promise.all([
    getBranchById(id),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "guru")
      .eq("branch_id", id)
      .eq("is_active", true),
    supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", id)
      .eq("is_active", true),
  ]);

  return {
    branch,
    guruCount: guruCountRes.count ?? 0,
    studentCount: studentCountRes.count ?? 0,
  };
}
