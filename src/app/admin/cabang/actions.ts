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

export interface BranchActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createBranch(formData: FormData): Promise<BranchActionResponse | void> {
  const { supabase } = await requireAdmin();

  const id = formData.get("id")?.toString().trim().toLowerCase() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const subName = formData.get("sub_name")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const mapEmbedUrl = formData.get("map_embed_url")?.toString().trim() || null;
  const gmapsUrl = formData.get("gmaps_url")?.toString().trim() || null;

  const fieldErrors: Record<string, string> = {};

  if (!id || id.length < 2 || !/^[a-z0-9-]+$/.test(id)) {
    fieldErrors.id =
      "ID cabang minimal 2 karakter dan hanya boleh berisi huruf kecil, angka, dan strip (contoh: balongbendo).";
  }

  if (!name || name.length < 2) {
    fieldErrors.name = "Nama cabang minimal 2 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase.from("branches").insert({
    id,
    name,
    sub_name: subName,
    address,
    map_embed_url: mapEmbedUrl,
    gmaps_url: gmapsUrl,
    is_active: true,
  });

  if (error) {
    if (
      error.message.includes("branches_pkey") ||
      error.message.includes("unique") ||
      error.code === "23505"
    ) {
      return { fieldErrors: { id: "ID cabang sudah digunakan." } };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/cabang");
  revalidatePath("/admin");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/murid");
  revalidatePath("/");
  redirect("/admin/cabang?success=" + encodeURIComponent("Cabang baru berhasil ditambahkan"));
}

export async function updateBranch(
  id: string,
  formData: FormData
): Promise<BranchActionResponse | void> {
  const { supabase } = await requireAdmin();

  const name = formData.get("name")?.toString().trim() || "";
  const subName = formData.get("sub_name")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const mapEmbedUrl = formData.get("map_embed_url")?.toString().trim() || null;
  const gmapsUrl = formData.get("gmaps_url")?.toString().trim() || null;
  const isActive = formData.get("is_active") === "true";

  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Nama cabang minimal 2 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase
    .from("branches")
    .update({
      name,
      sub_name: subName,
      address,
      map_embed_url: mapEmbedUrl,
      gmaps_url: gmapsUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/cabang");
  revalidatePath(`/admin/cabang/${id}`);
  revalidatePath(`/admin/cabang/${id}/edit`);
  revalidatePath("/admin");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/murid");
  revalidatePath("/");
  redirect(`/admin/cabang/${id}?success=` + encodeURIComponent("Data cabang berhasil diperbarui"));
}

export async function toggleBranchActive(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean } | { error: string }> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("branches")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/cabang");
  revalidatePath(`/admin/cabang/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/guru");
  revalidatePath("/admin/murid");
  revalidatePath("/");
  return { success: true };
}

export async function createBranchShift(formData: FormData): Promise<BranchActionResponse | void> {
  const { supabase } = await requireAdmin();

  const branchId = formData.get("branch_id")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const dayOfWeekStr = formData.get("day_of_week")?.toString().trim();
  const startTime = formData.get("start_time")?.toString().trim();
  const endTime = formData.get("end_time")?.toString().trim();

  if (!branchId || !name || !dayOfWeekStr || !startTime || !endTime) {
    return { error: "Semua field harus diisi." };
  }

  const dayOfWeek = parseInt(dayOfWeekStr, 10);
  if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    return { fieldErrors: { day_of_week: "Hari harus antara 1 (Senin) hingga 7 (Minggu)." } };
  }

  const { error } = await supabase.from("branch_shifts").insert({
    branch_id: branchId,
    name,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { error: "Gagal menambahkan shift: " + error.message };
  }

  revalidatePath(`/admin/cabang/${branchId}`);
}

export async function updateBranchShift(
  shiftId: string,
  branchId: string,
  formData: FormData
): Promise<BranchActionResponse | void> {
  const { supabase } = await requireAdmin();

  const name = formData.get("name")?.toString().trim();
  const dayOfWeekStr = formData.get("day_of_week")?.toString().trim();
  const startTime = formData.get("start_time")?.toString().trim();
  const endTime = formData.get("end_time")?.toString().trim();

  if (!name || !dayOfWeekStr || !startTime || !endTime) {
    return { error: "Semua field harus diisi." };
  }

  const dayOfWeek = parseInt(dayOfWeekStr, 10);
  if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    return { fieldErrors: { day_of_week: "Hari harus antara 1 (Senin) hingga 7 (Minggu)." } };
  }

  const { error } = await supabase.from("branch_shifts")
    .update({
      name,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", shiftId)
    .eq("branch_id", branchId);

  if (error) {
    return { error: "Gagal memperbarui shift: " + error.message };
  }

  revalidatePath(`/admin/cabang/${branchId}`);
}

export async function deleteBranchShift(shiftId: string, branchId: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const { supabase } = await requireAdmin();
    
    const { error } = await supabase
      .from("branch_shifts")
      .delete()
      .eq("id", shiftId)
      .eq("branch_id", branchId);

    if (error) {
      console.error("Delete shift error:", error);
      return { error: error.message };
    }

    revalidatePath(`/admin/cabang/${branchId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Action error:", error);
    return { error: error instanceof Error ? error.message : "Terjadi kesalahan sistem." };
  }
}
