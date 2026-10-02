"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

export interface ShiftActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createShift(formData: FormData): Promise<ShiftActionResponse | void> {
  const { supabase } = await requireAdmin();

  const branchId = formData.get("branch_id")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const startTime = formData.get("start_time")?.toString().trim() || "";
  const endTime = formData.get("end_time")?.toString().trim() || "";

  const fieldErrors: Record<string, string> = {};

  if (!branchId) fieldErrors.branch_id = "Cabang wajib dipilih.";
  if (!name) fieldErrors.name = "Nama shift wajib diisi.";
  if (!startTime) fieldErrors.start_time = "Jam mulai wajib diisi.";
  if (!endTime) fieldErrors.end_time = "Jam selesai wajib diisi.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase.from("branch_shifts").insert({
    branch_id: branchId,
    name,
    start_time: startTime,
    end_time: endTime,
    is_active: true,
  });

  if (error) {
    return { error: `Gagal menyimpan shift: ${error.message}` };
  }

  revalidatePath("/admin/shift");
  redirect("/admin/shift?success=" + encodeURIComponent("Shift berhasil ditambahkan"));
}

export async function updateShift(id: string, formData: FormData): Promise<ShiftActionResponse | void> {
  const { supabase } = await requireAdmin();

  const name = formData.get("name")?.toString().trim() || "";
  const startTime = formData.get("start_time")?.toString().trim() || "";
  const endTime = formData.get("end_time")?.toString().trim() || "";

  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Nama shift wajib diisi.";
  if (!startTime) fieldErrors.start_time = "Jam mulai wajib diisi.";
  if (!endTime) fieldErrors.end_time = "Jam selesai wajib diisi.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase
    .from("branch_shifts")
    .update({
      name,
      start_time: startTime,
      end_time: endTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: `Gagal memperbarui shift: ${error.message}` };
  }

  revalidatePath("/admin/shift");
  revalidatePath(`/admin/shift/${id}/edit`);
  redirect("/admin/shift?success=" + encodeURIComponent("Shift berhasil diperbarui"));
}

export async function toggleShiftActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("branch_shifts")
    .update({ 
        is_active: !currentStatus,
        updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah status: ${error.message}`);
  }

  revalidatePath("/admin/shift");
}
