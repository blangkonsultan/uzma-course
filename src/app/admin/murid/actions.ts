"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Hanya admin yang memiliki izin untuk operasi ini.");
  }

  return { user, supabase };
}

export interface StudentActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createStudent(formData: FormData): Promise<StudentActionResponse | void> {
  const { supabase } = await requireAdmin();

  const fullName = formData.get("full_name")?.toString().trim();
  const birthDate = formData.get("birth_date")?.toString().trim() || null;
  const address = formData.get("address")?.toString().trim() || "";
  const parentName = formData.get("parent_name")?.toString().trim();
  const parentPhone = formData.get("parent_phone")?.toString().trim();
  const parentEmail = formData.get("parent_email")?.toString().trim() || "";
  const branchId = formData.get("branch_id")?.toString().trim();
  let studentNumber = formData.get("student_number")?.toString().trim() || null;
  const joinedDate = formData.get("joined_date")?.toString().trim() || new Date().toISOString().split("T")[0];
  const notes = formData.get("notes")?.toString().trim() || "";
  
  const studentProgramsJson = formData.get("student_programs_json")?.toString();
  let studentPrograms: { program_id: string; variant_id: string; spp_amount: number; on_time_discount_type: "none" | "nominal" | "percentage"; on_time_discount_value: number; cycle_start_date: string; status?: string }[] = [];
  try {
    if (studentProgramsJson) {
      studentPrograms = JSON.parse(studentProgramsJson);
    }
  } catch (e) {
    console.error("Failed to parse student_programs_json", e);
  }

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap murid minimal 2 karakter.";
  }
  if (!parentName || parentName.length < 2) {
    fieldErrors.parent_name = "Nama orang tua / wali minimal 2 karakter.";
  }
  if (!parentPhone || parentPhone.length < 8) {
    fieldErrors.parent_phone = "Nomor WhatsApp orang tua minimal 8 digit.";
  }
  if (!branchId) {
    fieldErrors.branch_id = "Cabang belajar wajib dipilih.";
  }
  if (studentPrograms.length === 0) {
    fieldErrors.programs = "Pilih minimal 1 program bimbingan.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Generate Student Number if empty
  if (!studentNumber && branchId) {
    const { data: branchData } = await supabase.from('branches').select('code').eq('id', branchId).single();
    const branchCode = branchData?.code || '00';
    
    const jd = new Date(joinedDate);
    const yy = jd.getFullYear().toString().slice(-2);
    const mm = (jd.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${yy}${mm}.${branchCode}.`;
    
    const { data: maxStudent } = await supabase
      .from('students')
      .select('student_number')
      .like('student_number', `${prefix}%`)
      .order('student_number', { ascending: false })
      .limit(1)
      .single();
      
    let nextNum = 1;
    if (maxStudent && maxStudent.student_number) {
      const parts = maxStudent.student_number.split('.');
      const lastStr = parts[parts.length - 1];
      if (lastStr) nextNum = parseInt(lastStr, 10) + 1;
    }
    studentNumber = `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }

  const { data: insertedStudent, error: insertError } = await supabase
    .from("students")
    .insert({
      full_name: fullName!,
      birth_date: birthDate,
      address,
      parent_name: parentName!,
      parent_phone: parentPhone!,
      parent_email: parentEmail,
      branch_id: branchId!,
      notes,
      is_active: true,
    })
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
          student_id: insertedStudent.id,
          program_id: sp.program_id,
          variant_id: sp.variant_id,
          spp_amount: sp.spp_amount,
          on_time_discount_type: sp.on_time_discount_type,
          on_time_discount_value: sp.on_time_discount_value,
          cycle_start_date: sp.cycle_start_date,
          status: sp.status || "active",
        }))
      );

    if (junctionError) {
      return { error: junctionError.message };
    }
  }

  revalidatePath("/admin/murid");
  revalidatePath("/admin");
  redirect("/admin/murid?success=" + encodeURIComponent("Data murid berhasil ditambahkan"));
}

export async function updateStudent(id: string, formData: FormData): Promise<StudentActionResponse | void> {
  const { supabase } = await requireAdmin();

  const fullName = formData.get("full_name")?.toString().trim();
  const birthDate = formData.get("birth_date")?.toString().trim() || null;
  const address = formData.get("address")?.toString().trim() || "";
  const parentName = formData.get("parent_name")?.toString().trim();
  const parentPhone = formData.get("parent_phone")?.toString().trim();
  const parentEmail = formData.get("parent_email")?.toString().trim() || "";
  const branchId = formData.get("branch_id")?.toString().trim();
  let studentNumber = formData.get("student_number")?.toString().trim() || null;
  const joinedDate = formData.get("joined_date")?.toString().trim() || new Date().toISOString().split("T")[0];
  const notes = formData.get("notes")?.toString().trim() || "";
  const isActive = formData.get("is_active") === "true";

  const studentProgramsJson = formData.get("student_programs_json")?.toString();
  let studentPrograms: { program_id: string; variant_id: string; spp_amount: number; on_time_discount_type: "none" | "nominal" | "percentage"; on_time_discount_value: number; cycle_start_date: string; status?: string }[] = [];
  try {
    if (studentProgramsJson) {
      studentPrograms = JSON.parse(studentProgramsJson);
    }
  } catch (e) {
    console.error("Failed to parse student_programs_json", e);
  }

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap murid minimal 2 karakter.";
  }
  if (!parentName || parentName.length < 2) {
    fieldErrors.parent_name = "Nama orang tua / wali minimal 2 karakter.";
  }
  if (!parentPhone || parentPhone.length < 8) {
    fieldErrors.parent_phone = "Nomor WhatsApp orang tua minimal 8 digit.";
  }
  if (!branchId) {
    fieldErrors.branch_id = "Cabang belajar wajib dipilih.";
  }
  if (studentPrograms.length === 0) {
    fieldErrors.programs = "Pilih minimal 1 program bimbingan.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  if (!studentNumber && branchId) {
    const { data: branchData } = await supabase.from('branches').select('code').eq('id', branchId).single();
    const branchCode = branchData?.code || '00';
    
    const jd = new Date(joinedDate);
    const yy = jd.getFullYear().toString().slice(-2);
    const mm = (jd.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${yy}${mm}.${branchCode}.`;
    
    const { data: maxStudent } = await supabase
      .from('students')
      .select('student_number')
      .like('student_number', `${prefix}%`)
      .order('student_number', { ascending: false })
      .limit(1)
      .single();
      
    let nextNum = 1;
    if (maxStudent && maxStudent.student_number) {
      const parts = maxStudent.student_number.split('.');
      const lastStr = parts[parts.length - 1];
      if (lastStr) nextNum = parseInt(lastStr, 10) + 1;
    }
    studentNumber = `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }

  const { error: updateError } = await supabase
    .from("students")
    .update({
      full_name: fullName!,
      birth_date: birthDate,
      address,
      parent_name: parentName!,
      parent_phone: parentPhone!,
      parent_email: parentEmail,
      branch_id: branchId!,
      notes,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Delete existing junction rows and insert new ones
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
          student_id: id,
          program_id: sp.program_id,
          variant_id: sp.variant_id,
          spp_amount: sp.spp_amount,
          on_time_discount_type: sp.on_time_discount_type,
          on_time_discount_value: sp.on_time_discount_value,
          cycle_start_date: sp.cycle_start_date,
          status: sp.status || "active",
        }))
      );

    if (insertJunctionError) {
      return { error: insertJunctionError.message };
    }
  }

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath(`/admin/murid/${id}/edit`);
  revalidatePath("/admin");
  redirect(`/admin/murid/${id}?success=` + encodeURIComponent("Data murid berhasil diperbarui"));
}

export async function toggleStudentActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

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

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath("/admin");
  return { success: true };
}
