import { createClient } from "./supabase/server";
import type { Database } from "@/types/database";

type StudentProgramInsert = Database["public"]["Tables"]["student_programs"]["Insert"];
type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

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

export async function generateStudentNumber(
  branchId: string,
  joinedDate: string
): Promise<string> {
  const supabase = await createClient();
  const { data: branchData } = await supabase
    .from("branches")
    .select("code")
    .eq("id", branchId)
    .single();
  const branchCode = branchData?.code || "00";

  const jd = new Date(joinedDate);
  const yy = jd.getFullYear().toString().slice(-2);
  const mm = (jd.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `${yy}${mm}.${branchCode}.`;

  const { data: maxStudent } = await supabase
    .from("students")
    .select("student_number")
    .like("student_number", `${prefix}%`)
    .order("student_number", { ascending: false })
    .limit(1)
    .single();

  let nextNum = 1;
  if (maxStudent && maxStudent.student_number) {
    const parts = maxStudent.student_number.split(".");
    const lastStr = parts[parts.length - 1];
    if (lastStr) nextNum = parseInt(lastStr, 10) + 1;
  }
  return `${prefix}${nextNum.toString().padStart(3, "0")}`;
}

export async function createStudentData(
  studentData: StudentInsert,
  studentPrograms: Omit<StudentProgramInsert, "student_id">[]
) {
  const supabase = await createClient();
  const { data: insertedStudent, error: insertError } = await supabase
    .from("students")
    .insert(studentData)
    .select("id")
    .single();

  if (insertError || !insertedStudent) {
    return { error: insertError?.message || "Gagal menambahkan data murid." };
  }

  if (studentPrograms.length > 0) {
    const { error: junctionError } = await supabase
      .from("student_programs")
      .insert(
        studentPrograms.map((sp) => ({
          ...sp,
          student_id: insertedStudent.id,
        }))
      );

    if (junctionError) {
      return { error: junctionError.message };
    }
  }

  return { success: true, studentId: insertedStudent.id };
}

export async function updateStudentData(
  id: string,
  studentData: StudentUpdate,
  studentPrograms: Omit<StudentProgramInsert, "student_id">[]
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("students")
    .update({
      ...studentData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  const { error: deleteError } = await supabase
    .from("student_programs")
    .delete()
    .eq("student_id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (studentPrograms.length > 0) {
    const { error: insertJunctionError } = await supabase
      .from("student_programs")
      .insert(
        studentPrograms.map((sp) => ({
          ...sp,
          student_id: id,
        }))
      );

    if (insertJunctionError) {
      return { error: insertJunctionError.message };
    }
  }

  return { success: true };
}

export async function toggleStudentActiveStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
