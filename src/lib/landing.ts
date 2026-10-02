import { createClient } from "@/lib/supabase/server";

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
