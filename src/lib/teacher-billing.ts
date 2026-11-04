import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface StudentOverdueSppInfo {
  due_date: string;
  total_amount: number;
  invoice_count: number;
}

export async function getTeacherOverdueSppByClass(
  supabase: SupabaseClient<Database>,
  classIds: readonly string[]
): Promise<Map<string, StudentOverdueSppInfo>> {
  const result = new Map<string, StudentOverdueSppInfo>();
  if (!classIds || classIds.length === 0) {
    return result;
  }

  const PAGE_SIZE = 1000;
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .rpc("get_teacher_overdue_spp", {
        p_class_ids: classIds as string[],
      })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.warn("Gagal membaca ringkasan SPP murid jatuh tempo:", error.message);
      // Discard partial enrichment on error to avoid displaying incomplete balances
      return new Map<string, StudentOverdueSppInfo>();
    }

    const rows = data || [];
    for (const row of rows) {
      const key = `${row.class_id}:${row.student_id}:${row.program_id}`;
      result.set(key, {
        due_date: row.due_date,
        total_amount: Number(row.total_amount) || 0,
        invoice_count: Number(row.invoice_count) || 0,
      });
    }

    if (rows.length < PAGE_SIZE) {
      hasMore = false;
    } else {
      start += PAGE_SIZE;
    }
  }

  return result;
}
