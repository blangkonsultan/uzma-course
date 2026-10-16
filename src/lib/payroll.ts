import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type PayrollStatus = "open" | "closed" | "paid";

export type PayrollPeriodRow =
  Database["public"]["Tables"]["payroll_periods"]["Row"];
export type PayrollSessionLineRow =
  Database["public"]["Tables"]["payroll_session_lines"]["Row"];
export type PayrollEntryRow =
  Database["public"]["Tables"]["payroll_entries"]["Row"];
export type PayrollAdjustmentRow =
  Database["public"]["Tables"]["payroll_adjustments"]["Row"];

export interface ProfileAllowanceItem {
  name?: string;
  amount?: number | string;
}

export interface PayrollSessionLineCalculationItem {
  attendance_status: string;
  payable_amount: number;
}

export interface PayrollAdjustmentCalculationItem {
  amount: number;
}

export interface PayrollTotals {
  fee_sessions_total: number;
  fixed_allowances_total: number;
  adjustments_total: number;
  total_amount: number;
}

export interface AddPayrollAdjustmentInput {
  period_id: string;
  teacher_id: string;
  amount: number;
  reason: string;
}

export interface TeacherPayrollStatement {
  period: PayrollPeriodRow;
  entry: PayrollEntryRow | null;
  lines: PayrollSessionLineRow[];
  adjustments: PayrollAdjustmentRow[];
  totals: PayrollTotals;
}

export interface AdminPayrollEntryItem extends PayrollEntryRow {
  teacher: {
    id: string;
    full_name: string;
    phone: string | null;
  };
}

export interface AdminPayrollPeriodDetail {
  period: PayrollPeriodRow;
  entries: AdminPayrollEntryItem[];
  adjustments: PayrollAdjustmentRow[];
  linesCount: number;
  totals: PayrollTotals;
}

export function calculatePayrollTotals(
  lines: PayrollSessionLineCalculationItem[],
  allowances: ProfileAllowanceItem[],
  adjustments: PayrollAdjustmentCalculationItem[]
): PayrollTotals {
  const fee_sessions_total = lines.reduce((sum, line) => {
    return sum + (Number(line.payable_amount) || 0);
  }, 0);

  const fixed_allowances_total = allowances.reduce((sum, allowance) => {
    return sum + (Number(allowance.amount) || 0);
  }, 0);

  const adjustments_total = adjustments.reduce((sum, adjustment) => {
    return sum + (Number(adjustment.amount) || 0);
  }, 0);

  const total_amount =
    fee_sessions_total + fixed_allowances_total + adjustments_total;

  return {
    fee_sessions_total,
    fixed_allowances_total,
    adjustments_total,
    total_amount,
  };
}
export function getWIBMonthFirstDay(targetDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  });
  return `${formatter.format(targetDate)}-01`;
}

export function getWIBNextMonthFirstDay(periodMonth: string): string {
  const parts = periodMonth.split("-").map(Number);
  const y = parts[0] || new Date().getFullYear();
  const m = parts[1] || 1;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  return `${nextY}-${String(nextM).padStart(2, "0")}-01`;
}


export async function getOpenPayrollPeriod(
  periodMonth: string
): Promise<PayrollPeriodRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_periods")
    .select("*")
    .eq("period_month", periodMonth)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca periode payroll terbuka: ${error.message}`);
  }
  return data;
}

export async function createPayrollPeriod(
  _adminId: string,
  periodMonth: string
): Promise<PayrollPeriodRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payroll_periods")
    .insert({
      period_month: periodMonth,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membuat periode payroll: ${error.message}`);
  }
  return data;
}

export async function closePayrollPeriod(
  _adminId: string,
  periodId: string
): Promise<PayrollPeriodRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("close_payroll_period", {
    p_period_id: periodId,
  });

  if (error) {
    throw new Error(`Gagal menutup periode payroll: ${error.message}`);
  }
  return data as PayrollPeriodRow;
}

export async function markPayrollPeriodPaid(
  _adminId: string,
  periodId: string
): Promise<PayrollPeriodRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_payroll_period_paid", {
    p_period_id: periodId,
  });

  if (error) {
    throw new Error(`Gagal menandai payroll dibayar: ${error.message}`);
  }
  return data as PayrollPeriodRow;
}

export async function addPayrollAdjustment(
  _adminId: string,
  input: AddPayrollAdjustmentInput
): Promise<PayrollAdjustmentRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_payroll_adjustment", {
    p_period_id: input.period_id,
    p_teacher_id: input.teacher_id,
    p_amount: input.amount,
    p_reason: input.reason.trim(),
  });

  if (error) {
    throw new Error(`Gagal menambahkan adjustment payroll: ${error.message}`);
  }
  return data as PayrollAdjustmentRow;
}

export async function getPayrollPeriodForAdmin(
  periodId: string
): Promise<AdminPayrollPeriodDetail | null> {
  const supabase = await createClient();

  const { data: period, error: periodError } = await supabase
    .from("payroll_periods")
    .select("*")
    .eq("id", periodId)
    .maybeSingle();

  if (periodError) {
    throw new Error(`Gagal membaca periode payroll: ${periodError.message}`);
  }
  if (!period) return null;

  const [entriesRes, adjustmentsRes, linesCountRes] = await Promise.all([
    supabase
      .from("payroll_entries")
      .select("*, profiles!inner(id, full_name, phone)")
      .eq("period_id", periodId)
      .order("total_amount", { ascending: false }),
    supabase
      .from("payroll_adjustments")
      .select("*")
      .eq("period_id", periodId)
      .order("created_at", { ascending: true }),
    supabase
      .from("payroll_session_lines")
      .select("id", { count: "exact", head: true })
      .eq("period_id", periodId),
  ]);

  if (entriesRes.error) {
    throw new Error(`Gagal membaca entry payroll: ${entriesRes.error.message}`);
  }
  if (adjustmentsRes.error) {
    throw new Error(
      `Gagal membaca adjustment payroll: ${adjustmentsRes.error.message}`
    );
  }

  const entries: AdminPayrollEntryItem[] = (entriesRes.data || []).map(
    (row) => {
      const raw = row as unknown as PayrollEntryRow & {
        profiles: { id: string; full_name: string; phone: string | null };
      };
      return {
        ...raw,
        teacher: raw.profiles,
      };
    }
  );

  const adjustments = adjustmentsRes.data || [];
  const linesCount = linesCountRes.count || 0;

  const totals = entries.reduce(
    (acc, item) => ({
      fee_sessions_total: acc.fee_sessions_total + item.fee_sessions_total,
      fixed_allowances_total:
        acc.fixed_allowances_total + item.fixed_allowances_total,
      adjustments_total: acc.adjustments_total + item.adjustments_total,
      total_amount: acc.total_amount + item.total_amount,
    }),
    {
      fee_sessions_total: 0,
      fixed_allowances_total: 0,
      adjustments_total: 0,
      total_amount: 0,
    }
  );

  return {
    period,
    entries,
    adjustments,
    linesCount,
    totals,
  };
}

export async function getTeacherPayrollStatement(
  teacherId: string,
  periodId: string
): Promise<TeacherPayrollStatement | null> {
  const supabase = await createClient();

  const { data: period, error: periodError } = await supabase
    .from("payroll_periods")
    .select("*")
    .eq("id", periodId)
    .maybeSingle();

  if (periodError) {
    throw new Error(`Gagal membaca periode payroll: ${periodError.message}`);
  }
  if (!period) return null;

  const [entryRes, linesRes, adjustmentsRes] = await Promise.all([
    supabase
      .from("payroll_entries")
      .select("*")
      .eq("period_id", periodId)
      .eq("teacher_id", teacherId)
      .maybeSingle(),
    supabase
      .from("payroll_session_lines")
      .select("*")
      .eq("period_id", periodId)
      .eq("teacher_id", teacherId)
      .order("session_date", { ascending: true }),
    supabase
      .from("payroll_adjustments")
      .select("*")
      .eq("period_id", periodId)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: true }),
  ]);

  if (entryRes.error) {
    throw new Error(`Gagal membaca entry guru: ${entryRes.error.message}`);
  }
  if (linesRes.error) {
    throw new Error(`Gagal membaca detail sesi guru: ${linesRes.error.message}`);
  }
  if (adjustmentsRes.error) {
    throw new Error(
      `Gagal membaca adjustment guru: ${adjustmentsRes.error.message}`
    );
  }

  const entry = entryRes.data;
  const lines = linesRes.data || [];
  const adjustments = adjustmentsRes.data || [];

  const totals: PayrollTotals = entry
    ? {
        fee_sessions_total: entry.fee_sessions_total,
        fixed_allowances_total: entry.fixed_allowances_total,
        adjustments_total: entry.adjustments_total,
        total_amount: entry.total_amount,
      }
    : calculatePayrollTotals(lines, [], adjustments);

  return {
    period,
    entry,
    lines,
    adjustments,
    totals,
  };
}
