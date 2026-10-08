"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import { generateStudentNumber, createStudentData, updateStudentData, toggleStudentActiveStatus } from "@/lib/students";

export interface StudentActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createStudent(formData: FormData): Promise<StudentActionResponse | void> {
  await requireAdminAction();

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

  if (!studentNumber && branchId) {
    studentNumber = await generateStudentNumber(branchId, joinedDate);
  }

  const result = await createStudentData(
    {
      full_name: fullName!,
      birth_date: birthDate,
      address,
      parent_name: parentName!,
      parent_phone: parentPhone!,
      parent_email: parentEmail,
      branch_id: branchId!,
      notes,
      is_active: true,
      student_number: studentNumber,
    },
    studentPrograms.map((sp) => ({
      program_id: sp.program_id,
      variant_id: sp.variant_id,
      spp_amount: sp.spp_amount,
      on_time_discount_type: sp.on_time_discount_type as "none" | "nominal" | "percentage",
      on_time_discount_value: sp.on_time_discount_value,
      cycle_start_date: sp.cycle_start_date,
      status: sp.status || "active",
    }))
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/murid");
  revalidatePath("/admin");
  redirect("/admin/murid?success=" + encodeURIComponent("Data murid berhasil ditambahkan"));
}

export async function updateStudent(id: string, formData: FormData): Promise<StudentActionResponse | void> {
  await requireAdminAction();

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
    studentNumber = await generateStudentNumber(branchId, joinedDate);
  }

  const result = await updateStudentData(
    id,
    {
      full_name: fullName!,
      birth_date: birthDate,
      address,
      parent_name: parentName!,
      parent_phone: parentPhone!,
      parent_email: parentEmail,
      branch_id: branchId!,
      notes,
      is_active: isActive,
      student_number: studentNumber,
    },
    studentPrograms.map((sp) => ({
      program_id: sp.program_id,
      variant_id: sp.variant_id,
      spp_amount: sp.spp_amount,
      on_time_discount_type: sp.on_time_discount_type as "none" | "nominal" | "percentage",
      on_time_discount_value: sp.on_time_discount_value,
      cycle_start_date: sp.cycle_start_date,
      status: sp.status || "active",
    }))
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath(`/admin/murid/${id}/edit`);
  revalidatePath("/admin");
  redirect(`/admin/murid/${id}?success=` + encodeURIComponent("Data murid berhasil diperbarui"));
}

export async function toggleStudentActive(id: string, currentStatus: boolean) {
  await requireAdminAction();

  const result = await toggleStudentActiveStatus(id, currentStatus);

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath("/admin");
  return { success: true };
}
