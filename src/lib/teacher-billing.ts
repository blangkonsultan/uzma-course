import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface StudentOverdueSppInfo {
  due_date: string;
  total_amount: number;
  invoice_count: number;
}

function parseSafeNonNegativeInt(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const num = Number(value);
  if (!Number.isSafeInteger(num) || num < 0) return null;
  return num;
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
      .order("class_id", { ascending: true })
      .order("student_id", { ascending: true })
      .order("program_id", { ascending: true })
      .range(start, start + PAGE_SIZE - 1);

    if (error) {
      console.warn("Gagal membaca ringkasan SPP murid jatuh tempo:", error.message);
      // Discard partial enrichment on error to avoid displaying incomplete balances
      return new Map<string, StudentOverdueSppInfo>();
    }

    const rows = data || [];
    for (const row of rows) {
      const totalAmount = parseSafeNonNegativeInt(row.total_amount);
      const invoiceCount = parseSafeNonNegativeInt(row.invoice_count);

      if (totalAmount === null || invoiceCount === null) {
        console.warn("Nilai agregat SPP tidak valid atau melebihi safe integer:", {
          class_id: row.class_id,
          total_amount: row.total_amount,
          invoice_count: row.invoice_count,
        });
        // Discard entire enrichment to avoid displaying corrupted/rounded monetary amounts
        return new Map<string, StudentOverdueSppInfo>();
      }

      const key = `${row.class_id}:${row.student_id}:${row.program_id}`;
      result.set(key, {
        due_date: row.due_date,
        total_amount: totalAmount,
        invoice_count: invoiceCount,
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
