"use server";

import { requireAdminAction } from "@/lib/auth";
import { uploadProgramLogoToStorage, deleteProgramLogoFromStorage } from "@/lib/storage";

export async function uploadProgramLogo(
  programId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    await requireAdminAction();

    const file = formData.get("file") as File | null;
    if (!file) return { error: "Tidak ada file yang dipilih." };

    return await uploadProgramLogoToStorage(programId, file);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah logo.";
    return { error: message };
  }
}

export async function deleteProgramLogo(
  programId: string
): Promise<{ error?: string }> {
  try {
    await requireAdminAction();
    return await deleteProgramLogoFromStorage(programId);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus logo.";
    return { error: message };
  }
}
