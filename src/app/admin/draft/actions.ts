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

export interface DraftActionResponse {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createDraft(formData: FormData): Promise<DraftActionResponse | void> {
  const { supabase } = await requireAdmin();

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
  // If setting to active, archive others
  if (status === "active") {
    await supabase
      .from("schedule_drafts")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("branch_id", branchId)
      .eq("status", "active");
  }
  
  const { error } = await supabase.from("schedule_drafts").insert({
    branch_id: branchId,
    name,
    effective_date: effectiveDate,
    status,
  });

  if (error) {
    return { error: `Gagal menyimpan draf: ${error.message}` };
  }

  revalidatePath("/admin/draft");
  redirect("/admin/draft?success=" + encodeURIComponent("Draf berhasil ditambahkan"));
}

export async function updateDraft(id: string, formData: FormData): Promise<DraftActionResponse | void> {
  const { supabase } = await requireAdmin();
  const name = formData.get("name")?.toString().trim() || "";
  const effectiveDate = formData.get("effective_date")?.toString().trim() || null;
  const status = formData.get("status")?.toString().trim() || "draft";

  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Nama draf wajib diisi.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }
  // Fetch the existing draft to get branch_id
  const { data: existingDraft } = await supabase
    .from("schedule_drafts")
    .select("branch_id")
    .eq("id", id)
    .single();

  if (!existingDraft) {
    return { error: "Draf tidak ditemukan" };
  }

  // If setting to active, archive others
  if (status === "active") {
    await supabase
      .from("schedule_drafts")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("branch_id", existingDraft.branch_id)
      .eq("status", "active")
      .neq("id", id);
  }

  const { error } = await supabase
    .from("schedule_drafts")
    .update({
      name,
      effective_date: effectiveDate,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: `Gagal memperbarui draf: ${error.message}` };
  }

  revalidatePath("/admin/draft");
  revalidatePath(`/admin/draft/${id}/edit`);
  redirect("/admin/draft?success=" + encodeURIComponent("Draf berhasil diperbarui"));
}

export async function setDraftActive(id: string, branchId: string) {
  const { supabase } = await requireAdmin();

  // 1. Mark currently active drafts for this branch as archived
  const { error: archiveError } = await supabase
    .from("schedule_drafts")
    .update({ 
        status: "archived",
        updated_at: new Date().toISOString()
    })
    .eq("branch_id", branchId)
    .eq("status", "active");

  if (archiveError) {
    throw new Error(`Gagal mengarsipkan draf lama: ${archiveError.message}`);
  }

  // 2. Set the selected draft to active
  const { error: activateError } = await supabase
    .from("schedule_drafts")
    .update({ 
        status: "active",
        updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (activateError) {
    throw new Error(`Gagal mengaktifkan draf: ${activateError.message}`);
  }

  revalidatePath("/admin/draft");
}
