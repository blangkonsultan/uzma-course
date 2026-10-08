import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 512 * 1024; // 512 KB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function uploadProgramLogoToStorage(
  programId: string,
  file: File,
  bucket: string = "program-logos"
): Promise<{ url?: string; error?: string }> {
  try {
    if (file.size === 0) return { error: "Tidak ada file yang dipilih." };
    if (file.size > MAX_SIZE) return { error: "Ukuran file melebihi 512 KB." };
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { error: "Format file tidak didukung. Gunakan PNG, JPEG, WebP, atau SVG." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${programId}.${ext}`;

    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) return { error: `Gagal mengunggah: ${error.message}` };

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: `${urlData.publicUrl}?v=${Date.now()}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah logo.";
    return { error: message };
  }
}

export async function deleteProgramLogoFromStorage(
  programId: string,
  bucket: string = "program-logos"
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    
    // List files with the programId prefix to find the exact filename (extension may vary)
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list("", {
        search: programId,
      });

    if (listError) return { error: `Gagal mencari file: ${listError.message}` };

    if (files && files.length > 0) {
      const paths = files
        .filter((f) => f.name.startsWith(programId))
        .map((f) => f.name);
      if (paths.length > 0) {
        const { error } = await supabase.storage.from(bucket).remove(paths);
        if (error) return { error: `Gagal menghapus: ${error.message}` };
      }
    }

    return {};
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus logo.";
    return { error: message };
  }
}
