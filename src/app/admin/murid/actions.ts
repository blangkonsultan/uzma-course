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
  const programs = formData.getAll("programs").map((p) => p.toString());
  const notes = formData.get("notes")?.toString().trim() || "";

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
  if (programs.length === 0) {
    fieldErrors.programs = "Pilih minimal 1 program bimbingan.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
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

  if (programs.length > 0) {
    const { error: junctionError } = await supabase
      .from("student_programs")
      .insert(
        programs.map((pid) => ({
          student_id: insertedStudent.id,
          program_id: pid,
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
  const programs = formData.getAll("programs").map((p) => p.toString());
  const notes = formData.get("notes")?.toString().trim() || "";
  const isActive = formData.get("is_active") === "true";

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
  if (programs.length === 0) {
    fieldErrors.programs = "Pilih minimal 1 program bimbingan.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
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

  if (programs.length > 0) {
    const { error: insertJunctionError } = await supabase
      .from("student_programs")
      .insert(
        programs.map((pid) => ({
          student_id: id,
          program_id: pid,
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
