"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import { insertGuruProfile, updateGuruProfile, toggleGuruStatus } from "@/lib/gurus";

export interface GuruActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createGuru(formData: FormData): Promise<GuruActionResponse | void> {
  await requireAdminAction();

  const fullName = formData.get("full_name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const phone = formData.get("phone")?.toString().trim() || null;
  const birthDate = formData.get("birth_date")?.toString().trim() || null;
  const branchId = formData.get("branch_id")?.toString().trim() || null;
  const programs = formData.getAll("programs").map((p) => p.toString());

  const bankName = formData.get("bank_name")?.toString().trim() || null;
  const bankAccountNumber = formData.get("bank_account_number")?.toString().trim() || null;
  const bankAccountHolder = formData.get("bank_account_holder")?.toString().trim() || null;

  const parseNum = (val: FormDataEntryValue | null) => {
    if (!val) return undefined;
    const n = parseInt(val.toString().replace(/\D/g, ""), 10);
    return isNaN(n) ? undefined : n;
  };

  let allowances = [];
  try {
    allowances = JSON.parse(formData.get("allowances_json")?.toString() || "[]");
  } catch {
    allowances = [];
  }
  const minimumIncome = formData.has("minimum_income") ? parseNum(formData.get("minimum_income")) : null;

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap minimal 2 karakter.";
  }
  if (!email || !email.includes("@")) {
    fieldErrors.email = "Format email tidak valid.";
  }
  if (!password || password.length < 8) {
    fieldErrors.password = "Kata sandi minimal 8 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await insertGuruProfile({
      email,
      password,
      fullName: fullName!,
      phone,
      birthDate,
      branchId,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      allowances,
      minimumIncome,
      programs,
    });
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Gagal menghubungkan ke layanan Supabase.",
    };
  }

  revalidatePath("/admin/guru");
  revalidatePath("/admin");
  redirect("/admin/guru?success=" + encodeURIComponent("Guru berhasil ditambahkan"));
}

export async function updateGuru(id: string, formData: FormData): Promise<GuruActionResponse | void> {
  await requireAdminAction();

  const fullName = formData.get("full_name")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim() || null;
  const birthDate = formData.get("birth_date")?.toString().trim() || null;
  const branchId = formData.get("branch_id")?.toString().trim() || null;
  const programs = formData.getAll("programs").map((p) => p.toString());
  const isActive = formData.get("is_active") === "true";

  const bankName = formData.get("bank_name")?.toString().trim() || null;
  const bankAccountNumber = formData.get("bank_account_number")?.toString().trim() || null;
  const bankAccountHolder = formData.get("bank_account_holder")?.toString().trim() || null;

  const parseNum = (val: FormDataEntryValue | null) => {
    if (!val) return undefined;
    const n = parseInt(val.toString().replace(/\D/g, ""), 10);
    return isNaN(n) ? undefined : n;
  };

  let allowances = [];
  try {
    allowances = JSON.parse(formData.get("allowances_json")?.toString() || "[]");
  } catch {
    allowances = [];
  }
  const minimumIncome = formData.has("minimum_income") ? parseNum(formData.get("minimum_income")) : null;

  const fieldErrors: Record<string, string> = {};

  if (!fullName || fullName.length < 2) {
    fieldErrors.full_name = "Nama lengkap minimal 2 karakter.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await updateGuruProfile(id, {
      fullName: fullName!,
      phone,
      birthDate,
      branchId,
      isActive,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      allowances,
      minimumIncome,
      programs,
    });
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Gagal memperbarui data guru.",
    };
  }

  revalidatePath("/admin/guru");
  revalidatePath(`/admin/guru/${id}/edit`);
  revalidatePath("/admin");
  redirect("/admin/guru?success=" + encodeURIComponent("Data guru berhasil diperbarui"));
}

export async function toggleGuruActive(id: string, currentStatus: boolean) {
  await requireAdminAction();

  try {
    await toggleGuruStatus(id, currentStatus);
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "Gagal mengubah status guru.",
    };
  }

  revalidatePath("/admin/guru");
  revalidatePath("/admin");
  return { success: true };
}
