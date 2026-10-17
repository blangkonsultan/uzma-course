import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type BillingInvoiceRow =
  Database["public"]["Tables"]["student_invoices"]["Row"];
export type BillingPaymentRow =
  Database["public"]["Tables"]["student_payments"]["Row"];

export interface StudentInvoiceItem extends BillingInvoiceRow {
  student: {
    id: string;
    full_name: string;
    student_number: string;
    parent_name: string | null;
    parent_phone: string | null;
  };
  program: {
    id: string;
    name: string;
  };
  variant: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  };
  payment: {
    id: string;
    receipt_number: string;
    amount_paid: number;
    payment_date: string;
    payment_method: string;
    payment_reference?: string | null;
    notes?: string | null;
  } | null;
}

export interface BillingKPIs {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  unpaid_students_count: number;
}

export interface BillingSummary {
  invoices: StudentInvoiceItem[];
  kpis: BillingKPIs;
}

export interface RecordPaymentInput {
  invoice_id: string;
  payment_method: "cash" | "transfer_bca" | "transfer_bri" | "transfer_mandiri" | "qris" | "other";
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
}

/**
 * Retrieves student invoices with relations and calculates summary KPIs
 */
export async function getBillingSummary(filters: {
  branchId?: string;
  status?: string;
  search?: string;
}): Promise<BillingSummary> {
  const supabase = await createClient();

  let query = supabase
    .from("student_invoices")
    .select(`
      *,
      student:students(id, full_name, student_number, parent_name, parent_phone),
      program:programs(id, name),
      variant:program_variants(id, name),
      branch:branches(id, name),
      payment:student_payments(id, receipt_number, amount_paid, payment_date, payment_method, payment_reference, notes)
    `)
    .order("period_start", { ascending: false });

  if (filters.branchId && filters.branchId !== "all") {
    query = query.eq("branch_id", filters.branchId);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal membaca daftar tagihan SPP: ${error.message}`);
  }

  let rawInvoices = (data || []) as unknown as StudentInvoiceItem[];

  if (filters.search && filters.search.trim().length > 0) {
    const q = filters.search.toLowerCase().trim();
    rawInvoices = rawInvoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.student?.full_name?.toLowerCase().includes(q) ||
        inv.student?.student_number?.toLowerCase().includes(q) ||
        inv.program?.name?.toLowerCase().includes(q)
    );
  }

  let total_invoiced = 0;
  let total_paid = 0;
  const unpaidStudents = new Set<string>();

  for (const inv of rawInvoices) {
    total_invoiced += Number(inv.total_amount) || 0;
    if (inv.status === "paid") {
      total_paid += Number(inv.payment?.amount_paid || inv.total_amount) || 0;
    } else if (inv.status === "unpaid") {
      unpaidStudents.add(inv.student_id);
    }
  }

  const total_outstanding = Math.max(0, total_invoiced - total_paid);

  return {
    invoices: rawInvoices,
    kpis: {
      total_invoiced,
      total_paid,
      total_outstanding,
      unpaid_students_count: unpaidStudents.size,
    },
  };
}

/**
 * Retrieves full details of a single invoice including student, branch, and payment receipt
 */
export async function getInvoiceDetail(
  invoiceId: string
): Promise<StudentInvoiceItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_invoices")
    .select(`
      *,
      student:students(id, full_name, student_number, parent_name, parent_phone),
      program:programs(id, name),
      variant:program_variants(id, name),
      branch:branches(id, name),
      payment:student_payments(id, receipt_number, amount_paid, payment_date, payment_method, payment_reference, notes)
    `)
    .eq("id", invoiceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal membaca rincian tagihan SPP: ${error.message}`);
  }

  return (data as unknown as StudentInvoiceItem) || null;
}

/**
 * Triggers the automatic rolling 28-day cycle invoice generation
 */
export async function triggerCycleInvoiceGeneration(
  branchId?: string
): Promise<BillingInvoiceRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("generate_due_student_invoices", {
    p_branch_id: branchId || undefined,
  });

  if (error) {
    throw new Error(`Gagal menerbitkan tagihan siklus SPP: ${error.message}`);
  }

  return (data || []) as BillingInvoiceRow[];
}

/**
 * Records payment for an invoice and issues an official receipt
 */
export async function recordPayment(
  input: RecordPaymentInput
): Promise<BillingPaymentRow> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_student_payment", {
    p_invoice_id: input.invoice_id,
    p_payment_method: input.payment_method,
    p_payment_date: input.payment_date || undefined,
    p_payment_reference: input.payment_reference || undefined,
    p_notes: input.notes || undefined,
  });

  if (error) {
    throw new Error(`Gagal mencatat pembayaran SPP: ${error.message}`);
  }

  return data as BillingPaymentRow;
}

/**
 * Cancels an invoice (e.g. if student stopped attending or class cancelled)
 */
export async function cancelInvoice(
  invoiceId: string,
  reason?: string
): Promise<BillingInvoiceRow> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_invoices")
    .update({
      status: "cancelled",
      notes: reason ? `Dibatalkan: ${reason}` : "Dibatalkan oleh Admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal membatalkan tagihan SPP: ${error.message}`);
  }

  return data as BillingInvoiceRow;
}
