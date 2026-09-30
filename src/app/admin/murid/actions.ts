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

export async function createStudent(formData: FormData) {
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

  if (!fullName || fullName.length < 2) {
    return { error: "Nama lengkap murid minimal 2 karakter." };
  }
  if (!parentName || parentName.length < 2) {
    return { error: "Nama orang tua / wali minimal 2 karakter." };
  }
  if (!parentPhone || parentPhone.length < 8) {
    return { error: "Nomor HP orang tua minimal 8 digit." };
  }
  if (branchId !== "balongbendo" && branchId !== "krian") {
    return { error: "Cabang wajib dipilih (Balongbendo atau Krian)." };
  }
  if (programs.length === 0) {
    return { error: "Pilih minimal 1 program bimbingan." };
  }

  const { error } = await supabase.from("students").insert({
    full_name: fullName,
    birth_date: birthDate,
    address,
    parent_name: parentName,
    parent_phone: parentPhone,
    parent_email: parentEmail,
    branch_id: branchId,
    programs,
    notes,
    is_active: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/murid");
  revalidatePath("/admin");
  redirect("/admin/murid?success=" + encodeURIComponent("Data murid berhasil ditambahkan"));
}

export async function updateStudent(id: string, formData: FormData) {
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

  if (!fullName || fullName.length < 2) {
    return { error: "Nama lengkap murid minimal 2 karakter." };
  }
  if (!parentName || parentName.length < 2) {
    return { error: "Nama orang tua / wali minimal 2 karakter." };
  }
  if (!parentPhone || parentPhone.length < 8) {
    return { error: "Nomor HP orang tua minimal 8 digit." };
  }
  if (branchId !== "balongbendo" && branchId !== "krian") {
    return { error: "Cabang wajib dipilih (Balongbendo atau Krian)." };
  }
  if (programs.length === 0) {
    return { error: "Pilih minimal 1 program bimbingan." };
  }

  const { error } = await supabase
    .from("students")
    .update({
      full_name: fullName,
      birth_date: birthDate,
      address,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_email: parentEmail,
      branch_id: branchId,
      programs,
      notes,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath(`/admin/murid/${id}/edit`);
  revalidatePath("/admin");
  redirect(`/admin/murid/${id}?success=` + encodeURIComponent("Data murid berhasil diperbarui"));
}

export async function toggleStudentActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

  const nextStatus = !currentStatus;

  const { error } = await supabase
    .from("students")
    .update({
      is_active: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/murid");
  revalidatePath(`/admin/murid/${id}`);
  revalidatePath("/admin");
}
