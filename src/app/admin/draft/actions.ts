"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/lib/auth";
import { insertScheduleDraft, updateScheduleDraft, setScheduleDraftActive } from "@/lib/drafts";

export interface DraftActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createDraft(formData: FormData): Promise<DraftActionResponse | void> {
  await requireAdminAction();

  const branchId = formData.get("branch_id")?.toString().trim() || "";
  const name = formData.get("name")?.toString().trim() || "";
  const effectiveDate = formData.get("effective_date")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "draft";

  const fieldErrors: Record<string, string> = {};

  if (!branchId) fieldErrors.branch_id = "Cabang wajib dipilih.";
  if (!name) fieldErrors.name = "Nama draf wajib diisi.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }
  
  try {
    await insertScheduleDraft({
      branch_id: branchId,
      name,
      effective_date: effectiveDate,
      status,
    });
  } catch (error: unknown) {
    return { error: `Gagal menyimpan draf: ${error instanceof Error ? error.message : "Unknown error"}` };
  }

  revalidatePath("/admin/draft");
  redirect("/admin/draft?success=" + encodeURIComponent("Draf berhasil ditambahkan"));
}

export async function updateDraft(id: string, formData: FormData): Promise<DraftActionResponse | void> {
  await requireAdminAction();
  const name = formData.get("name")?.toString().trim() || "";
  const effectiveDate = formData.get("effective_date")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "draft";

  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Nama draf wajib diisi.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  try {
    await updateScheduleDraft(id, {
      name,
      effective_date: effectiveDate,
      status,
      updated_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return { error: `Gagal memperbarui draf: ${error instanceof Error ? error.message : "Unknown error"}` };
  }

  revalidatePath("/admin/draft");
  revalidatePath(`/admin/draft/${id}/edit`);
  redirect("/admin/draft?success=" + encodeURIComponent("Draf berhasil diperbarui"));
}

export async function setDraftActive(id: string) {
  await requireAdminAction();

  try {
    await setScheduleDraftActive(id);
  } catch (error: unknown) {
    throw new Error(`Gagal mengaktifkan draf: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  revalidatePath("/admin/draft");
}
