import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export async function getAdminLandingSectionsUpdateDates(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data: rows } = await supabase.from("landing_content").select("section, updated_at");
  const updatedMap: Record<string, string> = {};
  if (rows) {
    for (const r of rows) {
      if (r.updated_at) {
        updatedMap[r.section] = r.updated_at;
      }
    }
  }
  return updatedMap;
}

export async function upsertLandingSection(
  section: string,
  content: unknown,
  userId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error: dbError } = await supabase
    .from("landing_content")
    .upsert({
      section,
      content: content as Exclude<Json, null>,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    });

  if (dbError) {
    return { error: `Gagal menyimpan ke database: ${dbError.message}` };
  }
  return {};
}
