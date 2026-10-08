"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import { insertProgram, updateProgramData, updateProgramStatus } from "@/lib/programs";

export interface ProgramActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createProgram(formData: FormData): Promise<ProgramActionResponse | void> {
  await requireAdminAction();

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
  const variantsJson = formData.get("variants_json")?.toString() || "[]";
  const sortOrder = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const rawFeatures = formData.getAll("features").map((f) => f.toString().trim()).filter(Boolean);

  let variants = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    variants = [];
  }

  const fieldErrors: Record<string, string> = {};

  if (!initials || initials.length < 2) {
    fieldErrors.initials = "Inisial program minimal 2 karakter (contoh: AHE, ASE).";
  }
  if (!name || name.length < 2) {
    fieldErrors.name = "Nama program minimal 2 karakter.";
  }
  if (variants.length === 0) {
    fieldErrors.variants = "Minimal harus ada 1 varian program.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const programDataToInsert = {
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
    features: rawFeatures,
    sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    is_active: true,
  };

  const variantsToInsert = variants.map((v: Record<string, unknown>, idx: number) => ({
    name: typeof v.name === "string" ? v.name : "",
    duration: typeof v.duration === "number" ? v.duration : 30,
    frequency: typeof v.frequency === "number" ? v.frequency : 3,
    system: typeof v.system === "number" ? v.system : 2,
    teacher_fee: typeof v.teacher_fee === "number" ? v.teacher_fee : 0,
    default_spp: typeof v.default_spp === "number" ? v.default_spp : 0,
    sort_order: typeof v.sort_order === "number" ? v.sort_order : idx,
    is_active: typeof v.is_active === "boolean" ? v.is_active : true,
    show_on_landing: typeof v.show_on_landing === "boolean" ? v.show_on_landing : true,
  }));

  const { error } = await insertProgram(programDataToInsert, variantsToInsert);

  if (error) {
    if (error.message?.includes("programs_initials_key") || error.message?.includes("unique")) {
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
  await requireAdminAction();

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
  const sortOrder = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const variantsJson = formData.get("variants_json")?.toString() || "[]";
  const rawFeatures = formData.getAll("features").map((f) => f.toString().trim()).filter(Boolean);
  const isActive = formData.get("is_active") === "true";

  let variants = [];
  try {
    variants = JSON.parse(variantsJson);
  } catch {
    variants = [];
  }

  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2) {
    fieldErrors.name = "Nama program minimal 2 karakter.";
  }
  if (variants.length === 0) {
    fieldErrors.variants = "Minimal harus ada 1 varian program.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const programDataToUpdate = {
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
    features: rawFeatures,
    sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };

  const variantsToUpsert = variants.map((v: Record<string, unknown>, idx: number) => {
    const isNew = typeof v.id === "string" && v.id.startsWith("new-");
    return {
      ...(isNew ? {} : { id: v.id }),
      program_id: id,
      name: typeof v.name === "string" ? v.name : "",
      duration: typeof v.duration === "number" ? v.duration : 30,
      frequency: typeof v.frequency === "number" ? v.frequency : 3,
      system: typeof v.system === "number" ? v.system : 2,
      teacher_fee: typeof v.teacher_fee === "number" ? v.teacher_fee : 0,
      default_spp: typeof v.default_spp === "number" ? v.default_spp : 0,
      sort_order: typeof v.sort_order === "number" ? v.sort_order : idx,
      is_active: typeof v.is_active === "boolean" ? v.is_active : true,
      show_on_landing: typeof v.show_on_landing === "boolean" ? v.show_on_landing : true,
    };
  });

  const activeVariantIds = variantsToUpsert
    .filter((v: Record<string, unknown>) => typeof v.id === "string")
    .map((v: Record<string, unknown>) => v.id as string);

  const { error } = await updateProgramData(
    id,
    programDataToUpdate,
    variantsToUpsert,
    activeVariantIds
  );

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
  await requireAdminAction();

  const { error } = await updateProgramStatus(id, !currentStatus);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/program");
  revalidatePath(`/admin/program/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
