import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export type ProfileWithPrograms = Profile & {
  profile_programs?: { program_id: string }[];
};

export interface GetPaginatedGurusParams {
  search: string;
  branch: string;
  status: string;
  page: number;
  pageSize: number;
}

export async function getPaginatedGurus(params: GetPaginatedGurusParams) {
  const supabase = await createClient();
  const { search, branch, status, page, pageSize } = params;

  let query = supabase
    .from("profiles")
    .select("*, profile_programs(program_id)", { count: "exact" })
    .eq("role", "guru");

  if (branch !== "all") {
    query = query.eq("branch_id", branch);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return { data: (data as ProfileWithPrograms[]) || [], count: count || 0 };
}

export async function getGuruById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, profile_programs(program_id)")
    .eq("id", id)
    .eq("role", "guru")
    .single();

  return data as ProfileWithPrograms | null;
}
