"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth";
import {
  triggerCycleInvoiceGeneration,
  recordPayment,
  cancelInvoice,
  type RecordPaymentInput,
  type BillingPaymentRow,
  type BillingInvoiceRow,
} from "@/lib/billing";

export async function generateCycleInvoicesAction(
  branchId?: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  await requireAdminAction();

  try {
    const invoices = await triggerCycleInvoiceGeneration(branchId);
    revalidatePath("/admin/spp");
    return { success: true, count: invoices.length };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Gagal menerbitkan tagihan siklus SPP.",
    };
  }
}

export async function recordPaymentAction(
  input: RecordPaymentInput
): Promise<{ success: boolean; data?: BillingPaymentRow; error?: string }> {
  await requireAdminAction();

  if (!input.invoice_id || !input.payment_method) {
    return {
      success: false,
      error: "ID tagihan dan metode pembayaran wajib diisi.",
    };
  }

  try {
    const payment = await recordPayment(input);
    revalidatePath("/admin/spp");
    return { success: true, data: payment };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Gagal mencatat pembayaran SPP.",
    };
  }
}

export async function cancelInvoiceAction(
  invoiceId: string,
  reason?: string
): Promise<{ success: boolean; data?: BillingInvoiceRow; error?: string }> {
  await requireAdminAction();

  if (!invoiceId) {
    return { success: false, error: "ID tagihan tidak valid." };
  }

  try {
    const invoice = await cancelInvoice(invoiceId, reason);
    revalidatePath("/admin/spp");
    return { success: true, data: invoice };
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Gagal membatalkan tagihan SPP.",
    };
  }
}
