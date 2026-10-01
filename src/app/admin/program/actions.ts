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

export interface ProgramActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProgram(formData: FormData): Promise<ProgramActionResponse | void> {
  const { supabase } = await requireAdmin();

  const initials = formData.get("initials")?.toString().trim().toUpperCase();
  const name = formData.get("name")?.toString().trim();
  const tagline = formData.get("tagline")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const ageRange = formData.get("age_range")?.toString().trim() || "";
  const icon = formData.get("icon")?.toString().trim() || "BookOpen";
  const type = (formData.get("type")?.toString().trim() || "original") as "franchise" | "original";
  const logoUrl = formData.get("logo_url")?.toString().trim() || null;
  const licenseProvider = formData.get("license_provider")?.toString().trim() || null;
  const licenseUrl = formData.get("license_url")?.toString().trim() || null;
  const licenseDescription = formData.get("license_description")?.toString().trim() || null;
  const system = formData.get("system")?.toString().trim() || "";
  const duration = parseInt(formData.get("duration")?.toString() || "30", 10);
  const frequency = formData.get("frequency")?.toString().trim() || "";
  const sortOrder = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const rawFeatures = formData.getAll("features").map((f) => f.toString().trim()).filter(Boolean);

  const fieldErrors: Record<string, string> = {};

  if (!initials || initials.length < 2) {
    fieldErrors.initials = "Inisial program minimal 2 karakter (contoh: AHE, ASE).";
  }
  if (!name || name.length < 2) {
    fieldErrors.name = "Nama program minimal 2 karakter.";
  }
  if (isNaN(duration) || duration < 1) {
    fieldErrors.duration = "Durasi harus berupa angka positif (dalam menit).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase.from("programs").insert({
    initials: initials!,
    name: name!,
    tagline,
    description,
    age_range: ageRange,
    icon,
    type,
    logo_url: type === "franchise" ? logoUrl : null,
    license_provider: type === "franchise" ? licenseProvider : null,
    license_url: type === "franchise" ? licenseUrl : null,
    license_description: type === "franchise" ? licenseDescription : null,
    system,
    duration,
    frequency,
    features: rawFeatures,
    sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    is_active: true,
  });

  if (error) {
    if (error.message.includes("programs_initials_key") || error.message.includes("unique")) {
      return { fieldErrors: { initials: "Inisial program sudah digunakan. Gunakan inisial lain." } };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/program");
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin/program?success=" + encodeURIComponent("Program berhasil ditambahkan"));
}

export async function updateProgram(id: string, formData: FormData): Promise<ProgramActionResponse | void> {
  const { supabase } = await requireAdmin();

  const name = formData.get("name")?.toString().trim();
  const tagline = formData.get("tagline")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const ageRange = formData.get("age_range")?.toString().trim() || "";
  const icon = formData.get("icon")?.toString().trim() || "BookOpen";
  const type = (formData.get("type")?.toString().trim() || "original") as "franchise" | "original";
  const logoUrl = formData.get("logo_url")?.toString().trim() || null;
  const licenseProvider = formData.get("license_provider")?.toString().trim() || null;
  const licenseUrl = formData.get("license_url")?.toString().trim() || null;
  const licenseDescription = formData.get("license_description")?.toString().trim() || null;
  const system = formData.get("system")?.toString().trim() || "";
  const duration = parseInt(formData.get("duration")?.toString() || "30", 10);
  const frequency = formData.get("frequency")?.toString().trim() || "";
  const sortOrder = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const rawFeatures = formData.getAll("features").map((f) => f.toString().trim()).filter(Boolean);
  const isActive = formData.get("is_active") === "true";

  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Nama program minimal 2 karakter.";
  }
  if (isNaN(duration) || duration < 1) {
    fieldErrors.duration = "Durasi harus berupa angka positif (dalam menit).";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase
    .from("programs")
    .update({
      name: name!,
      tagline,
      description,
      age_range: ageRange,
      icon,
      type,
      logo_url: type === "franchise" ? logoUrl : null,
      license_provider: type === "franchise" ? licenseProvider : null,
      license_url: type === "franchise" ? licenseUrl : null,
      license_description: type === "franchise" ? licenseDescription : null,
      system,
      duration,
      frequency,
      features: rawFeatures,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/program");
  revalidatePath(`/admin/program/${id}`);
  revalidatePath(`/admin/program/${id}/edit`);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin/program/${id}?success=` + encodeURIComponent("Data program berhasil diperbarui"));
}

export async function toggleProgramActive(id: string, currentStatus: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("programs")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/program");
  revalidatePath(`/admin/program/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
