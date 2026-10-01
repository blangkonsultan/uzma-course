"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const MAX_SIZE = 512 * 1024; // 512 KB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const BUCKET = "program-logos";

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

export async function uploadProgramLogo(
  programId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { error: "Tidak ada file yang dipilih." };
    if (file.size > MAX_SIZE) return { error: "Ukuran file melebihi 512 KB." };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Format file tidak didukung. Gunakan PNG, JPEG, WebP, atau SVG." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${programId}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) return { error: `Gagal mengunggah: ${error.message}` };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    // Append cache-bust to force browser refresh on re-upload
    return { url: `${urlData.publicUrl}?v=${Date.now()}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah logo.";
    return { error: message };
  }
}

export async function deleteProgramLogo(
  programId: string
): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();

    // List files with the programId prefix to find the exact filename (extension may vary)
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET)
      .list("", {
        search: programId,
      });

    if (listError) return { error: `Gagal mencari file: ${listError.message}` };

    if (files && files.length > 0) {
      const paths = files
        .filter((f) => f.name.startsWith(programId))
        .map((f) => f.name);
      if (paths.length > 0) {
        const { error } = await supabase.storage.from(BUCKET).remove(paths);
        if (error) return { error: `Gagal menghapus: ${error.message}` };
      }
    }

    return {};
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus logo.";
    return { error: message };
  }
}
