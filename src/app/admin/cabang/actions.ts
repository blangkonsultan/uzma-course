"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import { insertBranch, updateBranchData, toggleBranchStatus } from "@/lib/branches";


export interface BranchActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createBranch(formData: FormData): Promise<BranchActionResponse | void> {
  await requireAdminAction();

  const id = formData.get("id")?.toString().trim().toLowerCase() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const subName = formData.get("sub_name")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const mapEmbedUrl = formData.get("map_embed_url")?.toString().trim() || null;
  const gmapsUrl = formData.get("gmaps_url")?.toString().trim() || null;
  const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
  const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;
  const geofenceRadius = formData.get("geofence_radius_m") ? parseInt(formData.get("geofence_radius_m") as string, 10) : null;

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

  const { error } = await insertBranch({
    id,
    name,
    sub_name: subName,
    address,
    map_embed_url: mapEmbedUrl,
    gmaps_url: gmapsUrl,
    is_active: true,
    latitude,
    longitude,
    geofence_radius_m: geofenceRadius,
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
  await requireAdminAction();

  const name = formData.get("name")?.toString().trim() || "";
  const subName = formData.get("sub_name")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const mapEmbedUrl = formData.get("map_embed_url")?.toString().trim() || null;
  const gmapsUrl = formData.get("gmaps_url")?.toString().trim() || null;
  const isActive = formData.get("is_active") === "true";
  const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
  const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;
  const geofenceRadius = formData.get("geofence_radius_m") ? parseInt(formData.get("geofence_radius_m") as string, 10) : null;
  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Nama cabang minimal 2 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await updateBranchData(id, {
    name,
    sub_name: subName,
    address,
    map_embed_url: mapEmbedUrl,
    gmaps_url: gmapsUrl,
    is_active: isActive,
    updated_at: new Date().toISOString(),
    latitude,
    longitude,
    geofence_radius_m: geofenceRadius,
  });

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
  await requireAdminAction();

  const { error } = await toggleBranchStatus(id, !currentStatus);

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

