import { createClient } from "./supabase/server";

export async function getPaginatedStudents(params: {
  search?: string;
  branch?: string;
  program?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = await createClient();
  const search = params.search?.trim() || "";
  const program = params.program || "all";
  const status = params.status || "all";
  const page = Math.max(1, params.page || 1);
  const pageSize = params.pageSize || 10;
  const branch = params.branch || "all";

  const query = supabase.from("students");

  let selectQuery =
    program !== "all"
      ? query.select("*, student_programs!inner(program_id)", {
          count: "exact",
        })
      : query.select("*, student_programs(program_id)", { count: "exact" });

  if (branch !== "all") {
    selectQuery = selectQuery.eq("branch_id", branch);
  }

  if (status === "active") {
    selectQuery = selectQuery.eq("is_active", true);
  } else if (status === "inactive") {
    selectQuery = selectQuery.eq("is_active", false);
  }

  if (program !== "all") {
    selectQuery = selectQuery.eq("student_programs.program_id", program);
  }

  if (search) {
    selectQuery = selectQuery.or(
      `full_name.ilike.%${search}%,parent_name.ilike.%${search}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: students, count } = await selectQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    students: students || [],
    count: count ?? 0,
  };
}

export async function getStudentByIdForView(id: string) {
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("*, student_programs(program_id, spp_amount, enrolled_at, status, programs(*))")
    .eq("id", id)
    .single();

  return student;
}

export async function getStudentByIdForEdit(id: string) {
  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("*, student_programs(*)")
    .eq("id", id)
    .single();

  return student;
}
