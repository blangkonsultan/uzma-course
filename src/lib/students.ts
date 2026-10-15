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
  branchId: string
): Promise<string> {
  const supabase = await createClient();
  const { data: branchData } = await supabase
    .from("branches")
    .select("code")
    .eq("id", branchId)
    .single();

  let branchCode = branchData?.code;
  if (!branchCode) {
    branchCode = branchId === "sumokembangsri" || branchId === "balongbendo" ? "01" : "02";
  }

  const { data: students } = await supabase
    .from("students")
    .select("student_number")
    .eq("branch_id", branchId)
    .not("student_number", "is", null);

  let nextNum = 1;
  if (students && students.length > 0) {
    for (const s of students) {
      if (!s.student_number) continue;
      const regex = new RegExp(`^${branchCode}(\\d{3,})$`);
      const match = s.student_number.match(regex);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (parsed >= nextNum) {
          nextNum = parsed + 1;
        }
      }
    }
  }

  return `${branchCode}${nextNum.toString().padStart(3, "0")}`;
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
): Promise<{ success?: boolean; error?: string }> {
  // 1. Pre-validation: ensure all program statuses match the constraint
  const validStatuses: Record<string, true> = {
    active: true,
    cuti: true,
    lulus: true,
    keluar: true,
  };

  for (const sp of studentPrograms) {
    if (sp.status && !validStatuses[sp.status]) {
      return { error: `Status program '${sp.status}' tidak valid.` };
    }
    if (!sp.variant_id) {
      return { error: "Varian program wajib dipilih untuk setiap program terdaftar." };
    }
  }

  const supabase = await createClient();

  // 2. Update core student row
  const { error: updateError } = await supabase
    .from("students")
    .update({
      ...studentData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { error: `Gagal memperbarui data murid: ${updateError.message}` };
  }

  // 3. Backup existing records in memory in case replacement fails
  const { data: existingRecords, error: fetchError } = await supabase
    .from("student_programs")
    .select("*")
    .eq("student_id", id);

  if (fetchError) {
    return { error: `Gagal membaca pendaftaran lama: ${fetchError.message}` };
  }

  const { error: deleteError } = await supabase
    .from("student_programs")
    .delete()
    .eq("student_id", id);

  if (deleteError) {
    return { error: `Gagal memperbarui pendaftaran program: ${deleteError.message}` };
  }

  if (studentPrograms.length > 0) {
    const { error: insertError } = await supabase
      .from("student_programs")
      .insert(
        studentPrograms.map((sp) => ({
          ...sp,
          student_id: id,
          status: sp.status || "active",
        }))
      );

    if (insertError) {
      // Compensate: attempt restoring previous records to prevent permanent data loss
      if (existingRecords && existingRecords.length > 0) {
        await supabase.from("student_programs").insert(existingRecords);
      }
      return { error: `Gagal menyimpan pendaftaran program baru: ${insertError.message}` };
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
